import { vi } from 'vitest';

const queryBuilder = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
};

const supabase = {
  auth: {
    signInWithPassword: vi.fn().mockResolvedValue({}),
    signUp: vi.fn().mockResolvedValue({}),
    signOut: vi.fn().mockResolvedValue({}),
  },
  from: vi.fn(() => queryBuilder),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase,
}));
