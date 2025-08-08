import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CentralPulseButton } from './central-pulse-button';
import { StatusIndicator } from '../ui/status-indicator';
import { Heart, Moon, Coffee, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SnoozeToggle } from './snooze-toggle';
import { useTranslation } from '../../i18n';

type PulseStatus = 'active' | 'away' | 'offline';

interface PulseStatusProps {
  className?: string;
}

export const PulseStatusCard: React.FC<PulseStatusProps> = ({ className }) => {
  const [myStatus, setMyStatus] = useState<PulseStatus>('offline');
  const [partnerStatus] = useState<PulseStatus>('active');
  const { t } = useTranslation();

  const statusOptions = [
    {
      status: 'active' as PulseStatus,
      icon: Heart,
      label: t('statusReadyLabel'),
      description: t('statusReadyDescription')
    },
    {
      status: 'away' as PulseStatus,
      icon: Coffee,
      label: t('statusBusyLabel'),
      description: t('statusBusyDescription')
    },
    {
      status: 'offline' as PulseStatus,
      icon: Moon,
      label: t('statusNotAvailableLabel'),
      description: t('statusNotAvailableDescription')
    }
  ];

  return (
    <Card className={cn("shadow-card animate-scale-in", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Sparkles className="w-5 h-5 text-primary" />
          Pulse Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SnoozeToggle />

        {/* Partner Status */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Your Partner</h3>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Alex</p>
                <StatusIndicator status={partnerStatus} size="sm" />
              </div>
            </div>
            {partnerStatus === 'active' && (
              <div className="animate-pulse-glow">
                <Heart className="w-6 h-6 text-primary" />
              </div>
            )}
          </div>
        </div>

        {/* My Status */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Your Status</h3>
          <div className="grid grid-cols-1 gap-2">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = myStatus === option.status;
              
              return (
                <button
                  key={option.status}
                  onClick={() => setMyStatus(option.status)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                    isSelected 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs opacity-75">{option.description}</p>
                  </div>
                  {isSelected && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        {myStatus === 'active' && partnerStatus === 'active' && (
          <div className="p-4 bg-gradient-card rounded-lg border border-primary/20 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse-glow" />
              <span className="text-sm font-medium text-primary">Both Ready</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Perfect timing! You're both available for connection.
            </p>
            <div className="flex justify-center">
              <CentralPulseButton />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};