import { supabase } from '../../supabase.ts';

class WithdrawalService {
    async getAllWithdrawals() {
        try {
            const { data, error } = await supabase
                .from('withdrawals')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to match your component's expected format
            return data.map(withdrawal => ({
                id: withdrawal.id,
                payment_id: `WD-${withdrawal.id}`,
                affiliate_code: withdrawal.affiliate_code,
                amount: withdrawal.amount || 0,
                status: withdrawal.status || 'pending',
                created_at: withdrawal.created_at,
                processed_at: withdrawal.processed_at,
                type: 'withdrawal',
                // Add details object that PaymentDetails expects
                details: {
                    phone_number: withdrawal.phone_number,
                    reason_of_status: withdrawal.reason_of_status,
                    processed_at: withdrawal.processed_at,
                    processed_by: withdrawal.processed_by
                }
            }));

        } catch (error) {
            console.error('Error fetching withdrawals:', error);
            throw error;
        }
    }

    async getWithdrawalById(id) {
        try {
            const { data, error } = await supabase
                .from('withdrawals')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            return this.transformWithdrawalData(data);
        } catch (error) {
            console.error('Error fetching withdrawal:', error);
            throw error;
        }
    }

    async getWithdrawalsByAffiliateCode(affiliateCode) {
        try {
            const { data, error } = await supabase
                .from('withdrawals')
                .select('*')
                .eq('affiliate_code', affiliateCode)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(withdrawal => this.transformWithdrawalData(withdrawal));
        } catch (error) {
            console.error('Error fetching withdrawals by affiliate code:', error);
            throw error;
        }
    }

    async getWithdrawalsByStatus(status) {
        try {
            const { data, error } = await supabase
                .from('withdrawals')
                .select('*')
                .eq('status', status)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(withdrawal => this.transformWithdrawalData(withdrawal));
        } catch (error) {
            console.error('Error fetching withdrawals by status:', error);
            throw error;
        }
    }

    // Update withdrawal status with reason
    async updateWithdrawalStatus(id, status, reason_of_status = null) {
        try {
            const updateData = {
                status,
                reason_of_status
            };

            // If status is completed or failed, set processed_at to current timestamp
            if (status === 'completed' || status === 'failed') {
                updateData.processed_at = new Date().toISOString();
                // You might want to set processed_by to the current admin/user ID
                // updateData.processed_by = currentUserId;
            }

            const { data, error } = await supabase
                .from('withdrawals')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return this.transformWithdrawalData(data);
        } catch (error) {
            console.error('Error updating withdrawal status:', error);
            throw error;
        }
    }

    // Create new withdrawal
    async createWithdrawal(withdrawalData) {
        try {
            const { data, error } = await supabase
                .from('withdrawals')
                .insert([withdrawalData])
                .select()
                .single();

            if (error) throw error;

            return this.transformWithdrawalData(data);
        } catch (error) {
            console.error('Error creating withdrawal:', error);
            throw error;
        }
    }

    // Helper function to transform withdrawal data for your component
    transformWithdrawalData(withdrawal) {
        return {
            id: withdrawal.id,
            payment_id: `WD-${withdrawal.id}`,
            affiliate_code: withdrawal.affiliate_code,
            amount: withdrawal.amount || 0,
            status: withdrawal.status || 'pending',
            created_at: withdrawal.created_at,
            processed_at: withdrawal.processed_at,
            type: 'withdrawal',
            details: {
                phone_number: withdrawal.phone_number,
                reason_of_status: withdrawal.reason_of_status,
                processed_at: withdrawal.processed_at,
                processed_by: withdrawal.processed_by
            }
        };
    }
}

export default new WithdrawalService();