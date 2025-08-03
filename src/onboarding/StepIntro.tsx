import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n';

const items = [
  { title: 'Code Pulse', description: 'Exprimez vos envies par pulsations discrètes.' },
  { title: 'Statut', description: 'Partagez votre disponibilité en temps réel.' },
  { title: 'Agenda', description: 'Planifiez des moments à deux facilement.' },
];

export const StepIntro: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const handleInvite = () => {
    if (user) {
      navigate('/pair');
    } else {
      navigate('/auth?mode=connect');
    }
  };

  return (
    <div className="space-y-8">
      <Carousel className="w-full max-w-md mx-auto">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index}>
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <PulseButton onClick={() => navigate('/auth?mode=register')}>
          {t('createAccount')}
        </PulseButton>
        <PulseButton variant="ghost" onClick={() => navigate('/auth?mode=connect')}>
          {t('joinPartner')}
        </PulseButton>
      </div>
      <div className="flex justify-center">
        <PulseButton onClick={handleInvite}>
          {t('invitePartner')}
        </PulseButton>
      </div>
    </div>
  );
};
