import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PulseButton } from '@/components/ui/pulse-button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Contact: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [email, setEmail] = useState<string>(user?.email || '');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const request = { email, message, date: new Date().toISOString() };
    if (!isOnline) {
      const stored = JSON.parse(localStorage.getItem('contactRequests') || '[]');
      stored.push(request);
      localStorage.setItem('contactRequests', JSON.stringify(stored));
    } else {
      console.log('Submitting contact request', request);
    }
    toast({ description: 'Request submitted' });
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            {!isOnline && (
              <p className="mb-4 text-sm text-muted-foreground">
                You are offline. Your request will be saved locally.
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <PulseButton type="submit">Submit</PulseButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
