import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  mode: 'login' | 'register' | 'connect';
  onModeChange: (mode: 'login' | 'register' | 'connect') => void;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ mode, onModeChange, className }) => {
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
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
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
          description: 'Start your intimate communication journey',
          icon: <Shield className="w-6 h-6 text-primary" />,
          fields: (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" type="text" placeholder="Your beautiful name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" />
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
        
      case 'connect':
        return {
          title: 'Connect with Partner',
          description: 'Share your unique code or enter your partner\'s code',
          icon: <Users className="w-6 h-6 text-primary" />,
          fields: (
            <>
              <div className="space-y-2">
                <Label>Your Connection Code</Label>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <span className="text-lg font-mono font-semibold text-primary">
                    HEART-2024-PULSE
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this code with your partner
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
                <Label htmlFor="partnerCode">Partner's Code</Label>
                <Input id="partnerCode" type="text" placeholder="Enter partner's code" />
              </div>
            </>
          ),
          button: 'Connect',
          footer: (
            <p className="text-sm text-muted-foreground text-center">
              Need help?{' '}
              <button className="text-primary hover:underline font-medium">
                Contact support
              </button>
            </p>
          )
        };
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
        <div className="space-y-4">
          {content.fields}
        </div>
        <PulseButton variant="pulse" size="lg" className="w-full">
          {content.button}
        </PulseButton>
        {content.footer}
      </CardContent>
    </Card>
  );
};