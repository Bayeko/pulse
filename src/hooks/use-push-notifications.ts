import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as Notifications from 'expo-notifications';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function usePushNotifications() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    const register = async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');

          let subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            const publicKey = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicKey) {
              console.warn('VAPID public key is not set');
              return;
            }
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicKey),
            });
          }

          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const { endpoint, keys } = subscription.toJSON();
            await supabase.from('push_subscriptions').insert({
              endpoint,
              auth: keys?.auth ?? '',
              p256dh: keys?.p256dh ?? '',
              user_id: user.id,
            });
          }
        } catch (error) {
          console.error('Error registering service worker push notifications', error);
        }
      } else {
        try {
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

          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('push_subscriptions').insert({
              endpoint: token,
              auth: '',
              p256dh: '',
              user_id: user.id,
            });
          }
        } catch (error) {
          console.error('Error registering Expo push notifications', error);
        }
      }
    };

    register();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('Notification received', notification);
      },
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('Notification response received', response);
      },
    );

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

