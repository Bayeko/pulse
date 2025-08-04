 codex/resolve-merge-conflicts-in-feature-branch
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';
export const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY || '';
export const NODE_ENV = process.env.NODE_ENV;

export const config = {
  SUPABASE_URL,
  SUPABASE_KEY,
  VAPID_PUBLIC_KEY,
  NODE_ENV,
};

export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}
 main
