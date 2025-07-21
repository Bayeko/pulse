import React from 'react';
import { PulseButton } from '@/components/ui/pulse-button';
import { Heart, Shield, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/pulse-hero.jpg';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-primary opacity-20" />
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            {/* Logo */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow animate-pulse-glow">
                <span className="text-3xl">💝</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground">
                Pulse
              </h1>
            </div>

            {/* Tagline */}
            <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-6 leading-tight">
              Intimate communication beyond words
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with your partner through discreet notifications, shared calendars, and encrypted communication designed for intimate relationships.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <PulseButton 
                variant="pulse" 
                size="xl"
                onClick={() => navigate('/auth')}
                className="animate-scale-in"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </PulseButton>
              <PulseButton 
                variant="ghost" 
                size="xl"
                onClick={() => navigate('/dashboard')}
                className="animate-scale-in"
                style={{ animationDelay: '0.1s' }}
              >
                View Demo
              </PulseButton>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                <span>Privacy first</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>No social features</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Built for intimate connection
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every feature designed with privacy, consent, and authentic connection in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Heart className="w-8 h-8 text-primary" />,
                title: 'Discreet Pulses',
                description: 'Express desires through elegant emojis and symbols. No explicit text, just beautiful communication.',
                gradient: 'bg-gradient-to-br from-primary/10 to-primary-soft/20'
              },
              {
                icon: <Calendar className="w-8 h-8 text-primary" />,
                title: 'Smart Scheduling',
                description: 'AI-powered calendar finds perfect moments when you\'re both available and in the mood.',
                gradient: 'bg-gradient-to-br from-accent/10 to-secondary/20'
              },
              {
                icon: <Shield className="w-8 h-8 text-primary" />,
                title: 'Privacy Protected',
                description: 'Local encryption, no data sharing, and complete control over your intimate moments.',
                gradient: 'bg-gradient-to-br from-success/10 to-primary/20'
              },
              {
                icon: <Sparkles className="w-8 h-8 text-primary" />,
                title: 'Mutual Consent',
                description: 'Every interaction respects boundaries. Accept or decline freely, no pressure ever.',
                gradient: 'bg-gradient-to-br from-primary/10 to-accent/20'
              },
              {
                icon: <Heart className="w-8 h-8 text-primary animate-heartbeat" />,
                title: 'Real-time Status',
                description: 'Know when your partner is available for connection with elegant status indicators.',
                gradient: 'bg-gradient-to-br from-secondary/10 to-primary/20'
              },
              {
                icon: <Shield className="w-8 h-8 text-primary" />,
                title: 'Partner Only',
                description: 'Built for two. No social feeds, no third parties, just you and your partner.',
                gradient: 'bg-gradient-to-br from-accent/10 to-primary-soft/20'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl border border-border/50 shadow-card animate-fade-in-up hover:scale-105 transition-all duration-300 ${feature.gradient}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
              Ready to deepen your connection?
            </h3>
            <p className="text-xl text-muted-foreground mb-8">
              Join couples who've discovered a more intimate way to communicate.
            </p>
            <PulseButton 
              variant="pulse" 
              size="xl"
              onClick={() => navigate('/auth')}
              className="animate-pulse-glow"
            >
              Begin Your Pulse Journey
              <Heart className="w-5 h-5 ml-2 animate-heartbeat" />
            </PulseButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-lg">💝</span>
            </div>
            <span className="text-xl font-serif font-bold text-foreground">Pulse</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Intimate communication, beautifully designed.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
