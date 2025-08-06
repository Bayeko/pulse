import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { scheduleSurprise } from '@/lib/reminders';

const SurpriseMode: React.FC = () => {
  const [ideas, setIdeas] = useState<string[]>([]);
  const [currentIdea, setCurrentIdea] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const res = await fetch('/surprise-ideas.json');
        const data: string[] = await res.json();
        setIdeas(data);
        if (data.length > 0) {
          setCurrentIdea(data[Math.floor(Math.random() * data.length)]);
        }
      } catch (error) {
        console.error('Failed to load ideas', error);
      }
    };

    loadIdeas();
  }, []);

  const pickRandom = () => {
    if (ideas.length === 0) return;
    setCurrentIdea(ideas[Math.floor(Math.random() * ideas.length)]);
  };

  const handleSchedule = async () => {
    if (!user || !currentIdea || !scheduledAt) return;
    try {
      await scheduleSurprise(user.id, currentIdea, scheduledAt);
      toast({ title: 'Surprise scheduled', description: 'We\'ll remind you!' });
      setScheduledAt('');
    } catch (error) {
      console.error('Failed to schedule surprise', error);
      toast({
        title: 'Failed to schedule',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <PulseButton variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </PulseButton>
          <h1 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Surprise Mode
          </h1>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <Sparkles className="w-5 h-5 text-primary" />
              Idea
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-center">{currentIdea || 'Loading...'}</p>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <div className="flex justify-center gap-2">
                <PulseButton onClick={pickRandom}>Another Idea</PulseButton>
                <PulseButton onClick={handleSchedule} disabled={!scheduledAt}>
                  Schedule
                </PulseButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

export default SurpriseMode;

