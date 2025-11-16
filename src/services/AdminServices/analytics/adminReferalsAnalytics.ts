import {supabase} from "@/services/supabase.ts";

export interface ReferralAnalytics {
    totalAffiliates: number;
    totalMoneyIn: number;
    totalMoneyOut: number;
    netProfit: number;
    topPerformers: TopPerformer[];
    monthlyTrends: MonthlyTrend[];
    recentCommissions: RecentCommission[];
}

export interface TopPerformer {
    affiliateCode: string;
    totalReferrals: number;
    totalEarnings: number;
    commissionEarnings: number;
    referralsEarnings: number;
}

export interface MonthlyTrend {
    month: string;
    moneyIn: number;
    moneyOut: number;
    netProfit: number;
    newAffiliates: number;
}

export interface RecentCommission {
    id: number;
    refererCode: string;
    newAffiliateCode: string;
    amount: number;
    status: string;
    createdAt: string;
}

const AFFILIATE_JOIN_FEE = 500; // KSH
const REFERRAL_COMMISSION = 250; // KSH

export class ReferralAnalyticsService {
    /**
     * Get comprehensive referral analytics
     */
    async getAnalytics(): Promise<ReferralAnalytics> {
        const [
            totalAffiliates,
            totalMoneyOut,
            topPerformers,
            monthlyTrends,
            recentCommissions
        ] = await Promise.all([
            this.getTotalAffiliates(),
            this.getTotalMoneyOut(),
            this.getTopPerformers(),
            this.getMonthlyTrends(),
            this.getRecentCommissions()
        ]);

        const totalMoneyIn = totalAffiliates * AFFILIATE_JOIN_FEE;
        const netProfit = totalMoneyIn - totalMoneyOut;

        return {
            totalAffiliates,
            totalMoneyIn,
            totalMoneyOut,
            netProfit,
            topPerformers,
            monthlyTrends,
            recentCommissions
        };
    }

    /**
     * Get total number of affiliates
     */
    private async getTotalAffiliates(): Promise<number> {
        const { count, error } = await supabase
            .from('affiliate_profiles')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return count || 0;
    }

    /**
     * Get total money paid out as commissions
     */
    private async getTotalMoneyOut(): Promise<number> {
        const { data, error } = await supabase
            .from('referals_commission')
            .select('amount')
            .eq('status', 'completed');

        if (error) throw error;

        return data?.reduce((sum, record) => sum + (Number(record.amount) || 0), 0) || 0;
    }

    /**
     * Get top performing referrers
     */
    private async getTopPerformers(limit: number = 10): Promise<TopPerformer[]> {
        // Get referral counts and commission data
        const { data: commissionData, error: commError } = await supabase
            .from('referals_commission')
            .select('referer_code, amount, status');

        if (commError) throw commError;

        // Aggregate by referer_code
        const performerMap = new Map<string, {
            totalReferrals: number;
            totalEarnings: number;
        }>();

        commissionData?.forEach(record => {
            const code = record.referer_code;
            const existing = performerMap.get(code) || { totalReferrals: 0, totalEarnings: 0 };

            existing.totalReferrals += 1;
            if (record.status === 'paid') {
                existing.totalEarnings += Number(record.amount) || 0;
            }

            performerMap.set(code, existing);
        });

        // Get affiliate profile data
        const affiliateCodes = Array.from(performerMap.keys());
        const { data: profiles, error: profileError } = await supabase
            .from('affiliate_profiles')
            .select('affiliate_code, commission_earnings, referals_earnings')
            .in('affiliate_code', affiliateCodes);

        if (profileError) throw profileError;

        // Combine data
        const performers: TopPerformer[] = affiliateCodes.map(code => {
            const stats = performerMap.get(code)!;
            const profile = profiles?.find(p => p.affiliate_code === code);

            return {
                affiliateCode: code,
                totalReferrals: stats.totalReferrals,
                totalEarnings: stats.totalEarnings,
                commissionEarnings: Number(profile?.commission_earnings) || 0,
                referralsEarnings: Number(profile?.referals_earnings) || 0
            };
        });

        // Sort by total referrals and return top performers
        return performers
            .sort((a, b) => b.totalReferrals - a.totalReferrals)
            .slice(0, limit);
    }

    /**
     * Get monthly trends for the past 12 months
     */
    private async getMonthlyTrends(): Promise<MonthlyTrend[]> {
        const { data: commissions, error: commError } = await supabase
            .from('referals_commission')
            .select('amount, status, created_at')
            .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

        if (commError) throw commError;

        const { data: affiliates, error: affError } = await supabase
            .from('affiliate_profiles')
            .select('created_at')
            .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

        if (affError) throw affError;

        // Group by month
        const monthMap = new Map<string, {
            moneyIn: number;
            moneyOut: number;
            newAffiliates: number;
        }>();

        affiliates?.forEach(aff => {
            const month = new Date(aff.created_at).toISOString().slice(0, 7);
            const existing = monthMap.get(month) || { moneyIn: 0, moneyOut: 0, newAffiliates: 0 };
            existing.newAffiliates += 1;
            existing.moneyIn += AFFILIATE_JOIN_FEE;
            monthMap.set(month, existing);
        });

        commissions?.forEach(comm => {
            const month = new Date(comm.created_at).toISOString().slice(0, 7);
            const existing = monthMap.get(month) || { moneyIn: 0, moneyOut: 0, newAffiliates: 0 };
            if (comm.status === 'completed') {
                existing.moneyOut += Number(comm.amount) || 0;
            }
            monthMap.set(month, existing);
        });

        // Convert to array and sort
        return Array.from(monthMap.entries())
            .map(([month, data]) => ({
                month,
                moneyIn: data.moneyIn,
                moneyOut: data.moneyOut,
                netProfit: data.moneyIn - data.moneyOut,
                newAffiliates: data.newAffiliates
            }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-12);
    }

    /**
     * Get recent commissions
     */
    private async getRecentCommissions(limit: number = 20): Promise<RecentCommission[]> {
        const { data, error } = await supabase
            .from('referals_commission')
            .select('id, referer_code, new_affiliate_code, amount, status, created_at')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data?.map(record => ({
            id: record.id,
            refererCode: record.referer_code,
            newAffiliateCode: record.new_affiliate_code,
            amount: Number(record.amount) || 0,
            status: record.status || 'pending',
            createdAt: record.created_at
        })) || [];
    }
}

// Export singleton instance
export const referralAnalyticsService = new ReferralAnalyticsService();