import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as authService from '@/services/auth';

interface User {
  id: string;
  name: string;
  email: string;
  partnerId?: string;
  partnerName?: string;
  snoozeUntil?: string | null;
  partnerSnoozeUntil?: string | null;
  isPremium?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  connectPartner: (partnerEmail: string) => Promise<boolean>;
  connectByCode: (code: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user);
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await authService.getProfile(supabaseUser.id);
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      if (profile) {
        setUser({
          id: profile.user_id,
          name: profile.name,
          email: profile.email,
          partnerId: profile.partner_id,
          partnerName: profile.partner?.name,
          snoozeUntil: profile.snooze_until,
          partnerSnoozeUntil: profile.partner?.snooze_until,
          isPremium: profile.is_premium
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshUser = async () => {
    if (session?.user) {
      await fetchUserProfile(session.user);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await authService.signIn(email, password);
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in to Pulse.',
      });
      return true;
    } catch (_error) {
      toast({
        title: 'Login failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await authService.signUp(name, email, password);
      if (error) {
        toast({
          title: 'Registration failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
      toast({
        title: 'Account created!',
        description: 'Welcome to Pulse. Connect with your partner to get started.',
      });
      return true;
    } catch (_error) {
      toast({
        title: 'Registration failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const connectPartner = async (partnerEmail: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!user || !session) {
        toast({
          title: 'Connection failed',
          description: 'You must be logged in to connect with a partner.',
          variant: 'destructive',
        });
        return false;
      }

      const { data, error } = await authService.connectPartner(partnerEmail, user.id);
      if (error) {
        toast({
          title: 'Connection failed',
          description: error,
          variant: 'destructive',
        });
        return false;
      }

      await fetchUserProfile(session.user);
      toast({
        title: 'Partner connected!',
        description: `Successfully connected with ${data?.name}.`,
      });
      return true;
    } catch (_error) {
      toast({
        title: 'Connection failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const connectByCode = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!user || !session) {
        toast({
          title: 'Connection failed',
          description: 'You must be logged in to connect with a partner.',
          variant: 'destructive',
        });
        return false;
      }

      const { data, error } = await authService.connectByCode(code, user.id);
      if (error) {
        toast({
          title: 'Connection failed',
          description: error,
          variant: 'destructive',
        });
        return false;
      }

      await fetchUserProfile(session.user);
      toast({
        title: 'Partner connected!',
        description: `Successfully connected with ${data?.name}.`,
      });
      return true;
    } catch (_error) {
      toast({
        title: 'Connection failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    toast({
      title: 'Logged out',
      description: 'See you soon!',
    });
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    connectPartner,
    connectByCode,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

