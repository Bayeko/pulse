import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as Notifications from 'expo-notifications';
import { VAPID_PUBLIC_KEY } from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';

const TRIAL_START_KEY = 'trialStartDate';
const TRIAL_NOTIFICATION_ID_KEY = 'trialNotificationId';
const PREFERRED_SLOT_KEY = 'preferredSlot';
const PREFERRED_SLOT_NOTIFICATION_ID_KEY = 'preferredSlotNotificationId';

const getItem = async (key: string): Promise<string | null> => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return AsyncStorage.getItem(key);
};

const setItem = async (key: string, value: string) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
};

const removeItem = async (key: string) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
};

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
  const { user } = useAuth();
  const parentMode = user?.parentMode;
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: !parentMode,
        shouldSetBadge: false,
      }),
    });

    const pruneSubscription = async (endpoint?: string) => {
      try {
        if (endpoint) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
          return;
        }
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            const { endpoint: currentEndpoint } = subscription.toJSON();
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', currentEndpoint);
            await subscription.unsubscribe();
          }
        } else {
          const tokenData = await Notifications.getExpoPushTokenAsync();
          const token = typeof tokenData === 'string' ? tokenData : tokenData.data;
          await supabase.from('push_subscriptions').delete().eq('endpoint', token);
        }
      } catch (err) {
        console.error('Error pruning push subscription', err);
      }
    };

    const register = async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');

          let subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            if (!VAPID_PUBLIC_KEY) {
              console.warn('VAPID public key is not set');
              return;
            }
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });
          }

          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const { endpoint, keys } = subscription.toJSON();
            try {
              await supabase
                .from('push_subscriptions')
                .upsert(
                  {
                    endpoint,
                    auth: keys?.auth ?? '',
                    p256dh: keys?.p256dh ?? '',
                    user_id: user.id,
                  },
                  { onConflict: 'user_id,endpoint' },
                );
            } catch (error) {
              await pruneSubscription(endpoint);
              throw error;
            }
          }
        } catch (error) {
          await pruneSubscription();
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
            try {
              await supabase
                .from('push_subscriptions')
                .upsert(
                  {
                    endpoint: token,
                    auth: '',
                    p256dh: '',
                    user_id: user.id,
                  },
                  { onConflict: 'user_id,endpoint' },
                );
            } catch (error) {
              await pruneSubscription(token);
              throw error;
            }
          }
        } catch (error) {
          await pruneSubscription();
          console.error('Error registering Expo push notifications', error);
        }
      }
    };

    register();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        if (parentMode && typeof window !== 'undefined') {
          if ('vibrate' in navigator) navigator.vibrate(20);
          if (typeof document !== 'undefined') {
            document.documentElement.style.filter = 'brightness(0.5)';
            setTimeout(() => {
              document.documentElement.style.filter = '';
            }, 2000);
          }
        }
        console.log('Notification received', notification);
      },
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('Notification response received', response);
      },
    );

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async event => {
      if (event === 'SIGNED_OUT') {
        await pruneSubscription();
        const id = await getItem(TRIAL_NOTIFICATION_ID_KEY);
        if (id) {
          await Notifications.cancelScheduledNotificationAsync(id);
          await removeItem(TRIAL_NOTIFICATION_ID_KEY);
        }
        await removeItem(TRIAL_START_KEY);
        const preferredId = await getItem(PREFERRED_SLOT_NOTIFICATION_ID_KEY);
        if (preferredId) {
          await Notifications.cancelScheduledNotificationAsync(preferredId);
          await removeItem(PREFERRED_SLOT_NOTIFICATION_ID_KEY);
          await removeItem(PREFERRED_SLOT_KEY);
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      authSubscription.unsubscribe();
    };
  }, [user, parentMode]);

  useEffect(() => {
    const handleTrial = async () => {
      const storedId = await getItem(TRIAL_NOTIFICATION_ID_KEY);
      if (user && !user.isPremium) {
        const storedStart = await getItem(TRIAL_START_KEY);
        let startDate = storedStart ? new Date(storedStart) : null;
        if (!startDate) {
          startDate = new Date();
          await setItem(TRIAL_START_KEY, startDate.toISOString());
        }
        if (!storedId) {
          const triggerDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);
          const id = await Notifications.scheduleNotificationAsync({
            content: { body: 'Profitez de vos Insights avancés' },
            trigger: triggerDate,
          });
          await setItem(TRIAL_NOTIFICATION_ID_KEY, id);
        }
      } else {
        if (storedId) {
          await Notifications.cancelScheduledNotificationAsync(storedId);
          await removeItem(TRIAL_NOTIFICATION_ID_KEY);
        }
        await removeItem(TRIAL_START_KEY);
      }
    };

    handleTrial();
  }, [user]);

  useEffect(() => {
    const schedulePreferredSlot = async () => {
      if (!user?.isPremium) return;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data } = await supabase
        .from('messages')
        .select('created_at')
        .eq('type', 'pulse')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
      (data || []).forEach((p: { created_at: string }) => {
        const d = new Date(p.created_at);
        grid[d.getDay()][d.getHours()]++;
      });

      let topDay = 0;
      let topHour = 0;
      let max = 0;
      grid.forEach((row, day) =>
        row.forEach((cnt, hour) => {
          if (cnt > max) {
            max = cnt;
            topDay = day;
            topHour = hour;
          }
        }),
      );

      if (max === 0) return;

      const storedSlot = await getItem(PREFERRED_SLOT_KEY);
      const storedId = await getItem(PREFERRED_SLOT_NOTIFICATION_ID_KEY);
      if (storedSlot) {
        const { day, hour } = JSON.parse(storedSlot);
        if (day === topDay && hour === topHour && storedId) return;
      }
      if (storedId) {
        await Notifications.cancelScheduledNotificationAsync(storedId);
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: { body: "It's your preferred pulse time" },
        trigger: { weekday: topDay + 1, hour: topHour, minute: 0, repeats: true },
      });

      await setItem(PREFERRED_SLOT_NOTIFICATION_ID_KEY, id);
      await setItem(PREFERRED_SLOT_KEY, JSON.stringify({ day: topDay, hour: topHour }));
    };

    schedulePreferredSlot();
  }, [user]);
}

