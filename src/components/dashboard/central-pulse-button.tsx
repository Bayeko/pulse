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

    // Check partner availability via status field if present
    const partnerStatus = (user as unknown as { partnerStatus?: string })?.partnerStatus;
    if (partnerStatus === 'away' || partnerStatus === 'offline') {
      toast({
        description: 'Merci, on se retrouve plus tard !',
      });
      return;
    }

    try {
      const { data: profile, error: statusError } = await supabase
        .from('profiles')
        .select('status')
        .eq('user_id', user.partnerId)
        .maybeSingle();

      if (!statusError && (profile?.status === 'away' || profile?.status === 'offline')) {
        toast({ description: 'Merci, on se retrouve plus tard !' });
        return;
      }

      const { data: lastMessage, error: messageError } = await supabase
        .from('messages')
        .select('content')
        .eq('sender_id', user.partnerId)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!messageError && lastMessage?.content === '⏰ Pas dispo') {
        toast({ description: 'Merci, on se retrouve plus tard !' });
        return;
      }
    } catch (err) {
      console.error('Error checking partner availability:', err);
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
        state !== 'idle' && 'animate-pulse',
        className
      )}
    >
      {state === 'sent' ? (
        <Check className="w-8 h-8" />
      ) : (
        <Heart className="w-8 h-8" />
      )}
    </button>
  );
};

export default CentralPulseButton;
