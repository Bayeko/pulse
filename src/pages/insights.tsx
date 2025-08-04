import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Sparkles, BarChart3, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { fetchEnergyCycleMetrics } from '@/integrations/wearable';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PulseRecord {
  created_at: string;
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fullDayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Insights: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<{ day: string; pulses: number }[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const isPremium = Boolean((user as { is_premium?: boolean } | null)?.is_premium);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      const { data } = await supabase
        .from('messages')
        .select('created_at')
        .eq('type', 'pulse')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      const pulses = (data as PulseRecord[]) || [];
      const dayCounts = Array(7).fill(0);
      const hourCounts = Array(24).fill(0);

      pulses.forEach((p) => {
        const date = new Date(p.created_at);
        dayCounts[date.getDay()]++;
        hourCounts[date.getHours()]++;
      });

      setChartData(dayLabels.map((d, i) => ({ day: d, pulses: dayCounts[i] })));

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

        <Card className="relative shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <BarChart3 className="w-5 h-5 text-primary" />
              Pulse Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(!isPremium && 'blur-sm pointer-events-none')}>
              <ChartContainer
                className="h-64 w-full"
                config={{ pulses: { label: 'Pulses', color: 'hsl(var(--primary))' } }}
              >
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Bar dataKey="pulses" fill="var(--color-pulses)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>

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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
