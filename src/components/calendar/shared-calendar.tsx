import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Heart, Plus, Sparkles, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { scheduleReminder } from '@/lib/reminders';

interface TimeSlot {
  id: string;
  user_id: string;
  start: string;
  end: string;
  date: string;
  type: 'mutual' | 'suggested' | 'booked';
  title?: string | null;
}

interface Suggestion {
  date: string;
  start: string;
  end: string;
  display: string;
  match: string;
  reason: string;
}

interface SharedCalendarProps {
  className?: string;
}

export const SharedCalendar: React.FC<SharedCalendarProps> = ({ className }) => {
  const { user } = useAuth();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [partnerSlots, setPartnerSlots] = useState<TimeSlot[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedDate, setSelectedDate] = useState('2024-01-15');
  const [view, setView] = useState<'week' | 'suggestions'>('week');
  const [showMutualOnly, setShowMutualOnly] = useState(false);

  const parseTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const formatDisplay = (date: string, start: string, end: string) => {
    const dateObj = new Date(`${date}T${start}`);
    const today = new Date().toISOString().split('T')[0];
    const dayLabel = date === today
      ? 'Today'
      : dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const startStr = new Date(`${date}T${start}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const endStr = new Date(`${date}T${end}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${dayLabel}, ${startStr} - ${endStr}`;
  };

  const computeMatchAndReason = (date: string, startMinutes: number) => {
    const day = new Date(date).getDay();
    const isWeekend = day === 0 || day === 6;
    let match = 85;
    let reason = 'Morning time';
    if (startMinutes >= 18 * 60) {
      match = 95;
      reason = 'Evening time';
    } else if (startMinutes >= 12 * 60) {
      match = 90;
      reason = 'Afternoon time';
    }
    if (isWeekend) {
      match += 2;
      reason += ' on weekend';
    }
    return { match: `${match}%`, reason };
  };

  const generateSuggestions = useCallback((mine: TimeSlot[], partner: TimeSlot[]): Suggestion[] => {
    const suggestions: Suggestion[] = [];
    const partnerByDate = partner.reduce<Record<string, TimeSlot[]>>((acc, slot) => {
      if (slot.type === 'booked') return acc;
      acc[slot.date] = acc[slot.date] || [];
      acc[slot.date].push(slot);
      return acc;
    }, {});

    mine.forEach(slot => {
      if (slot.type === 'booked') return;
      const sameDay = partnerByDate[slot.date] || [];
      sameDay.forEach(pSlot => {
        const start = Math.max(parseTime(slot.start), parseTime(pSlot.start));
        const end = Math.min(parseTime(slot.end), parseTime(pSlot.end));
        if (start < end) {
          const startStr = minutesToTime(start);
          const endStr = minutesToTime(end);
          const { match, reason } = computeMatchAndReason(slot.date, start);
          suggestions.push({
            date: slot.date,
            start: startStr,
            end: endStr,
            display: formatDisplay(slot.date, startStr, endStr),
            match,
            reason
          });
        }
      });
    });

    return suggestions.sort((a, b) => parseInt(b.match) - parseInt(a.match)).slice(0, 3);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchSlots = async () => {
      const { data: myData, error: myError } = await supabase
        .from('time_slots')
        .select('*')
        .eq('user_id', user.id);
      if (!myError && myData) {
        setTimeSlots(myData as TimeSlot[]);
      }

      if (user.partnerId) {
        const { data: partnerData, error: partnerError } = await supabase
          .from('time_slots')
          .select('*')
          .eq('user_id', user.partnerId);
        if (!partnerError && partnerData) {
          setPartnerSlots(partnerData as TimeSlot[]);
        }
      } else {
        setPartnerSlots([]);
      }
    };

    fetchSlots();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setSuggestions(generateSuggestions(timeSlots, partnerSlots));
  }, [timeSlots, partnerSlots, user, generateSuggestions]);

  const addTimeSlot = async () => {
    if (!user) return;
    const start = prompt('Start time (HH:MM)');
    const end = prompt('End time (HH:MM)');
    if (!start || !end) return;
    const title = prompt('Title') || null;
    const { data, error } = await supabase
      .from('time_slots')
      .insert({ user_id: user.id, start, end, date: selectedDate, type: 'mutual', title })
      .select()
      .single();
    if (!error && data) {
      setTimeSlots(prev => [...prev, data as TimeSlot]);
    }
  };

  const updateTimeSlot = async (id: string) => {
    if (!user) return;
    const start = prompt('Start time (HH:MM)');
    const end = prompt('End time (HH:MM)');
    if (!start || !end) return;
    const title = prompt('Title') || null;
    const { data, error } = await supabase
      .from('time_slots')
      .update({ start, end, title })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (!error && data) {
      setTimeSlots(prev => prev.map(slot => (slot.id === id ? (data as TimeSlot) : slot)));
    }
  };

  const deleteTimeSlot = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('time_slots')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) {
      setTimeSlots(prev => prev.filter(slot => slot.id !== id));
    }
  };

  const handleAcceptSuggestion = async (suggestion: Suggestion) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('time_slots')
      .insert({
        user_id: user.id,
        start: suggestion.start,
        end: suggestion.end,
        date: suggestion.date,
        type: 'booked',
        title: suggestion.reason
      })
      .select()
      .single();
    if (!error && data) {
      setTimeSlots(prev => [...prev, data as TimeSlot]);
    }
  };

  const handleDeferSuggestion = async (suggestion: Suggestion) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('time_slots')
      .insert({
        user_id: user.id,
        start: suggestion.start,
        end: suggestion.end,
        date: suggestion.date,
        type: 'suggested',
        title: suggestion.reason
      })
      .select()
      .single();
    if (!error && data) {
      setTimeSlots(prev => [...prev, data as TimeSlot]);
    }

    const now = new Date();
    const nextSlot = timeSlots
      .filter(s => s.type === 'mutual')
      .map(s => ({ ...s, dateTime: new Date(`${s.date}T${s.start}`) }))
      .filter(s => s.dateTime > now)
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())[0];

    if (nextSlot) {
      scheduleReminder(user.id, nextSlot);
    }
  };

  const weekDays = [
    { date: '2024-01-15', day: 'Mon', dayNum: '15' },
    { date: '2024-01-16', day: 'Tue', dayNum: '16' },
    { date: '2024-01-17', day: 'Wed', dayNum: '17' },
    { date: '2024-01-18', day: 'Thu', dayNum: '18' },
    { date: '2024-01-19', day: 'Fri', dayNum: '19' },
    { date: '2024-01-20', day: 'Sat', dayNum: '20' },
    { date: '2024-01-21', day: 'Sun', dayNum: '21' },
  ];

  const getSlotTypeInfo = (type: TimeSlot['type']) => {
    switch (type) {
      case 'mutual':
        return { 
          color: 'bg-primary/20 border-primary text-primary',
          icon: <Heart className="w-3 h-3" />,
          label: 'Perfect Match'
        };
      case 'suggested':
        return { 
          color: 'bg-accent/20 border-accent text-accent-foreground',
          icon: <Sparkles className="w-3 h-3" />,
          label: 'AI Suggestion'
        };
      case 'booked':
        return { 
          color: 'bg-success/20 border-success text-success-foreground',
          icon: <Calendar className="w-3 h-3" />,
          label: 'Confirmed'
        };
    }
  };

  const getSlotsForDate = (date: string) => {
    return timeSlots.filter(
      slot => slot.date === date && (!showMutualOnly || slot.type === 'mutual')
    );
  };

  const slotsForSelectedDate = getSlotsForDate(selectedDate);
  const allSlotsForSelectedDate = timeSlots.filter(
    slot => slot.date === selectedDate
  );

  return (
    <Card className={cn("shadow-card animate-scale-in", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-serif">
            <Calendar className="w-5 h-5 text-primary" />
            Shared Calendar
          </CardTitle>
          <div className="flex gap-2">
            <Badge
              variant={view === 'week' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setView('week')}
            >
              Week
            </Badge>
            <Badge
              variant={view === 'suggestions' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setView('suggestions')}
            >
              Suggestions
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {view === 'week' ? (
          <>
            {/* Week View */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDays.map((day) => {
                const isSelected = selectedDate === day.date;
                const hasSlots = getSlotsForDate(day.date).length > 0;
                
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={cn(
                      "p-2 rounded-lg text-center transition-all duration-200",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : hasSlots
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <div className="text-xs font-medium">{day.day}</div>
                    <div className="text-sm">{day.dayNum}</div>
                    {hasSlots && (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mx-auto mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Slots */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {selectedDate === '2024-01-15' ? 'Today' :
                   new Date(selectedDate).toLocaleDateString('en-US', {
                     weekday: 'long',
                     month: 'short',
                     day: 'numeric'
                   })}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={showMutualOnly ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => setShowMutualOnly(!showMutualOnly)}
                  >
                    Mutual Only
                  </Badge>
                  <PulseButton variant="ghost" size="sm" onClick={addTimeSlot}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Time Slot
                  </PulseButton>
                </div>
              </div>

              {slotsForSelectedDate.length > 0 ? (
                <div className="space-y-2">
                  {slotsForSelectedDate.map((slot) => {
                    const typeInfo = getSlotTypeInfo(slot.type);
                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          "p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02]",
                          typeInfo.color
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {typeInfo.icon}
                            <span className="font-medium">
                              {slot.start} - {slot.end}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {typeInfo.label}
                            </Badge>
                            <button
                              onClick={() => updateTimeSlot(slot.id)}
                              className="p-1 hover:text-foreground text-muted-foreground"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteTimeSlot(slot.id)}
                              className="p-1 hover:text-destructive text-destructive/80"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {slot.title && (
                          <p className="text-sm mt-1 opacity-90">{slot.title}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>
                    {showMutualOnly && allSlotsForSelectedDate.length > 0
                      ? 'No mutual time slots for this day'
                      : 'No time slots for this day'}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* AI Suggestions View */
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI-Powered Suggestions</span>
            </div>

            <div className="space-y-3">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-card rounded-lg border border-primary/20 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{suggestion.display}</span>
                      <Badge variant="outline" className="text-primary border-primary">
                        {suggestion.match} match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{suggestion.reason}</p>
                    <div className="flex gap-2">
                      <PulseButton
                        variant="soft"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAcceptSuggestion(suggestion)}
                      >
                        Accepter
                      </PulseButton>
                      <PulseButton
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDeferSuggestion(suggestion)}
                      >
                        Plus tard
                      </PulseButton>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No matching time slots found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};