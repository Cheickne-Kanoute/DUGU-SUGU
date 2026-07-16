import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfileById } from '@/lib/api/profiles';
import { syncCartToDb } from '@/lib/api/cart';

import type { Database } from '../types/database';

export type UserRole = Database['public']['Tables']['profiles']['Row']['role'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type AuthUser = Profile & { is_blocked?: boolean };

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: RegisterData) => Promise<{ error?: string, emailConfirmationSent?: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  // role is removed as users are always created as 'client' initially
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, accessToken?: string) => {
    try {
      const profile = await getProfileById(userId, accessToken);
      setUser(profile as AuthUser);
      return profile as AuthUser;
    } catch (err) {
      console.error('Profile fetch error:', err);
      return null;
    }
  }, []);

  const signOutBlockedUser = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchProfile(session.user.id, session.access_token);
      if (profile?.is_blocked) {
        await signOutBlockedUser();
      }
    }
  }, [fetchProfile, signOutBlockedUser]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.access_token);
          if (profile?.is_blocked) {
            await signOutBlockedUser();
          }
        }
      } catch (err) {
        console.log('Auth init error (expected in demo mode):', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.access_token);
          if (profile?.is_blocked) {
            await signOutBlockedUser();
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, signOutBlockedUser]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`public:profiles:id=eq.${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          void refreshUser();
        }
      )
      .subscribe();

    const handleFocus = () => {
      void refreshUser();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id, refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };
      if (data.user) {
        const profile = await fetchProfile(data.user.id, data.session?.access_token);
        if (profile?.is_blocked) {
          await signOutBlockedUser();
          return { error: 'Votre compte est bloqué. Contactez un administrateur.' };
        }
        
        if (profile?.role === 'client') {
          await syncCartToDb(data.user.id);
          window.dispatchEvent(new CustomEvent('cart-updated'));
        }
      }
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          },
        },
      });

      if (error) return { error: error.message };

      if (authData.user && !authData.session) {
        return { emailConfirmationSent: true };
      }

      if (authData.user) {
        // Profile will be created by database trigger
        await fetchProfile(authData.user.id, authData.session?.access_token);
        await syncCartToDb(authData.user.id);
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
