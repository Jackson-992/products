import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';

export const useUserProfile = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cache to avoid duplicate requests
    const [profileCache, setProfileCache] = useState(null);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check cache first
            if (profileCache) {
                setUserProfile(profileCache);
                setLoading(false);
                return;
            }

            // First get the auth user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Then get the user profile with integer ID
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('auth_id', user.id)
                .single();

            if (profileError) {
                throw profileError;
            }

            // Update cache and state
            setProfileCache(profile);
            setUserProfile(profile);
        } catch (err) {
            console.error('Error loading user profile:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshProfile = async () => {
        try {
            setLoading(true);

            // Clear cache
            setProfileCache(null);

            // Get fresh data
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setUserProfile(null);
                return null;
            }

            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('auth_id', user.id)
                .single();

            if (profileError) throw profileError;

            setProfileCache(profile);
            setUserProfile(profile);
            return profile;
        } catch (err) {
            console.error('Error refreshing user profile:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const clearProfile = () => {
        setUserProfile(null);
        setProfileCache(null);
        setError(null);
    };

    return {
        // State
        userProfile,
        loading,
        error,

        // Methods
        refreshProfile,
        clearProfile,
        reloadProfile: loadUserProfile,

        // Convenience properties
        isAuthenticated: !!userProfile,
        userId: userProfile?.id || null,
        userRole: userProfile?.role || null,
        userName: userProfile?.name || userProfile?.email?.split('@')[0] || 'User'
    };
};

export default useUserProfile;