import React from 'react';
import { PulseStatusCard } from '@/components/dashboard/pulse-status';
import { EmojiPicker } from '@/components/communication/emoji-picker';
import { SharedCalendar } from '@/components/calendar/shared-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { Badge } from '@/components/ui/badge';
import { Heart, Bell, Settings, Shield, Calendar, MessageCircle, LogOut, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import logger from '@/lib/logger';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleEmojiSend = (emoji: string, category: string) => {
    logger.info(`Sending ${emoji} from ${category} category`);
    // Here you would implement the actual sending logic
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                <span className="text-xl">💝</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Pulse - {user?.name}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {user?.partnerId ? (
                <span className="text-sm text-muted-foreground mr-2">
                  Connected with {user.partnerName}
                </span>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground mr-2">
                    {t('notLinked')}
                  </span>
                  <PulseButton
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/pair')}
                  >
                    {t('joinPartner')}
                  </PulseButton>
                </>
              )}
              <PulseButton variant="ghost" size="sm" title="Notifications">
                <Bell className="w-4 h-4" />
              </PulseButton>
              <PulseButton
                variant="ghost"
                size="sm"
                title="Surprise Mode"
                onClick={() => navigate('/surprise-mode')}
              >
                <Sparkles className="w-4 h-4" />
              </PulseButton>
              <PulseButton
                variant="ghost"
                size="sm"
                title="Profile"
                onClick={() => navigate('/settings')}
              >
                <User className="w-4 h-4" />
              </PulseButton>
              <PulseButton variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                <LogOut className="w-4 h-4" />
              </PulseButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <PulseStatusCard />
            
            {/* Recent Activity */}
            <Card className="shadow-card animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Recent Pulses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { emoji: '💕', time: '2 min ago', from: 'Alex', type: 'received' },
                  { emoji: '😘', time: '15 min ago', from: 'You', type: 'sent' },
                  { emoji: '🔥', time: '1 hour ago', from: 'Alex', type: 'received' },
                ].map((pulse, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    <span className="text-2xl">{pulse.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {pulse.type === 'sent' ? 'You sent' : `${pulse.from} sent`}
                      </p>
                      <p className="text-xs text-muted-foreground">{pulse.time}</p>
                    </div>
                    <Badge variant={pulse.type === 'sent' ? 'secondary' : 'outline'}>
                      {pulse.type === 'sent' ? 'Sent' : 'Received'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center Column */}
          <div className="lg:col-span-1 space-y-6">
            <EmojiPicker onSend={handleEmojiSend} />
            
            {/* Quick Stats */}
            <Card className="shadow-card animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Heart className="w-5 h-5 text-primary" />
                  Connection Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">47</div>
                    <div className="text-xs text-muted-foreground">Pulses This Week</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">12</div>
                    <div className="text-xs text-muted-foreground">Perfect Matches</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">3</div>
                    <div className="text-xs text-muted-foreground">Dates Planned</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">95%</div>
                    <div className="text-xs text-muted-foreground">Sync Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <SharedCalendar />
            
            {/* Privacy Notice */}
            <Card className="shadow-card animate-scale-in bg-gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-primary">
                  <Shield className="w-5 h-5" />
                  Privacy Protected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span>End-to-end encryption active</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span>No data shared with third parties</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span>Local storage only</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Your {t('intimacy')} stays between you two, always.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;