import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_KEY: z.string().min(1),
  EXPO_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1),
});

const env = envSchema.parse(process.env);

export const {
  NODE_ENV,
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_KEY,
  EXPO_PUBLIC_VAPID_PUBLIC_KEY,
} = env;

export type Env = z.infer<typeof envSchema>;
