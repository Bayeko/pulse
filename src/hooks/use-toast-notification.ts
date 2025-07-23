import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ToastNotificationOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export const useToastNotification = () => {
  const { toast } = useToast();

  const showSuccess = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: 'default',
    });
  };

  const showError = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: 'destructive',
    });
  };

  const showCustom = (options: ToastNotificationOptions) => {
    toast(options);
  };

  // Simulate receiving notifications from partner
  const simulatePartnerNotification = () => {
    const notifications = [
      { title: "💕 New pulse from Alex", description: "Your partner sent you a heart!" },
      { title: "📅 Calendar reminder", description: "Date night in 30 minutes" },
      { title: "💬 New message", description: "Alex: Can't wait to see you tonight!" },
    ];

    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    showSuccess(randomNotification.title, randomNotification.description);
  };

  return {
    showSuccess,
    showError,
    showCustom,
    simulatePartnerNotification
  };
};