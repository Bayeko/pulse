import React from 'react';
import { SharedCalendar } from '@/components/calendar/shared-calendar';
import { PulseButton } from '@/components/ui/pulse-button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Calendar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
              <h1 className="text-3xl font-serif font-bold text-foreground">Calendar</h1>
              <p className="text-muted-foreground">Plan your time together</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <SharedCalendar />
        </div>
      </div>
    </div>
  );
};

export default Calendar;