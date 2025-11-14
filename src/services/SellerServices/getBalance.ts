import {supabase} from "@/services/supabase.ts";

export interface AffiliateProfile {
    id: number;
    affiliate_code: string;
    balance: number;
    total_earnings: number;
    total_withdrawals: number;
    referals_earnings: number;
    commission_earnings: number;
    referer: string | null;
    created_at: string;
    updated_at: string;
}

export class AffiliateProfileService {

    async getBalanceByAffiliateCode(affiliateCode: string): Promise<number | null> {
        try {
            const { data, error } = await supabase
                .from('affiliate_profiles')
                .select('balance')
                .eq('affiliate_code', affiliateCode)
                .single();

            if (error) {
                console.error('Error fetching balance:', error);
                return null;
            }

            return data?.balance ?? null;
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    }

    async getBalanceById(id: number): Promise<number | null> {
        try {
            const { data, error } = await supabase
                .from('affiliate_profiles')
                .select('balance')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching balance:', error);
                return null;
            }

            return data?.balance ?? null;
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    }

    async getProfileByAffiliateCode(affiliateCode: string): Promise<AffiliateProfile | null> {
        try {
            const { data, error } = await supabase
                .from('affiliate_profiles')
                .select('*')
                .eq('affiliate_code', affiliateCode)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    }

    async getProfileById(id: number): Promise<AffiliateProfile | null> {
        try {
            const { data, error } = await supabase
                .from('affiliate_profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    }

    async updateBalance(affiliateCode: string, newBalance: number): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('affiliate_profiles')
                .update({
                    balance: newBalance,
                    updated_at: new Date().toISOString()
                })
                .eq('affiliate_code', affiliateCode);

            if (error) {
                console.error('Error updating balance:', error);
                return false;
            }

            return true;
        } catch (err) {
            console.error('Unexpected error:', err);
            return false;
        }
    }
}

// Export a singleton instance
export const affiliateProfileService = new AffiliateProfileService();