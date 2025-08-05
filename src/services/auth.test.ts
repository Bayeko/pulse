import { vi } from 'vitest';

vi.mock('@/lib/retry', () => ({
  withRetry: (fn: any) => fn(),
}));

 4ynwu2-codex/create-shared-helper-for-profile-management
import { signIn, connectPartner, connectByCode } from './auth';

import { signIn, signUp, connectPartner, connectByCode } from './auth';
 main
import { supabase } from '@/integrations/supabase/client';

test('signIn calls supabase auth method', async () => {
  await signIn('test@example.com', 'password');
  expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password',
  });
});

test('signUp calls supabase auth method with profile data', async () => {
  await signUp('Test User', 'new@example.com', 'secret', '2000-01-01');
  expect(supabase.auth.signUp).toHaveBeenCalledWith({
    email: 'new@example.com',
    password: 'secret',
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: { name: 'Test User', birthdate: '2000-01-01' },
    },
  });
});

describe('partner connections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const qb: any = supabase.from('profiles');
    qb.single.mockReset();
    qb.update.mockReset();
    qb.eq.mockReset();
    qb.update.mockReturnThis();
    qb.eq.mockReturnThis();
  });

  test('prevents self pairing', async () => {
    const qb: any = supabase.from('profiles');
    qb.single
      .mockResolvedValueOnce({
        data: { id: 1, user_id: 'user1', name: 'User1', partner_id: null },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 1, partner_id: null },
        error: null,
      });

    const result = await connectPartner('self@example.com', 'user1');
    expect(result).toEqual({ error: 'Cannot connect with yourself.' });
    expect(qb.update).not.toHaveBeenCalled();
  });

  test('prevents double pairing when current user already paired', async () => {
    const qb: any = supabase.from('profiles');
    qb.single
      .mockResolvedValueOnce({
        data: { id: 2, user_id: 'user2', name: 'User2', partner_id: null },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 1, partner_id: 99 },
        error: null,
      });

    const result = await connectPartner('partner@example.com', 'user1');
    expect(result).toEqual({ error: 'User already paired' });
    expect(qb.update).not.toHaveBeenCalled();
  });

  test('prevents double pairing when partner already paired', async () => {
    const qb: any = supabase.from('profiles');
    qb.single
      .mockResolvedValueOnce({
        data: { id: 2, user_id: 'user2', name: 'User2', partner_id: 99 },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 1, partner_id: null },
        error: null,
      });

    const result = await connectPartner('partner@example.com', 'user1');
    expect(result).toEqual({ error: 'User already paired' });
    expect(qb.update).not.toHaveBeenCalled();
  });

  test('rolls back when partner update fails', async () => {
    const qb: any = supabase.from('profiles');
    qb.single
      .mockResolvedValueOnce({
        data: { id: 2, user_id: 'user2', name: 'User2', partner_id: null },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 1, partner_id: null },
        error: null,
      });

    qb.eq
      .mockImplementationOnce(() => qb)
      .mockImplementationOnce(() => qb)
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: 'db error' })
      .mockResolvedValueOnce({ error: null });

    const result = await connectPartner('partner@example.com', 'user1');

    expect(result).toEqual({ error: 'Unable to connect with partner. Please try again.' });
    expect(qb.update).toHaveBeenNthCalledWith(1, { partner_id: 2 });
    expect(qb.update).toHaveBeenNthCalledWith(2, { partner_id: 1 });
    expect(qb.update).toHaveBeenNthCalledWith(3, { partner_id: null });
  });

  test('prevents self pairing via code', async () => {
    const qb: any = supabase.from('profiles');
    qb.single
      .mockResolvedValueOnce({
        data: { id: 1, user_id: 'user1', name: 'User1', partner_id: null },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 1, partner_id: null },
        error: null,
      });

    const result = await connectByCode('code123', 'user1');
    expect(result).toEqual({ error: 'Cannot connect with yourself.' });
    expect(qb.update).not.toHaveBeenCalled();
  });
});

describe('connect by code', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const qb: any = supabase.from('profiles');
    qb.single.mockReset();
    qb.update.mockReset();
    qb.eq.mockReset();
    qb.update.mockReturnThis();
    qb.eq.mockReturnThis();
  });

  test('connects successfully with valid code', async () => {
    const qb: any = supabase.from('profiles');
    const partner = { id: 2, user_id: 'user2', name: 'User2', partner_id: null };
    qb.single
      .mockResolvedValueOnce({ data: partner, error: null })
      .mockResolvedValueOnce({ data: { id: 1, partner_id: null }, error: null });

    qb.eq
      .mockImplementationOnce(() => qb)
      .mockImplementationOnce(() => qb)
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null });

    const result = await connectByCode('CODE123', 'user1');

    expect(result).toEqual({ data: partner });
    expect(qb.update).toHaveBeenNthCalledWith(1, { partner_id: 2 });
    expect(qb.update).toHaveBeenNthCalledWith(2, { partner_id: 1 });
  });

  test('returns error when partner not found', async () => {
    const qb: any = supabase.from('profiles');
    qb.single.mockResolvedValueOnce({ data: null, error: 'not found' });

    const result = await connectByCode('CODE123', 'user1');
    expect(result).toEqual({ error: 'Partner not found. Please check the code.' });
    expect(qb.update).not.toHaveBeenCalled();
  });

  test('prevents double pairing when current user already paired', async () => {
    const qb: any = supabase.from('profiles');
    qb.single
      .mockResolvedValueOnce({
        data: { id: 2, user_id: 'user2', name: 'User2', partner_id: null },
        error: null,
      })
      .mockResolvedValueOnce({ data: { id: 1, partner_id: 99 }, error: null });

    const result = await connectByCode('CODE123', 'user1');
    expect(result).toEqual({ error: 'User already paired' });
    expect(qb.update).not.toHaveBeenCalled();
  });

  test('prevents double pairing when partner already paired', async () => {
    const qb: any = supabase.from('profiles');
    qb.single
      .mockResolvedValueOnce({
        data: { id: 2, user_id: 'user2', name: 'User2', partner_id: 99 },
        error: null,
      })
      .mockResolvedValueOnce({ data: { id: 1, partner_id: null }, error: null });

    const result = await connectByCode('CODE123', 'user1');
    expect(result).toEqual({ error: 'User already paired' });
    expect(qb.update).not.toHaveBeenCalled();
  });
});
