import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PulseButton } from '@/components/ui/pulse-button';

interface Pulse {
  id: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

const History: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyEnabled, setHistoryEnabled] = useState(true);

  useEffect(() => {
    const enabled = localStorage.getItem('historyEnabled');
    if (enabled !== null) {
      setHistoryEnabled(enabled === 'true');
    }
  }, []);

  useEffect(() => {
    if (!user || !user.partnerId || !historyEnabled) {
      setLoading(false);
      return;
    }

    const fetchPulses = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, created_at')
        .eq('type', 'pulse')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${user.partnerId}),and(sender_id.eq.${user.partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPulses(data as Pulse[]);
      } else {
        console.error('Error fetching pulses:', error);
      }
      setLoading(false);
    };

    fetchPulses();
  }, [user, historyEnabled]);

  const now = new Date();
  const monthlyCount = pulses.filter((p) => {
    const date = new Date(p.created_at);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <PulseButton
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </PulseButton>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">History</h1>
              <p className="text-muted-foreground">Your pulse history</p>
            </div>
          </div>
        </div>

        {!historyEnabled ? (
          <p className="text-center text-muted-foreground">Historique vide</p>
        ) : (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium">Pulses this month: {monthlyCount}</h2>
            </div>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : pulses.length === 0 ? (
              <p className="text-center text-muted-foreground">Historique vide</p>
            ) : (
              <ul className="space-y-2">
                {pulses.map((pulse) => (
                  <li
                    key={pulse.id}
                    className="p-3 bg-muted rounded-lg flex justify-between"
                  >
                    <span>
                      {pulse.sender_id === user?.id
                        ? 'You sent a pulse'
                        : `${user?.partnerName || 'Partner'} sent a pulse`}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(pulse.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

