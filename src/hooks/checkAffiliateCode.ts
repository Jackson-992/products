import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export function useAffiliateCode() {
    const [affiliateCode, setAffiliateCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAffiliateCode();
    }, []);

    const getAffiliateCode = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            // Get affiliate code from user_profiles with join to affiliate_profiles
            const { data, error } = await supabase
                .from('user_profiles')
                .select(`
                affiliate_profiles (
                    affiliate_code
                )
            `)
                .eq('auth_id', user.id)
                .single();

            if (error) {
                // If no affiliate record found, return null
                if (error.code === 'PGRST116') {
                    setAffiliateCode(null);
                } else {
                    throw error;
                }
            } else {
                // Access the nested affiliate_code from the array
                setAffiliateCode(data.affiliate_profiles?.[0]?.affiliate_code || null);
            }

        } catch (err) {
            console.error('Error getting affiliate code:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };
    return {
        affiliateCode,
        loading,
        error,
        refetch: getAffiliateCode
    };
}