import React, { useState } from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import heroImage from '@/assets/pulse-hero.jpg';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Auth = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'connect'>('login');

  return (
    <div className="relative min-h-screen bg-gradient-soft">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        
        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                <span className="text-2xl">💝</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
                Pulse
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Intimate communication designed for partners who understand that connection goes beyond words
            </p>
          </div>

          {/* Auth Card */}
          <div className="flex justify-center">
            <AuthCard 
              mode={authMode} 
              onModeChange={setAuthMode}
              className="animate-scale-in"
            />
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: '🔒',
                title: 'Private & Secure',
                description: 'End-to-end encryption ensures your intimate moments stay between you two'
              },
              {
                icon: '💕',
                title: 'Discreet Communication',
                description: 'Express desires through elegant emojis and symbols, no explicit text'
              },
              {
                icon: '📅',
                title: 'Smart Scheduling',
                description: 'AI-powered calendar finds perfect moments when you\'re both available'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 shadow-soft animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;