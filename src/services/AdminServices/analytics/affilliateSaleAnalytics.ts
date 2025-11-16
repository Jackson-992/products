import {supabase} from "@/services/supabase.ts";

export interface AffiliateSalesAnalytics {
    totalSalesRevenue: number;
    totalCommissionPaid: number;
    totalCommissionPending: number;
    netRevenue: number;
    totalOrders: number;
    topAffiliates: TopAffiliate[];
    topProducts: TopProduct[];
    salesTrends: SalesTrend[];
    recentSales: RecentSale[];
}

export interface TopAffiliate {
    affiliateCode: string;
    totalSales: number;
    totalOrders: number;
    totalCommission: number;
    commissionPaid: number;
    commissionPending: number;
    conversionRate: number;
}

export interface TopProduct {
    productId: number;
    productName: string;
    productSku: string | null;
    totalQuantitySold: number;
    totalRevenue: number;
    totalCommission: number;
    numberOfAffiliates: number;
}

export interface SalesTrend {
    month: string;
    totalSales: number;
    totalCommission: number;
    totalOrders: number;
}

export interface RecentSale {
    id: number;
    affiliateCode: string;
    orderId: number;
    productName: string;
    saleAmount: number;
    commissionAmount: number;
    status: string;
    createdAt: string;
}

export class AffiliateSalesAnalyticsService {

    async getAnalytics(): Promise<AffiliateSalesAnalytics> {
        const [
            salesCommissionData,
            orderItemsData,
            topAffiliates,
            topProducts,
            salesTrends,
            recentSales
        ] = await Promise.all([
            this.getSalesCommissionData(),
            this.getOrderItemsData(),
            this.getTopAffiliates(),
            this.getTopProducts(),
            this.getSalesTrends(),
            this.getRecentSales()
        ]);

        const totalSalesRevenue = salesCommissionData.totalRevenue;
        const totalCommissionPaid = salesCommissionData.paidCommission;
        const totalCommissionPending = salesCommissionData.pendingCommission;
        const netRevenue = totalSalesRevenue - totalCommissionPaid;
        const totalOrders = salesCommissionData.totalOrders;

        return {
            totalSalesRevenue,
            totalCommissionPaid,
            totalCommissionPending,
            netRevenue,
            totalOrders,
            topAffiliates,
            topProducts,
            salesTrends,
            recentSales
        };
    }

    private async getSalesCommissionData(): Promise<{
        totalRevenue: number;
        paidCommission: number;
        pendingCommission: number;
        totalOrders: number;
    }> {
        const { data, error } = await supabase
            .from('sales_commission')
            .select('sale_amount, commission_amount, status');

        if (error) throw error;

        let totalRevenue = 0;
        let paidCommission = 0;
        let pendingCommission = 0;
        const uniqueOrders = new Set<number>();

        data?.forEach(record => {
            totalRevenue += Number(record.sale_amount) || 0;

            if (record.status === 'completed' || record.status === 'paid') {
                paidCommission += Number(record.commission_amount) || 0;
            } else if (record.status === 'pending') {
                pendingCommission += Number(record.commission_amount) || 0;
            }
        });

        // Get unique order count
        const { data: orderData, error: orderError } = await supabase
            .from('sales_commission')
            .select('order_id');

        if (!orderError && orderData) {
            orderData.forEach(record => uniqueOrders.add(record.order_id));
        }

        return {
            totalRevenue,
            paidCommission,
            pendingCommission,
            totalOrders: uniqueOrders.size
        };
    }


    private async getOrderItemsData(): Promise<{
        totalQuantity: number;
        totalValue: number;
    }> {
        const { data, error } = await supabase
            .from('order_items')
            .select('quantity, price, affiliate_code')
            .not('affiliate_code', 'is', null);

        if (error) throw error;

        let totalQuantity = 0;
        let totalValue = 0;

        data?.forEach(item => {
            totalQuantity += item.quantity || 0;
            totalValue += (item.quantity || 0) * (Number(item.price) || 0);
        });

        return { totalQuantity, totalValue };
    }

    private async getTopAffiliates(limit: number = 10): Promise<TopAffiliate[]> {
        const { data: salesData, error } = await supabase
            .from('sales_commission')
            .select('affiliate_code, sale_amount, commission_amount, status, order_id');

        if (error) throw error;

        // Aggregate by affiliate
        const affiliateMap = new Map<string, {
            totalSales: number;
            orderIds: Set<number>;
            totalCommission: number;
            commissionPaid: number;
            commissionPending: number;
        }>();

        salesData?.forEach(record => {
            const code = record.affiliate_code;
            const existing = affiliateMap.get(code) || {
                totalSales: 0,
                orderIds: new Set<number>(),
                totalCommission: 0,
                commissionPaid: 0,
                commissionPending: 0
            };

            existing.totalSales += Number(record.sale_amount) || 0;
            existing.orderIds.add(record.order_id);
            existing.totalCommission += Number(record.commission_amount) || 0;

            if (record.status === 'completed' || record.status === 'paid') {
                existing.commissionPaid += Number(record.commission_amount) || 0;
            } else if (record.status === 'pending') {
                existing.commissionPending += Number(record.commission_amount) || 0;
            }

            affiliateMap.set(code, existing);
        });

        // Convert to array and calculate conversion rates
        const affiliates: TopAffiliate[] = Array.from(affiliateMap.entries()).map(([code, data]) => ({
            affiliateCode: code,
            totalSales: data.totalSales,
            totalOrders: data.orderIds.size,
            totalCommission: data.totalCommission,
            commissionPaid: data.commissionPaid,
            commissionPending: data.commissionPending,
            conversionRate: data.orderIds.size > 0 ? (data.totalSales / data.orderIds.size) : 0
        }));

        // Sort by total sales and return top performers
        return affiliates
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, limit);
    }

    /**
     * Get top selling products through affiliates
     */
    private async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
        const { data, error } = await supabase
            .from('order_items')
            .select('product_id, product_name, product_sku, quantity, price, commission_earned, affiliate_code')
            .not('affiliate_code', 'is', null);

        if (error) throw error;

        // Aggregate by product
        const productMap = new Map<number, {
            productName: string;
            productSku: string | null;
            totalQuantity: number;
            totalRevenue: number;
            totalCommission: number;
            affiliates: Set<string>;
        }>();

        data?.forEach(item => {
            if (!item.product_id) return;

            const existing = productMap.get(item.product_id) || {
                productName: item.product_name || 'Unknown Product',
                productSku: item.product_sku,
                totalQuantity: 0,
                totalRevenue: 0,
                totalCommission: 0,
                affiliates: new Set<string>()
            };

            existing.totalQuantity += item.quantity || 0;
            existing.totalRevenue += (item.quantity || 0) * (Number(item.price) || 0);
            existing.totalCommission += Number(item.commission_earned) || 0;

            if (item.affiliate_code) {
                existing.affiliates.add(item.affiliate_code);
            }

            productMap.set(item.product_id, existing);
        });

        // Convert to array
        const products: TopProduct[] = Array.from(productMap.entries()).map(([productId, data]) => ({
            productId,
            productName: data.productName,
            productSku: data.productSku,
            totalQuantitySold: data.totalQuantity,
            totalRevenue: data.totalRevenue,
            totalCommission: data.totalCommission,
            numberOfAffiliates: data.affiliates.size
        }));

        // Sort by total revenue
        return products
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, limit);
    }

    /**
     * Get sales trends for the past 12 months
     */
    private async getSalesTrends(): Promise<SalesTrend[]> {
        const { data, error } = await supabase
            .from('sales_commission')
            .select('sale_amount, commission_amount, order_id, created_at')
            .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        // Group by month
        const monthMap = new Map<string, {
            totalSales: number;
            totalCommission: number;
            orderIds: Set<number>;
        }>();

        data?.forEach(record => {
            const month = new Date(record.created_at).toISOString().slice(0, 7);
            const existing = monthMap.get(month) || {
                totalSales: 0,
                totalCommission: 0,
                orderIds: new Set<number>()
            };

            existing.totalSales += Number(record.sale_amount) || 0;
            existing.totalCommission += Number(record.commission_amount) || 0;
            existing.orderIds.add(record.order_id);

            monthMap.set(month, existing);
        });

        // Convert to array and sort
        return Array.from(monthMap.entries())
            .map(([month, data]) => ({
                month,
                totalSales: data.totalSales,
                totalCommission: data.totalCommission,
                totalOrders: data.orderIds.size
            }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-12);
    }

    /**
     * Get recent sales
     */
    private async getRecentSales(limit: number = 20): Promise<RecentSale[]> {
        const { data, error } = await supabase
            .from('sales_commission')
            .select('id, affiliate_code, order_id, sale_amount, commission_amount, status, created_at, product_id')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // Get product names from order_items
        const productIds = data?.map(d => d.product_id).filter(Boolean) || [];
        const orderIds = data?.map(d => d.order_id).filter(Boolean) || [];

        const { data: orderItems } = await supabase
            .from('order_items')
            .select('order_id, product_name, product_id')
            .in('order_id', orderIds);

        const productNameMap = new Map<string, string>();
        orderItems?.forEach(item => {
            const key = `${item.order_id}-${item.product_id}`;
            productNameMap.set(key, item.product_name || 'Unknown Product');
        });

        return data?.map(record => {
            const key = `${record.order_id}-${record.product_id}`;
            return {
                id: record.id,
                affiliateCode: record.affiliate_code,
                orderId: record.order_id,
                productName: productNameMap.get(key) || 'Product',
                saleAmount: Number(record.sale_amount) || 0,
                commissionAmount: Number(record.commission_amount) || 0,
                status: record.status || 'pending',
                createdAt: record.created_at
            };
        }) || [];
    }
}

// Export singleton instance
export const affiliateSalesAnalyticsService = new AffiliateSalesAnalyticsService();