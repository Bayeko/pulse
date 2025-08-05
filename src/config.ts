export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
export const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY as string;
export const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY as string;
export const NODE_ENV = process.env.NODE_ENV;
export const isDevelopment = NODE_ENV === 'development';
