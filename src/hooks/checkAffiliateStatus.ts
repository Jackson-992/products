import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

export function useAffiliateStatus(redirectIfAffiliate = false) {
    const [isAffiliate, setIsAffiliate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            setUser(user);

            const { data, error } = await supabase
                .from('user_profiles')
                .select('is_affiliate')
                .eq('auth_id', user.id)
                .single();

            if (!error && data) {
                setIsAffiliate(data.is_affiliate);
                if (redirectIfAffiliate && data.is_affiliate) {
                    navigate("/seller-dashboard");
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Error checking affiliate status:', error);
            setLoading(false);
        }
    };

    return { isAffiliate, loading, user, refetch: checkStatus };
}