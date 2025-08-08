import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Button } from '../ui/button';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';

export const SnoozeToggle: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  if (!user) return null;

  const isSnoozed = user.snoozeUntil && new Date(user.snoozeUntil) > new Date();

  const updateSnooze = async (hours: number | null) => {
    if (!user) return;
    try {
      const snooze_until = hours
        ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
        : null;
      await supabase
        .from('profiles')
        .update({ snooze_until })
        .eq('user_id', user.id);
      await refreshUser();
      if (hours && user.partnerId) {
        try {
          await supabase.functions.invoke('send-push', {
            body: {
              receiver_id: user.partnerId,
              title: 'Pulse',
              body: `${user.name} est occupé·e pour l’instant`,
            },
          });
        } catch (error) {
          console.error('Error sending push notification:', error);
        }
      }
      toast({
        title: 'Snooze updated',
        description: hours
          ? `Notifications muted for ${hours} hours.`
          : 'Snooze disabled.',
      });
    } catch (error) {
      console.error('Error updating snooze:', error);
      toast({
        title: 'Error',
        description: 'Failed to update snooze.',
        variant: 'destructive',
      });
    }
  };

  if (isSnoozed) {
    return (
      <div className="space-y-2">
        <h3 className="font-medium text-foreground">Snooze</h3>
        <p className="text-sm text-muted-foreground">
          Snoozed until {format(new Date(user.snoozeUntil!), 'PPpp')}
        </p>
        <Button size="sm" onClick={() => updateSnooze(null)}>
          Cancel Snooze
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-foreground">Snooze</h3>
      <ToggleGroup
        type="single"
        className="grid grid-cols-2 gap-2"
        onValueChange={(val) => {
          if (val === '8') updateSnooze(8);
          if (val === '24') updateSnooze(24);
        }}
      >
        <ToggleGroupItem value="8" className="w-full">
          8h
        </ToggleGroupItem>
        <ToggleGroupItem value="24" className="w-full">
          24h
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default SnoozeToggle;

