import React, { useState } from 'react';
import { Heart, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface CentralPulseButtonProps {
  className?: string;
}

type PulseState = 'idle' | 'sending' | 'sent';

export const CentralPulseButton: React.FC<CentralPulseButtonProps> = ({ className }) => {
  const { user } = useAuth();
  const [state, setState] = useState<PulseState>('idle');
  const [showHalo, setShowHalo] = useState(false);

  const handleClick = async () => {
    if (!user || !user.partnerId) return;

    navigator.vibrate?.(50);

    setState('sending');
    setShowHalo(true);

    try {
      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: user.partnerId,
        content: 'pulse',
        type: 'pulse'
      });
      setState('sent');
    } catch (error) {
      console.error('Error sending pulse:', error);
      setState('idle');
      setShowHalo(false);
      return;
    }

    setTimeout(() => {
      setState('idle');
      setShowHalo(false);
    }, 1000);
  };

  return (
    <button
      aria-label="Send Pulse"
      onClick={handleClick}
      className={cn(
        'relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-primary text-primary-foreground shadow-glow',
        state !== 'idle' && 'animate-pulse',
        className
      )}
    >
      {showHalo && (
        <span className="absolute inset-0 rounded-full border-4 border-primary/50 pointer-events-none animate-pulse-halo" />
      )}
      {state === 'sent' ? (
        <Check className="w-8 h-8 animate-scale-in" />
      ) : (
        <Heart
          className={cn(
            'w-8 h-8 transition-opacity',
            state === 'sending' && 'opacity-50'
          )}
        />
      )}
    </button>
  );
};

export default CentralPulseButton;
