import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

interface AuthContextType {
    user: User | null;
    userProfile: any | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    isLoading: true,
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Use refs to track state and prevent unnecessary updates
    const currentUserId = useRef<string | null>(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        console.log('🔄 AuthProvider useEffect - isInitialized:', isInitialized.current);

        let mounted = true;

        const initializeAuth = async () => {
            try {
                console.log('🔄 Starting initial auth initialization...');

                const { data: { session }, error } = await supabase.auth.getSession();

                console.log('🔄 Session fetched:', {
                    hasSession: !!session,
                    hasError: !!error,
                    currentUserId: currentUserId.current
                });

                if (!mounted) return;

                if (session?.user) {
                    // Only update if user actually changed
                    if (currentUserId.current !== session.user.id) {
                        console.log('👤 New user found:', session.user.id);
                        currentUserId.current = session.user.id;
                        setUser(session.user);

                        // Fetch profile
                        const { data: profile, error: profileError } = await supabase
                            .from('user_profiles')
                            .select('*')
                            .eq('auth_id', session.user.id)
                            .single();

                        if (!mounted) return;

                        if (profileError) {
                            console.error('❌ Profile fetch error:', profileError);
                        } else {
                            console.log('✅ Profile fetched successfully');
                            setUserProfile(profile);
                        }
                    }
                } else {
                    // No session - clear if we had a user before
                    if (currentUserId.current !== null) {
                        console.log('👤 No session - clearing user');
                        currentUserId.current = null;
                        setUser(null);
                        setUserProfile(null);
                    }
                }

                if (!isInitialized.current) {
                    console.log('✅ Auth initialization complete');
                    isInitialized.current = true;
                    setIsLoading(false);
                }

            } catch (error) {
                console.error('❌ Auth initialization error:', error);
                if (mounted && !isInitialized.current) {
                    isInitialized.current = true;
                    setIsLoading(false);
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('🔄 Auth state changed:', event, 'current user:', currentUserId.current);

                if (!mounted) return;

                // Handle different auth events
                switch (event) {
                    case 'SIGNED_IN':
                        if (session?.user && currentUserId.current !== session.user.id) {
                            console.log('👤 SIGNED_IN - new user:', session.user.id);
                            currentUserId.current = session.user.id;
                            setUser(session.user);

                            const { data: profile } = await supabase
                                .from('user_profiles')
                                .select('*')
                                .eq('auth_id', session.user.id)
                                .single();
                            setUserProfile(profile);
                        }
                        break;

                    case 'SIGNED_OUT':
                        console.log('👤 SIGNED_OUT - clearing user');
                        currentUserId.current = null;
                        setUser(null);
                        setUserProfile(null);
                        break;

                    case 'USER_UPDATED':
                        if (session?.user) {
                            console.log('👤 USER_UPDATED - updating user');
                            setUser(session.user);
                        }
                        break;

                    case 'TOKEN_REFRESHED':
                        // Just refresh the session, no need to update state if user is the same
                        console.log('🔐 Token refreshed');
                        break;

                    default:
                        console.log('🔔 Unhandled auth event:', event);
                }

                // Mark as initialized after first auth state change if not already
                if (!isInitialized.current) {
                    console.log('✅ Auth initialized via state change');
                    isInitialized.current = true;
                    setIsLoading(false);
                }
            }
        );

        return () => {
            console.log('🧹 AuthProvider cleanup');
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, userProfile, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};