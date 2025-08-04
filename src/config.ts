import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_KEY: z.string().min(1),
  EXPO_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1),
  CRON_AUTH_TOKEN: z.string().optional(),
});

const env = envSchema.parse(process.env);

export const EXPO_PUBLIC_SUPABASE_URL = env.EXPO_PUBLIC_SUPABASE_URL;
export const EXPO_PUBLIC_SUPABASE_KEY = env.EXPO_PUBLIC_SUPABASE_KEY;
export const EXPO_PUBLIC_VAPID_PUBLIC_KEY = env.EXPO_PUBLIC_VAPID_PUBLIC_KEY;
export const CRON_AUTH_TOKEN = env.CRON_AUTH_TOKEN;
