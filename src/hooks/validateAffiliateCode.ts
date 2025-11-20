import { useState } from 'react';
import { supabase } from '@/services/supabase';

export const useAffiliateCode = () => {
    const [validating, setValidating] = useState(false);

    const validateAffiliateCode = async (code) => {
        if (!code || !code.trim()) {
            return { isValid: false, error: 'Affiliate code is required' };
        }

        try {
            setValidating(true);

            const { data, error } = await supabase
                .from('affiliate_profiles')
                .select('affiliate_code, id')
                .eq('affiliate_code', code.trim())
                .single();

            if (error || !data) {
                return {
                    isValid: false,
                    error: 'Invalid affiliate code. Please check with your referrer.'
                };
            }

            return { isValid: true, affiliateId: data.id };
        } catch (error) {
            console.error('Error validating affiliate code:', error);
            return {
                isValid: false,
                error: 'Error validating affiliate code. Please try again.'
            };
        } finally {
            setValidating(false);
        }
    };

    return {
        validateAffiliateCode,
        validating
    };
};

export default useAffiliateCode;