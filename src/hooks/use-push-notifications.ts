import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
          if (!publicKey) {
            console.warn('VAPID public key is not set');
            return;
          }
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
        }

        const { data: { user } } = await supabase.auth.getUser();
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
        console.error('Error registering push notifications', error);
      }
    };

    register();
  }, []);
}
