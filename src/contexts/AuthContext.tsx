import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  partnerId?: string;
  partnerName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  connectPartner: (partnerCode: string, partnerName: string) => Promise<boolean>;
  logout: () => void;
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          partner:partner_id(name)
        `)
        .eq('user_id', supabaseUser.id)
        .single();

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
          partnerName: profile.partner?.name
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Welcome back!",
        description: "Successfully logged in to Pulse.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Account created!",
        description: "Welcome to Pulse. Connect with your partner to get started.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const connectPartner = async (partnerCode: string, partnerName: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!user || !session) {
        toast({
          title: "Connection failed",
          description: "You must be logged in to connect with a partner.",
          variant: "destructive",
        });
        return false;
      }

      // Find partner by their unique code (we'll implement this as email for now)
      const { data: partnerProfile, error: findError } = await supabase
        .from('profiles')
        .select('id, user_id, name')
        .eq('email', partnerCode) // Using email as partner code for simplicity
        .single();

      if (findError || !partnerProfile) {
        toast({
          title: "Connection failed",
          description: "Partner not found. Please check the code.",
          variant: "destructive",
        });
        return false;
      }

      // Update current user's partner_id
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ partner_id: partnerProfile.user_id })
        .eq('user_id', user.id);

      if (updateError) {
        toast({
          title: "Connection failed",
          description: "Unable to connect with partner. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Also update partner's partner_id to create mutual connection
      await supabase
        .from('profiles')
        .update({ partner_id: user.id })
        .eq('user_id', partnerProfile.user_id);

      // Refresh user profile
      await fetchUserProfile(session.user);
      
      toast({
        title: "Partner connected!",
        description: `Successfully connected with ${partnerProfile.name}.`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    toast({
      title: "Logged out",
      description: "See you soon!",
    });
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    connectPartner,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};