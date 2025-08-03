import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';

const items = [
  { title: 'Code Pulse', description: 'Exprimez vos envies par pulsations discrètes.' },
  { title: 'Statut', description: 'Partagez votre disponibilité en temps réel.' },
  { title: 'Agenda', description: 'Planifiez des moments à deux facilement.' },
];

export const StepIntro: React.FC = () => {
  const navigate = useNavigate();

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
      <div className="flex justify-center">
        <PulseButton onClick={() => navigate('/auth?mode=connect')}>
          Inviter mon/ma partenaire
        </PulseButton>
      </div>
    </div>
  );
};
