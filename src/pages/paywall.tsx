import React from 'react';
import { PulseButton } from '@/components/ui/pulse-button';
import { Heart, Shield, Sparkles } from 'lucide-react';

const Paywall = () => {
  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Pulse Premium</h1>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-primary" />
            <span>Moments intimes renforcés</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <span>Confidentialité assurée</span>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Fonctionnalités exclusives</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 rounded-lg border text-center bg-background">
            <h2 className="text-xl font-semibold mb-2">Mensuel</h2>
            <p className="text-3xl font-bold mb-4">4,99€</p>
            <p className="text-sm text-muted-foreground">Facturation mensuelle</p>
          </div>
          <div className="p-6 rounded-lg border text-center bg-background">
            <h2 className="text-xl font-semibold mb-2">À vie</h2>
            <p className="text-3xl font-bold mb-4">49,99€</p>
            <p className="text-sm text-muted-foreground">Paiement unique</p>
          </div>
        </div>

        <div className="text-center">
          <PulseButton size="lg">Essai 7 jours</PulseButton>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
