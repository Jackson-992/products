import { supabase } from '../../supabase.ts';

class SalesCommissionService {
    async getAllSalesCommissions() {
        try {
            const { data, error } = await supabase
                .from('sales_commission')
                .select(`
          *,
          products!inner (
            name,
            price,
            originalprice,
            category
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(commission => ({
                id: commission.id,
                payment_id: `SC-${commission.id}`,
                affiliate_code: commission.affiliate_code,
                amount: commission.commission_amount || 0,
                status: commission.status || 'pending',
                created_at: commission.created_at,
                type: 'sales_commission',
                details: {
                    product_id: commission.product_id,
                    product_name: commission.products.name,
                    product_price: commission.products.price,
                    original_price: commission.products.originalprice,
                    category: commission.products.category,
                    order_id: commission.order_id,
                    sale_amount: commission.sale_amount || 0,
                    commission_amount: commission.commission_amount || 0,
                    commission_rate: this.calculateCommissionRate(commission.sale_amount, commission.commission_amount),
                    sale_date: commission.created_at,
                    quantity: 1,
                    unit_price: commission.sale_amount || commission.products.price || 0
                }
            }));

        } catch (error) {
            console.error('Error fetching sales commissions:', error);
            throw error;
        }
    }

    async getSalesCommissionById(id) {
        try {
            const { data, error } = await supabase
                .from('sales_commission')
                .select(`
          *,
          products!inner (
            name,
            price,
            originalprice,
            category
          )
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            return this.transformCommissionData(data);
        } catch (error) {
            console.error('Error fetching sales commission:', error);
            throw error;
        }
    }

    async getSalesCommissionsByAffiliateCode(affiliateCode) {
        try {
            const { data, error } = await supabase
                .from('sales_commission')
                .select(`
          *,
          products!inner (
            name,
            price,
            originalprice,
            category
          )
        `)
                .eq('affiliate_code', affiliateCode)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(commission => this.transformCommissionData(commission));
        } catch (error) {
            console.error('Error fetching sales commissions by affiliate code:', error);
            throw error;
        }
    }

    async getSalesCommissionsByStatus(status) {
        try {
            const { data, error } = await supabase
                .from('sales_commission')
                .select(`
          *,
          products!inner (
            name,
            price,
            originalprice,
            category
          )
        `)
                .eq('status', status)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(commission => this.transformCommissionData(commission));
        } catch (error) {
            console.error('Error fetching sales commissions by status:', error);
            throw error;
        }
    }

    // Helper function to calculate commission rate
    calculateCommissionRate(saleAmount, commissionAmount) {
        if (!saleAmount || saleAmount === 0) return '0';
        return ((commissionAmount / saleAmount) * 100).toFixed(2);
    }

    // Transform commission data with product details
    transformCommissionData(commission) {
        return {
            id: commission.id,
            payment_id: `SC-${commission.id}`,
            affiliate_code: commission.affiliate_code,
            amount: commission.commission_amount || 0,
            status: commission.status || 'pending',
            created_at: commission.created_at,
            type: 'sales_commission',
            details: {
                product_id: commission.product_id,
                product_name: commission.products?.name || `Product ${commission.product_id}`,
                product_price: commission.products?.price || 0,
                original_price: commission.products?.originalprice || 0,
                category: commission.products?.category || 'Unknown',
                order_id: commission.order_id,
                sale_amount: commission.sale_amount || 0,
                commission_amount: commission.commission_amount || 0,
                commission_rate: this.calculateCommissionRate(commission.sale_amount, commission.commission_amount),
                sale_date: commission.created_at,
                quantity: 1,
                unit_price: commission.sale_amount || commission.products?.price || 0
            }
        };
    }
}

export default new SalesCommissionService();