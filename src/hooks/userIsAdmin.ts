import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase.ts'; // Adjust path to your supabase client

interface UseIsAdminReturn {
    isAdmin: boolean;
    loading: boolean;
    error: string | null;
}

export const useIsAdmin = (): UseIsAdminReturn => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get the current authenticated user
                const { data: { user }, error: authError } = await supabase.auth.getUser();

                if (authError) {
                    throw authError;
                }

                // If no user is logged in, they're not an admin
                if (!user) {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                // Query user_profiles to check if user is admin
                const { data: profile, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('is_admin')
                    .eq('auth_id', user.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching user profile:', profileError);
                    throw profileError;
                }

                // Set admin status based on profile data
                setIsAdmin(profile?.is_admin || false);

            } catch (err) {
                console.error('Error checking admin status:', err);
                setError(err instanceof Error ? err.message : 'Failed to verify admin status');
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();

        // Optional: Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            checkAdminStatus();
        });

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { isAdmin, loading, error };
};