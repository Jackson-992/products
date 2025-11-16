import { supabase } from '../../supabase.ts';

class ReferralCommissionService {
    async getAllReferralCommissions() {
        try {
            const { data, error } = await supabase
                .from('referals_commission') // Note: your table name has a typo 'referals_comission'
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to match your component's expected format
            return data.map(referral => ({
                id: referral.id,
                payment_id: `RC-${referral.id}`,
                affiliate_code: referral.referer_code, // Map referer_code to affiliate_code
                amount: referral.amount || 0,
                status: referral.status || 'pending',
                created_at: referral.created_at,
                type: 'referral_commission',
                // Add details object that PaymentDetails expects
                details: {
                    referer_code: referral.referer_code,
                    new_affiliate_code: referral.new_affiliate_code,
                    invitee_code: referral.new_affiliate_code, // Map to invitee_code for PaymentDetails
                    invitee_name: `Affiliate ${referral.new_affiliate_code}`, // Placeholder - you might want to get actual name
                    commission_amount: referral.amount || 0,
                    invited_at: referral.created_at, // Use created_at as invited date
                    payment_id: referral.payment_id
                }
            }));

        } catch (error) {
            console.error('Error fetching referral commissions:', error);
            throw error;
        }
    }

    async getReferralCommissionById(id) {
        try {
            const { data, error } = await supabase
                .from('referals_commission')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            return this.transformReferralData(data);
        } catch (error) {
            console.error('Error fetching referral commission:', error);
            throw error;
        }
    }

    async getReferralCommissionsByRefererCode(refererCode) {
        try {
            const { data, error } = await supabase
                .from('referals_commission')
                .select('*')
                .eq('referer_code', refererCode)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(referral => this.transformReferralData(referral));
        } catch (error) {
            console.error('Error fetching referral commissions by referer code:', error);
            throw error;
        }
    }

    async getReferralCommissionsByNewAffiliateCode(newAffiliateCode) {
        try {
            const { data, error } = await supabase
                .from('referals_commission')
                .select('*')
                .eq('new_affiliate_code', newAffiliateCode)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(referral => this.transformReferralData(referral));
        } catch (error) {
            console.error('Error fetching referral commissions by new affiliate code:', error);
            throw error;
        }
    }

    async getReferralCommissionsByStatus(status) {
        try {
            const { data, error } = await supabase
                .from('referals_commission')
                .select('*')
                .eq('status', status)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(referral => this.transformReferralData(referral));
        } catch (error) {
            console.error('Error fetching referral commissions by status:', error);
            throw error;
        }
    }

    // Update referral commission status
    async updateReferralStatus(id, status) {
        try {
            const { data, error } = await supabase
                .from('referals_commission')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return this.transformReferralData(data);
        } catch (error) {
            console.error('Error updating referral commission status:', error);
            throw error;
        }
    }

    // Create new referral commission
    async createReferralCommission(referralData) {
        try {
            const { data, error } = await supabase
                .from('referals_commission')
                .insert([referralData])
                .select()
                .single();

            if (error) throw error;

            return this.transformReferralData(data);
        } catch (error) {
            console.error('Error creating referral commission:', error);
            throw error;
        }
    }

    // Helper function to transform referral data for your component
    transformReferralData(referral) {
        return {
            id: referral.id,
            payment_id: `RC-${referral.id}`,
            affiliate_code: referral.referer_code,
            amount: referral.amount || 0,
            status: referral.status || 'pending',
            created_at: referral.created_at,
            type: 'referral_commission',
            details: {
                referer_code: referral.referer_code,
                new_affiliate_code: referral.new_affiliate_code,
                invitee_code: referral.new_affiliate_code,
                invitee_name: `Affiliate ${referral.new_affiliate_code}`,
                commission_amount: referral.amount || 0,
                invited_at: referral.created_at,
                payment_id: referral.payment_id
            }
        };
    }
}

export default new ReferralCommissionService();