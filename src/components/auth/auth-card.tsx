import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Shield, Users, Copy } from 'lucide-react';
import { cn, generateConnectCode } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import Confetti from 'react-confetti';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AuthCardProps {
  mode: 'login' | 'register' | 'connect';
  onModeChange: (mode: 'login' | 'register' | 'connect') => void;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ mode, onModeChange, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectStatus, setConnectStatus] = useState<'idle' | 'waiting' | 'connected'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    partnerCode: ''
  });
  
  const { login, register, connectPartner, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const myCode = useMemo(() => (user ? generateConnectCode(user.id) : ''), [user]);
  const deepLink = `pulse://connect/${myCode}`;
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let success = false;
      
      switch (mode) {
        case 'login':
          success = await login(formData.email, formData.password);
          break;
        case 'register':
          if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
          }
          success = await register(formData.name, formData.email, formData.password);
          break;
        case 'connect':
          if (connectStatus === 'connected') {
            navigate('/dashboard');
            success = true;
          } else {
            setConnectStatus('waiting');
            success = await connectPartner(formData.partnerCode);
            if (success) {
              setConnectStatus('connected');
            } else {
              setConnectStatus('idle');
            }
          }
          break;
      }

      if (success) {
        if (mode === 'register') {
          onModeChange('connect');
        } else if (mode !== 'connect') {
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
          description: 'Start your intimate communication journey',
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
          if (deepLink) {
            navigator.clipboard.writeText(deepLink);
            toast({
              title: "Copied!",
              description: "Link copied to clipboard.",
            });
          }
        };

        if (connectStatus === 'waiting') {
          return {
            title: 'Connect with Partner',
            description: 'Waiting for connection...',
            icon: <Users className="w-6 h-6 text-primary" />,
            fields: (
              <p className="text-center text-muted-foreground">En attente de connexion…</p>
            ),
            button: undefined,
            footer: null,
          };
        }

        if (connectStatus === 'connected') {
          return {
            title: 'Partner connected!',
            description: `Connected with ${user?.partnerName || 'partner'}`,
            icon: <Users className="w-6 h-6 text-primary" />,
            fields: (
              <div className="relative h-40">
                <Confetti width={400} height={160} recycle={false} />
                <div className="absolute inset-0 flex items-center justify-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-16 h-16">
                    <AvatarFallback>{user?.partnerName?.[0] ?? '?'}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            ),
            button: 'Go to Dashboard',
            footer: null,
          };
        }

        return {
          title: 'Connect with Partner',
          description: 'Share your code or enter your partner\'s code',
          icon: <Users className="w-6 h-6 text-primary" />,
          fields: (
            <>
              <div className="space-y-2 text-center">
                <Label>Your Connection Code</Label>
                <div className="p-4 bg-muted rounded-lg flex flex-col items-center space-y-2">
                  <span className="text-lg font-mono font-semibold text-primary">
                    {myCode || '------'}
                  </span>
                  <QRCodeSVG value={user?.id || ''} size={128} />
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex items-center text-sm text-muted-foreground hover:text-primary mt-2"
                    title="Copy link"
                  >
                    <Copy className="w-4 h-4 mr-1" /> Copy link
                  </button>
                  <span className="text-xs text-muted-foreground break-all">{deepLink}</span>
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
                <Input
                  id="partnerCode"
                  type="text"
                  placeholder="ABCDEF"
                  maxLength={6}
                  value={formData.partnerCode}
                  onChange={(e) => handleInputChange('partnerCode', e.target.value.toUpperCase())}
                  required
                />
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
          {content.button && (
            <PulseButton
              type="submit"
              variant="pulse"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : content.button}
            </PulseButton>
          )}
        </form>
        {content.footer}
      </CardContent>
    </Card>
  );
};