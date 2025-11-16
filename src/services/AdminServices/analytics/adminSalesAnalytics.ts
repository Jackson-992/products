// salesAnalyticsService.js
import { supabase } from '../../supabase.ts'; // Adjust import path as needed

export const salesAnalyticsService = {
    /**
     * Get total revenue/income
     */
    async getTotalIncome(startDate = null, endDate = null) {
        try {
            let query = supabase
                .from('orders')
                .select('total_amount')
                .eq('status', 'completed');

            if (startDate) query = query.gte('created_at', startDate);
            if (endDate) query = query.lte('created_at', endDate);

            const { data, error } = await query;

            if (error) throw error;

            const total = data.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
            return { success: true, total };
        } catch (error) {
            console.error('Error fetching total income:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get total products sold (quantity)
     */
    async getTotalProductsSold(startDate = null, endDate = null) {
        try {
            let query = supabase
                .from('order_items')
                .select('quantity, order_id, orders!inner(status, created_at)')
                .eq('orders.status', 'completed');

            if (startDate) query = query.gte('orders.created_at', startDate);
            if (endDate) query = query.lte('orders.created_at', endDate);

            const { data, error } = await query;

            if (error) throw error;

            const total = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
            return { success: true, total };
        } catch (error) {
            console.error('Error fetching total products sold:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get total number of orders
     */
    async getTotalOrders(startDate = null, endDate = null) {
        try {
            let query = supabase
                .from('orders')
                .select('id', { count: 'exact' })
                .eq('status', 'completed');

            if (startDate) query = query.gte('created_at', startDate);
            if (endDate) query = query.lte('created_at', endDate);

            const { count, error } = await query;

            if (error) throw error;

            return { success: true, total: count };
        } catch (error) {
            console.error('Error fetching total orders:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get average order value
     */
    async getAverageOrderValue(startDate = null, endDate = null) {
        try {
            const incomeResult = await this.getTotalIncome(startDate, endDate);
            const ordersResult = await this.getTotalOrders(startDate, endDate);

            if (!incomeResult.success || !ordersResult.success) {
                throw new Error('Failed to calculate average order value');
            }

            const average = ordersResult.total > 0 ? incomeResult.total / ordersResult.total : 0;
            return { success: true, average };
        } catch (error) {
            console.error('Error calculating average order value:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get top performing products
     */
    async getTopProducts(limit = 10, startDate = null, endDate = null) {
        try {
            let query = supabase
                .from('order_items')
                .select('product_id, product_name, quantity, price, orders!inner(status, created_at)')
                .eq('orders.status', 'completed');

            if (startDate) query = query.gte('orders.created_at', startDate);
            if (endDate) query = query.lte('orders.created_at', endDate);

            const { data, error } = await query;

            if (error) throw error;

            // Aggregate by product
            const productMap = {};
            data.forEach(item => {
                const id = item.product_id;
                if (!productMap[id]) {
                    productMap[id] = {
                        product_id: id,
                        product_name: item.product_name || 'Unknown Product',
                        total_quantity: 0,
                        total_revenue: 0,
                        order_count: 0
                    };
                }
                productMap[id].total_quantity += item.quantity;
                productMap[id].total_revenue += parseFloat(item.price) * item.quantity;
                productMap[id].order_count += 1;
            });

            const products = Object.values(productMap)
                .sort((a, b) => b.total_revenue - a.total_revenue)
                .slice(0, limit);

            return { success: true, products };
        } catch (error) {
            console.error('Error fetching top products:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get monthly sales trend
     */
    async getMonthlySalesTrend(months = 12) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const { data, error } = await supabase
                .from('orders')
                .select('total_amount, created_at')
                .eq('status', 'completed')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Group by month
            const monthlyData = {};
            data.forEach(order => {
                const date = new Date(order.created_at);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        month: monthKey,
                        revenue: 0,
                        orders: 0
                    };
                }
                monthlyData[monthKey].revenue += parseFloat(order.total_amount);
                monthlyData[monthKey].orders += 1;
            });

            const trend = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

            return { success: true, trend };
        } catch (error) {
            console.error('Error fetching monthly sales trend:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get sales by category
     */
    async getSalesByCategory(startDate = null, endDate = null) {
        try {
            // First get all completed order IDs
            let orderQuery = supabase
                .from('orders')
                .select('id')
                .eq('status', 'completed');

            if (startDate) orderQuery = orderQuery.gte('created_at', startDate);
            if (endDate) orderQuery = orderQuery.lte('created_at', endDate);

            const { data: orders, error: orderError } = await orderQuery;

            if (orderError) throw orderError;

            const orderIds = orders.map(o => o.id);

            if (orderIds.length === 0) {
                return { success: true, categories: [] };
            }

            // Get order items with product info
            const { data: orderItems, error: itemError } = await supabase
                .from('order_items')
                .select('product_id, quantity, price')
                .in('order_id', orderIds);

            if (itemError) throw itemError;

            // Get unique product IDs
            const productIds = [...new Set(orderItems.map(item => item.product_id).filter(id => id))];

            if (productIds.length === 0) {
                return { success: true, categories: [] };
            }

            // Get products with categories
            const { data: products, error: productError } = await supabase
                .from('products')
                .select('id, category')
                .in('id', productIds);

            if (productError) throw productError;

            // Create product category map
            const productCategoryMap = {};
            products.forEach(p => {
                productCategoryMap[p.id] = p.category || 'Uncategorized';
            });

            // Aggregate by category
            const categoryMap = {};
            orderItems.forEach(item => {
                const category = productCategoryMap[item.product_id] || 'Uncategorized';
                if (!categoryMap[category]) {
                    categoryMap[category] = {
                        category,
                        revenue: 0,
                        quantity: 0
                    };
                }
                categoryMap[category].revenue += parseFloat(item.price) * item.quantity;
                categoryMap[category].quantity += item.quantity;
            });

            const categories = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

            return { success: true, categories };
        } catch (error) {
            console.error('Error fetching sales by category:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get recent orders
     */
    async getRecentOrders(limit = 10) {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('id, total_amount, status, created_at, payment_completion, phone_number')
                .eq('status', 'completed')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return { success: true, orders: data };
        } catch (error) {
            console.error('Error fetching recent orders:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get daily sales for the last N days
     */
    async getDailySales(days = 30) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data, error } = await supabase
                .from('orders')
                .select('total_amount, created_at')
                .eq('status', 'completed')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            const dailyData = {};
            data.forEach(order => {
                const date = new Date(order.created_at).toISOString().split('T')[0];
                if (!dailyData[date]) {
                    dailyData[date] = { date, revenue: 0, orders: 0 };
                }
                dailyData[date].revenue += parseFloat(order.total_amount);
                dailyData[date].orders += 1;
            });

            const sales = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

            return { success: true, sales };
        } catch (error) {
            console.error('Error fetching daily sales:', error);
            return { success: false, error: error.message };
        }
    }
};