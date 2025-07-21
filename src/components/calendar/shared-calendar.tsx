import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Heart, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  date: string;
  type: 'mutual' | 'suggested' | 'booked';
  title?: string;
}

const mockTimeSlots: TimeSlot[] = [
  { id: '1', start: '19:00', end: '21:00', date: '2024-01-15', type: 'mutual', title: 'Evening Together' },
  { id: '2', start: '14:00', end: '16:00', date: '2024-01-16', type: 'suggested' },
  { id: '3', start: '20:00', end: '22:00', date: '2024-01-17', type: 'mutual' },
  { id: '4', start: '18:30', end: '20:30', date: '2024-01-18', type: 'booked', title: 'Date Night' },
];

interface SharedCalendarProps {
  className?: string;
}

export const SharedCalendar: React.FC<SharedCalendarProps> = ({ className }) => {
  const [selectedDate, setSelectedDate] = useState('2024-01-15');
  const [view, setView] = useState<'week' | 'suggestions'>('week');

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
    return mockTimeSlots.filter(slot => slot.date === date);
  };

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
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {selectedDate === '2024-01-15' ? 'Today' : 
                 new Date(selectedDate).toLocaleDateString('en-US', { 
                   weekday: 'long', 
                   month: 'short', 
                   day: 'numeric' 
                 })}
              </h3>
              
              {getSlotsForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getSlotsForDate(selectedDate).map((slot) => {
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
                          <Badge variant="outline" className="text-xs">
                            {typeInfo.label}
                          </Badge>
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
                  <p>No time slots for this day</p>
                  <PulseButton variant="ghost" size="sm" className="mt-2">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Time Slot
                  </PulseButton>
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
              {[
                { time: 'Tonight, 8:00 PM - 10:00 PM', match: '95%', reason: 'Both free, favorite time' },
                { time: 'Tomorrow, 2:00 PM - 4:00 PM', match: '87%', reason: 'Weekend afternoon' },
                { time: 'Friday, 7:30 PM - 9:30 PM', match: '92%', reason: 'End of week celebration' }
              ].map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-card rounded-lg border border-primary/20 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{suggestion.time}</span>
                    <Badge variant="outline" className="text-primary border-primary">
                      {suggestion.match} match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{suggestion.reason}</p>
                  <PulseButton variant="soft" size="sm" className="w-full">
                    Book This Time
                  </PulseButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};