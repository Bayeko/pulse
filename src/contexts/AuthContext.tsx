import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('pulse_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const userData: User = {
        id: '1',
        name: 'Sofia',
        email,
        partnerId: '2',
        partnerName: 'Alex'
      };
      
      setUser(userData);
      localStorage.setItem('pulse_user', JSON.stringify(userData));
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to Pulse.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      const userData: User = {
        id: '1',
        name,
        email
      };
      
      setUser(userData);
      localStorage.setItem('pulse_user', JSON.stringify(userData));
      
      toast({
        title: "Account created!",
        description: "Welcome to Pulse. Connect with your partner to get started.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Unable to create account. Please try again.",
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = {
          ...user,
          partnerId: '2',
          partnerName
        };
        
        setUser(updatedUser);
        localStorage.setItem('pulse_user', JSON.stringify(updatedUser));
        
        toast({
          title: "Partner connected!",
          description: `Successfully connected with ${partnerName}.`,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Unable to connect with partner. Check the code and try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pulse_user');
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