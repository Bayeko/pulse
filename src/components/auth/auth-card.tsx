import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Shield, Users, Copy, Apple, Chrome } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n';
import { supabase } from '@/integrations/supabase/client';
import { SITE_URL } from '@/config';

const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
];

const getAgeLimit = (code: string) => (EU_COUNTRIES.includes(code) ? 16 : 13);

const calculateAge = (birthdate: string) => {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

interface AuthCardProps {
  mode: 'login' | 'register' | 'connect';
  onModeChange: (mode: 'login' | 'register' | 'connect') => void;
  className?: string;
  country: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ mode, onModeChange, className, country }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    partnerEmail: '',
    birthdate: ''
  });
  
  const { signIn, signUp, connectPartner, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : SITE_URL;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          ...(origin ? { redirectTo: `${origin}/dashboard` } : {})
        }
      });

      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let success = false;
      
      switch (mode) {
        case 'login':
          success = await signIn(formData.email, formData.password);
          break;
        case 'register': {
          if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
          }
          const age = calculateAge(formData.birthdate);
          const ageLimit = getAgeLimit(country);
          if (age < ageLimit) {
            toast({
              title: 'Underage',
              description: `You must be at least ${ageLimit} years old to use Pulse.`,
              variant: 'destructive',
            });
            return;
          }
          success = await signUp(formData.name, formData.email, formData.password, formData.birthdate);
          break;
        }
        case 'connect':
          success = await connectPartner(formData.partnerEmail);
          break;
      }
      
      if (success) {
        if (mode === 'register') {
          onModeChange('connect');
        } else {
          navigate('/dashboard');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getContent = () => {
    switch (mode) {
      case 'login':
        return {
          title: 'Welcome Back',
          description: 'Sign in to reconnect with your partner',
          icon: <Heart className="w-6 h-6 text-primary animate-heartbeat" />,
          fields: (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>
            </>
          ),
          button: 'Sign In',
          footer: (
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{' '}
              <button 
                onClick={() => onModeChange('register')}
                className="text-primary hover:underline font-medium"
              >
                Create one
              </button>
            </p>
          )
        };
      
      case 'register':
        return {
          title: 'Create Your Account',
          description: `Start your ${t('intimacy')} communication journey`,
          icon: <Shield className="w-6 h-6 text-primary" />,
          fields: (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Your beautiful name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">Birthdate</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => handleInputChange('birthdate', e.target.value)}
                  required
                />
              </div>
            </>
          ),
          button: 'Create Account',
          footer: (
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <button 
                onClick={() => onModeChange('login')}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          )
        };
        
      case 'connect': {
        const copyToClipboard = () => {
          if (user?.email) {
            navigator.clipboard.writeText(user.email);
            toast({
              title: "Copied!",
              description: "Your email address has been copied to clipboard.",
            });
          }
        };

        return {
          title: 'Connect with Partner',
          description: 'Share your email address or enter your partner\'s email',
          icon: <Users className="w-6 h-6 text-primary" />,
          fields: (
            <>
              <div className="space-y-2">
                <Label>Your Email Address</Label>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-semibold text-primary">
                      {user?.email || 'Loading...'}
                    </span>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="ml-2 p-1 text-muted-foreground hover:text-primary transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this email with your partner
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerEmail">Partner's Email</Label>
                <Input
                  id="partnerEmail"
                  type="email"
                  placeholder="partner@email.com"
                  value={formData.partnerEmail}
                  onChange={(e) => handleInputChange('partnerEmail', e.target.value)}
                  required
                />
              </div>
            </>
          ),
          button: 'Connect',
          footer: (
            <p className="text-sm text-muted-foreground text-center">
              {t('needHelp')}{' '}
              <button className="text-primary hover:underline font-medium">
                {t('contactSupport')}
              </button>
            </p>
          )
        };
      }
    }
  };

  const content = getContent();

  return (
    <Card className={cn("w-full max-w-md mx-auto shadow-card animate-fade-in-up", className)}>
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          {content.icon}
        </div>
        <div>
          <CardTitle className="text-2xl font-serif text-foreground">
            {content.title}
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            {content.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {content.fields}
          </div>
          <PulseButton
            type="submit"
            variant="pulse"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : content.button}
          </PulseButton>
        </form>
        {mode !== 'connect' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <PulseButton
                type="button"
                variant="ghost"
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
              >
                <Chrome className="w-4 h-4 mr-2" /> Google
              </PulseButton>
              <PulseButton
                type="button"
                variant="ghost"
                onClick={() => handleOAuthLogin('apple')}
                disabled={isLoading}
              >
                <Apple className="w-4 h-4 mr-2" /> Apple
              </PulseButton>
            </div>
          </>
        )}
        {content.footer}
      </CardContent>
    </Card>
  );
};