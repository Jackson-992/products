import { supabase } from '../supabase.ts';

export const getAffiliateEarnings = async (affiliateCode) => {
    try {
        const { data, error } = await supabase
            .from('affiliate_profiles')
            .select('*')
            .eq('affiliate_code', affiliateCode)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching affiliate earnings:', error);
        return { data: null, error };
    }
};

export const getReferralCommissions = async (affiliateCode, status = null) => {
    try {
        let query = supabase
            .from('referals_commission')
            .select('*')
            .eq('referer_code', affiliateCode)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching referral commissions:', error);
        return { data: null, error };
    }
};

export const getReferralStats = async (affiliateCode) => {
    try {
        // Get all referral commissions
        const { data: commissions, error: commissionsError } = await supabase
            .from('referals_commission')
            .select('amount, status')
            .eq('referer_code', affiliateCode);

        if (commissionsError) throw commissionsError;

        // Calculate statistics
        const totalReferrals = commissions.length;
        const completedReferrals = commissions.filter(c => c.status === 'completed').length;
        const pendingReferrals = commissions.filter(c => c.status === 'pending').length;

        const totalEarnings = commissions
            .filter(c => c.status === 'completed')
            .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

        const pendingEarnings = commissions
            .filter(c => c.status === 'pending')
            .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

        return {
            data: {
                totalReferrals,
                completedReferrals,
                pendingReferrals,
                totalEarnings,
                pendingEarnings
            },
            error: null
        };
    } catch (error) {
        console.error('Error calculating referral stats:', error);
        return { data: null, error };
    }
};

export const getFormattedReferrals = async (affiliateCode) => {
    try {
        const { data: commissions, error } = await supabase
            .from('referals_commission')
            .select('*')
            .eq('referer_code', affiliateCode)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Format data for UI
        const formattedData = commissions.map(commission => ({
            id: commission.id,
            code: commission.new_affiliate_code,
            date: new Date(commission.created_at).toISOString().split('T')[0],
            amount: `${parseFloat(commission.amount || 0).toFixed(2)} KSH`,
            status: commission.status.charAt(0).toUpperCase() + commission.status.slice(1),
            paymentId: commission.payment_id
        }));

        return { data: formattedData, error: null };
    } catch (error) {
        console.error('Error formatting referrals:', error);
        return { data: null, error };
    }
};

export const getDashboardSummary = async (affiliateCode) => {
    try {
        // Get affiliate earnings
        const { data: earnings, error: earningsError } = await getAffiliateEarnings(affiliateCode);

        if (earningsError) throw earningsError;

        // Get referral stats
        const { data: stats, error: statsError } = await getReferralStats(affiliateCode);

        if (statsError) throw statsError;

        return {
            data: {
                balance: parseFloat(earnings?.balance || 0),
                totalEarnings: parseFloat(earnings?.total_earnings || 0),
                referralsEarnings: parseFloat(earnings?.referals_earnings || 0),
                commissionEarnings: parseFloat(earnings?.commission_earnings || 0),
                totalWithdrawals: parseFloat(earnings?.total_withdrawals || 0),
                ...stats
            },
            error: null
        };
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        return { data: null, error };
    }
};

export default {
    getAffiliateEarnings,
    getReferralCommissions,
    getReferralStats,
    getFormattedReferrals,
    getDashboardSummary
};