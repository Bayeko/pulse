import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as Notifications from 'expo-notifications';

export function usePushNotifications() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    const register = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Permission not granted for push notifications');
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = typeof tokenData === 'string' ? tokenData : tokenData.data;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('push_subscriptions').insert({
          endpoint: token,
          auth: '',
          p256dh: '',
          user_id: user.id,
        });
      }
    };

    register();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
}
