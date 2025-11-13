import { supabase } from '../supabase.ts';

export const getSalesCommissions = async (affiliateCode, status = null) => {
    try {
        let query = supabase
            .from('sales_commission')
            .select('*')
            .eq('affiliate_code', affiliateCode)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching sales commissions:', error);
        return { data: null, error };
    }
};

export const getSalesWithProducts = async (affiliateCode, status = null) => {
    try {
        // First get sales commissions
        const { data: commissions, error: commissionsError } = await getSalesCommissions(affiliateCode, status);

        if (commissionsError) throw commissionsError;

        if (!commissions || commissions.length === 0) {
            return { data: [], error: null };
        }

        // Get unique product IDs from commissions
        const productIds = [...new Set(commissions.map(c => c.product_id))];

        // Fetch product details from order_items
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('product_id, product_name, product_sku, color, size')
            .in('product_id', productIds);

        if (itemsError) throw itemsError;

        // Create a map of product details for quick lookup
        const productMap = {};
        orderItems?.forEach(item => {
            if (!productMap[item.product_id]) {
                productMap[item.product_id] = {
                    name: item.product_name,
                    sku: item.product_sku,
                    color: item.color,
                    size: item.size
                };
            }
        });

        // Merge commission data with product details
        const enrichedCommissions = commissions.map(commission => ({
            ...commission,
            productName: productMap[commission.product_id]?.name || 'Unknown Product',
            productSku: productMap[commission.product_id]?.sku || null,
            productColor: productMap[commission.product_id]?.color || null,
            productSize: productMap[commission.product_id]?.size || null
        }));

        return { data: enrichedCommissions, error: null };
    } catch (error) {
        console.error('Error fetching sales with products:', error);
        return { data: null, error };
    }
};

export const getFormattedSales = async (affiliateCode) => {
    try {
        const { data: sales, error } = await getSalesWithProducts(affiliateCode);

        if (error) throw error;

        // Format data for UI
        const formattedData = sales.map(sale => {
            // Build product display name
            let productDisplay = sale.productName;
            if (sale.productColor || sale.productSize) {
                const variants = [];
                if (sale.productColor) variants.push(sale.productColor);
                if (sale.productSize) variants.push(sale.productSize);
                productDisplay += ` (${variants.join(', ')})`;
            }

            return {
                id: sale.id,
                product: productDisplay,
                productName: sale.productName,
                productSku: sale.productSku,
                orderId: sale.order_id,
                date: new Date(sale.created_at).toISOString().split('T')[0],
                saleAmount: `Ksh ${parseFloat(sale.sale_amount || 0).toFixed(2)}`,
                amount: `Ksh ${parseFloat(sale.commission_amount || 0).toFixed(2)}`,
                status: sale.status.charAt(0).toUpperCase() + sale.status.slice(1),
                paidAt: sale.paid_at ? new Date(sale.paid_at).toISOString().split('T')[0] : null
            };
        });

        return { data: formattedData, error: null };
    } catch (error) {
        console.error('Error formatting sales:', error);
        return { data: null, error };
    }
};

export const getSalesStats = async (affiliateCode) => {
    try {
        // Get all sales commissions
        const { data: commissions, error: commissionsError } = await supabase
            .from('sales_commission')
            .select('commission_amount, sale_amount, status')
            .eq('affiliate_code', affiliateCode);

        if (commissionsError) throw commissionsError;

        // Calculate statistics
        const totalSales = commissions.length;
        const completedSales = commissions.filter(c => c.status === 'completed').length;
        const pendingSales = commissions.filter(c => c.status === 'pending').length;

        const totalCommissionEarnings = commissions
            .filter(c => c.status === 'completed')
            .reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0);

        const pendingCommissionEarnings = commissions
            .filter(c => c.status === 'pending')
            .reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0);

        const totalSalesValue = commissions
            .filter(c => c.status === 'completed')
            .reduce((sum, c) => sum + parseFloat(c.sale_amount || 0), 0);

        return {
            data: {
                totalSales,
                completedSales,
                pendingSales,
                totalCommissionEarnings,
                pendingCommissionEarnings,
                totalSalesValue
            },
            error: null
        };
    } catch (error) {
        console.error('Error calculating sales stats:', error);
        return { data: null, error };
    }
};

export const getSalesByDateRange = async (affiliateCode, startDate, endDate) => {
    try {
        const { data, error } = await supabase
            .from('sales_commission')
            .select('*')
            .eq('affiliate_code', affiliateCode)
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching sales by date range:', error);
        return { data: null, error };
    }
};

export const getRecentSales = async (affiliateCode, limit = 10) => {
    try {
        const { data: commissions, error: commissionsError } = await supabase
            .from('sales_commission')
            .select('*')
            .eq('affiliate_code', affiliateCode)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (commissionsError) throw commissionsError;

        if (!commissions || commissions.length === 0) {
            return { data: [], error: null };
        }

        // Get product details
        const productIds = [...new Set(commissions.map(c => c.product_id))];

        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('product_id, product_name')
            .in('product_id', productIds);

        if (itemsError) throw itemsError;

        const productMap = {};
        orderItems?.forEach(item => {
            productMap[item.product_id] = item.product_name;
        });

        const enrichedSales = commissions.map(sale => ({
            ...sale,
            productName: productMap[sale.product_id] || 'Unknown Product'
        }));

        return { data: enrichedSales, error: null };
    } catch (error) {
        console.error('Error fetching recent sales:', error);
        return { data: null, error };
    }
};

export const getSalesPerformance = async (affiliateCode) => {
    try {
        const { data: stats, error: statsError } = await getSalesStats(affiliateCode);
        if (statsError) throw statsError;

        // Calculate conversion rate and average commission
        const conversionRate = stats.totalSales > 0
            ? (stats.completedSales / stats.totalSales * 100).toFixed(2)
            : 0;

        const averageCommission = stats.completedSales > 0
            ? (stats.totalCommissionEarnings / stats.completedSales).toFixed(2)
            : 0;

        const averageSaleValue = stats.completedSales > 0
            ? (stats.totalSalesValue / stats.completedSales).toFixed(2)
            : 0;

        return {
            data: {
                ...stats,
                conversionRate,
                averageCommission,
                averageSaleValue
            },
            error: null
        };
    } catch (error) {
        console.error('Error calculating sales performance:', error);
        return { data: null, error };
    }
};

export default {
    getSalesCommissions,
    getSalesWithProducts,
    getFormattedSales,
    getSalesStats,
    getSalesByDateRange,
    getRecentSales,
    getSalesPerformance
};