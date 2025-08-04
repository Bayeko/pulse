declare module 'expo-notifications' {
  export type Subscription = unknown;
  export function getPermissionsAsync(): Promise<{ status: string }>;
  export function requestPermissionsAsync(): Promise<{ status: string }>;
  export function getExpoPushTokenAsync(): Promise<{ data: string } | string>;
  export function addNotificationReceivedListener(listener: (notification: unknown) => void): Subscription;
  export function addNotificationResponseReceivedListener(listener: (response: unknown) => void): Subscription;
  export function removeNotificationSubscription(subscription: Subscription): void;
}
