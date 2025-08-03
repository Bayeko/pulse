import React, { useState } from 'react';
import { Heart, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CentralPulseButtonProps {
  className?: string;
}

type PulseState = 'idle' | 'sending' | 'sent';

export const CentralPulseButton: React.FC<CentralPulseButtonProps> = ({ className }) => {
  const { user } = useAuth();
  const [state, setState] = useState<PulseState>('idle');
  const { toast } = useToast();

  const handleClick = async () => {
    if (!user || !user.partnerId) return;

    const now = new Date();
    if (user.snoozeUntil && new Date(user.snoozeUntil) > now) {
      toast({
        title: 'Snoozed',
        description: 'You are currently snoozed.',
      });
      return;
    }
    if (user.partnerSnoozeUntil && new Date(user.partnerSnoozeUntil) > now) {
      toast({
        title: 'Partner snoozed',
        description: 'Your partner is currently snoozed.',
      });
      return;
    }

    navigator.vibrate?.(50);

    setState('sending');

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
      return;
    }

    setTimeout(() => {
      setState('idle');
    }, 1000);
  };

  return (
    <button
      aria-label="Send Pulse"
      onClick={handleClick}
      className={cn(
        'relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-primary text-primary-foreground shadow-glow',
        state === 'sending' && 'animate-pulse',
        className
      )}
    >
      {state === 'sending' && (
        <span className="pointer-events-none absolute inset-0 rounded-full bg-primary/40 animate-ping" />
      )}
      {state === 'sent' ? (
        <Check className="w-8 h-8" />
      ) : (
        <Heart className="w-8 h-8" />
      )}
    </button>
  );
};

export default CentralPulseButton;
