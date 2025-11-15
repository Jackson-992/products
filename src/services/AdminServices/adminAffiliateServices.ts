import { supabase } from '../supabase';

export const affiliateService = {
    async getAffiliates() {
        try {
            // First, get all affiliate profiles with user data
            const { data: affiliates, error: affiliatesError } = await supabase
                .from('affiliate_profiles')
                .select(`
          *,
          user_profiles (
            id,
            name,
            phone,
            auth_id
          )
        `)
                .order('created_at', { ascending: false });

            if (affiliatesError) throw affiliatesError;

            // Get all referer values to count referrals
            const { data: allAffiliates, error: countError } = await supabase
                .from('affiliate_profiles')
                .select('referer')
                .not('referer', 'is', null);

            if (countError) throw countError;

            // Count how many times each affiliate code appears in referer field
            const referralCounts = {};
            allAffiliates.forEach(affiliate => {
                if (affiliate.referer) {
                    referralCounts[affiliate.referer] = (referralCounts[affiliate.referer] || 0) + 1;
                }
            });

            console.log('Referral counts:', referralCounts); // Debug log

            // Transform the data with referral counts
            return affiliates.map(affiliate => {
                const userName = affiliate.user_profiles?.name || 'Unknown User';
                const userId = affiliate.user_profiles?.id || 'N/A';
                const affiliateCode = affiliate.affiliate_code || 'N/A';

                // Get referral count for this affiliate
                const totalReferrals = referralCounts[affiliateCode] || 0;

                return {
                    id: affiliate.id,
                    affiliate_code: affiliateCode,
                    user_name: userName,
                    user_id: userId,
                    created_at: affiliate.created_at,
                    total_earnings: affiliate.total_earnings || 0,
                    balance: affiliate.balance || 0,
                    total_withdrawals: affiliate['total withdrawals'] || 0,
                    referer: affiliate.referer,
                    referals_earnings: affiliate.referals_earnings || 0,
                    commission_earnings: affiliate.commission_earnings || 0,
                    total_referrals: totalReferrals,
                    total_earned: affiliate.total_earnings || 0
                };
            });

        } catch (error) {
            console.error('Error fetching affiliates:', error);
            throw error;
        }
    },

    // Alternative method with separate queries
    async getAffiliatesWithUserProfiles() {
        try {
            // Get affiliate profiles
            const { data: affiliates, error: affiliatesError } = await supabase
                .from('affiliate_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (affiliatesError) throw affiliatesError;

            // Get user_profiles data separately
            const userIds = affiliates.map(a => a.user_id).filter(Boolean);
            const { data: userProfiles, error: userProfilesError } = await supabase
                .from('user_profiles')
                .select('id, name, auth_id')
                .in('id', userIds);

            if (userProfilesError) throw userProfilesError;

            // Get all referer values to count referrals
            const { data: allAffiliates, error: countError } = await supabase
                .from('affiliate_profiles')
                .select('referer')
                .not('referer', 'is', null);

            if (countError) throw countError;

            // Count referrals
            const referralCounts = {};
            allAffiliates.forEach(affiliate => {
                if (affiliate.referer) {
                    referralCounts[affiliate.referer] = (referralCounts[affiliate.referer] || 0) + 1;
                }
            });

            // Create a map of user_profiles by id for easy lookup
            const userProfilesMap = new Map();
            userProfiles?.forEach(user => {
                userProfilesMap.set(user.id, user);
            });

            // Combine the data
            return affiliates.map(affiliate => {
                const userProfile = userProfilesMap.get(affiliate.user_id);
                const affiliateCode = affiliate.affiliate_code || 'N/A';
                const totalReferrals = referralCounts[affiliateCode] || 0;

                return {
                    id: affiliate.id,
                    affiliate_code: affiliateCode,
                    user_name: userProfile?.name || 'Unknown User',
                    user_id: userProfile?.auth_id || affiliate.user_id || 'N/A',
                    created_at: affiliate.created_at,
                    total_earnings: affiliate.total_earnings || 0,
                    balance: affiliate.balance || 0,
                    total_withdrawals: affiliate['total withdrawals'] || 0,
                    referer: affiliate.referer,
                    referals_earnings: affiliate.referals_earnings || 0,
                    commission_earnings: affiliate.commission_earnings || 0,
                    total_referrals: totalReferrals,
                    total_earned: affiliate.total_earnings || 0
                };
            });

        } catch (error) {
            console.error('Error fetching affiliates with user_profiles:', error);
            throw error;
        }
    },

    // Get detailed referral information for a specific affiliate
    async getAffiliateReferrals(affiliateCode) {
        try {
            const { data, error } = await supabase
                .from('affiliate_profiles')
                .select(`
          *,
          user_profiles (
            id,
            name,
            auth_id
          )
        `)
                .eq('referer', affiliateCode)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(referral => ({
                id: referral.id,
                user_name: referral.user_profiles?.name || 'Unknown User',
                user_id: referral.user_profiles?.auth_id || 'N/A',
                created_at: referral.created_at,
                affiliate_code: referral.affiliate_code,
                total_earnings: referral.total_earnings || 0
            }));

        } catch (error) {
            console.error('Error fetching affiliate referrals:', error);
            throw error;
        }
    },

    // Get single affiliate by ID with referral count
    async getAffiliateById(id) {
        try {
            const { data, error } = await supabase
                .from('affiliate_profiles')
                .select(`
          *,
          user_profiles (
            id,
            name,
            phone,
            auth_id
          )
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data) {
                // Get referral count for this specific affiliate
                const { count, error: countError } = await supabase
                    .from('affiliate_profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('referer', data.affiliate_code);

                if (countError) throw countError;

                return {
                    id: data.id,
                    affiliate_code: data.affiliate_code,
                    user_name: data.user_profiles?.name || 'Unknown User',
                    user_id: data.user_profiles?.auth_id,
                    created_at: data.created_at,
                    total_earnings: data.total_earnings || 0,
                    balance: data.balance || 0,
                    total_withdrawals: data.total_withdrawals || 0,
                    referer: data.referer,
                    referals_earnings: data.referals_earnings || 0,
                    commission_earnings: data.commission_earnings || 0,
                    total_referrals: count || 0,
                    total_earned: data.total_earnings || 0
                };
            }
            return null;

        } catch (error) {
            console.error('Error fetching affiliate:', error);
            throw error;
        }
    }
};