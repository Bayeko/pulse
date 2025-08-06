import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Sparkles, BarChart3, ArrowLeft, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { fetchEnergyCycleMetrics } from '@/integrations/wearable';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';

interface PulseRecord {
  created_at: string;
  sender_id: string;
  receiver_id: string;
}

interface TimeSlotRecord {
  start: string;
  end: string;
  date: string;
  title: string | null;
  type: string;
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hourLabels = Array.from({ length: 24 }, (_, i) => i);
const fullDayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Insights: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [heatmap, setHeatmap] = useState<number[][]>(Array.from({ length: 7 }, () => Array(24).fill(0)));
  const [counts, setCounts] = useState({ sent: 0, received: 0, matched: 0 });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [microMinutes, setMicroMinutes] = useState(0);
  const isPremium = Boolean(user?.isPremium);
  const { t } = useTranslation();
  const maxHeat = Math.max(...heatmap.flat());

  useEffect(() => {
    if (!user) return;

    const parseTime = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const fetchHistory = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data } = await supabase
        .from('messages')
        .select('created_at,sender_id,receiver_id')
        .eq('type', 'pulse')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const pulses = (data as PulseRecord[]) || [];
      const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
      let sent = 0;
      let received = 0;
      const sentTimes: number[] = [];
      const receivedTimes: number[] = [];

      pulses.forEach((p) => {
        const date = new Date(p.created_at);
        grid[date.getDay()][date.getHours()]++;
        if (p.sender_id === user.id) {
          sent++;
          sentTimes.push(date.getTime());
        } else if (p.receiver_id === user.id) {
          received++;
          receivedTimes.push(date.getTime());
        }
      });

      sentTimes.sort();
      receivedTimes.sort();
      let i = 0;
      let j = 0;
      let matched = 0;
      while (i < sentTimes.length && j < receivedTimes.length) {
        const diff = sentTimes[i] - receivedTimes[j];
        if (Math.abs(diff) <= 60 * 60 * 1000) {
          matched++;
          i++;
          j++;
        } else if (diff < 0) {
          i++;
        } else {
          j++;
        }
      }

      setCounts({ sent, received, matched });
      setHeatmap(grid);

      const dayCounts = grid.map((row) => row.reduce((a, b) => a + b, 0));
      const hourCounts = Array(24).fill(0);
      grid.forEach((row) => row.forEach((c, h) => (hourCounts[h] += c)));

      const suggestionList: string[] = [];
      if (pulses.length > 0) {
        const topDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
        const topHourIndex = hourCounts.indexOf(Math.max(...hourCounts));
        const hourDate = new Date();
        hourDate.setHours(topHourIndex, 0, 0, 0);
        const formattedHour = hourDate.toLocaleTimeString([], { hour: 'numeric' });
        suggestionList.push(
          `Most pulses land on ${fullDayLabels[topDayIndex]}s`,
          `Peak hour is around ${formattedHour}`
        );
      } else {
        suggestionList.push('No pulse history yet. Send some pulses to see insights!');
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      const { data: microData } = await supabase
        .from('time_slots')
        .select('start,end,date,title,type')
        .eq('user_id', user.id)
        .eq('type', 'booked')
        .eq('title', 'Micro-sieste')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lt('date', endOfMonth.toISOString().split('T')[0]);

      const totalMicro = (microData as TimeSlotRecord[] | null)?.reduce(
        (sum, slot) => sum + (parseTime(slot.end) - parseTime(slot.start)),
        0,
      ) ?? 0;
      setMicroMinutes(totalMicro);

      const energyCycle = await fetchEnergyCycleMetrics();
      if (energyCycle?.phase) {
        suggestionList.push(`Current energy cycle: ${energyCycle.phase}`);
      }

      setSuggestions(suggestionList);
    };

    fetchHistory();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <PulseButton variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </PulseButton>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Insights</h1>
            <p className="text-muted-foreground">Understand your pulse habits</p>
          </div>
        </div>

        <Card className="relative shadow-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <Heart className="w-5 h-5 text-primary" />
              Time d'intimité gagné
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{microMinutes} min</p>
          </CardContent>
        </Card>

        <Card className="relative shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <BarChart3 className="w-5 h-5 text-primary" />
              Pulse Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(!isPremium && 'blur-sm pointer-events-none')}>
              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Sent</p>
                  <p className="text-2xl font-bold">{counts.sent}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Received</p>
                  <p className="text-2xl font-bold">{counts.received}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matched</p>
                  <p className="text-2xl font-bold">{counts.matched}</p>
                </div>
              </div>

              <div
                className="ml-8 mb-2 grid text-[10px] text-muted-foreground"
                style={{ gridTemplateColumns: 'repeat(24,minmax(0,1fr))' }}
              >
                {hourLabels.map((h) => (
                  <div key={h} className="text-center">
                    {h}
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {heatmap.map((row, day) => (
                  <div key={day} className="flex items-center">
                    <div className="w-8 text-xs text-muted-foreground">
                      {dayLabels[day]}
                    </div>
                    <div
                      className="grid gap-[1px] flex-1"
                      style={{ gridTemplateColumns: 'repeat(24,minmax(0,1fr))' }}
                    >
                      {row.map((c, hour) => (
                        <div
                          key={hour}
                          className="h-4"
                          style={{
                            backgroundColor: 'hsl(var(--primary))',
                            opacity: maxHeat ? c / maxHeat : 0,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <ul className="mt-4 space-y-2 text-sm">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {!isPremium && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <p className="text-sm text-muted-foreground text-center">
                  Upgrade to premium to unlock insights
                </p>
                <PulseButton onClick={() => navigate('/paywall')}>Go Premium</PulseButton>
                <p className="text-xs text-muted-foreground text-center">
                  {t('premiumNoPulseFrequency')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
