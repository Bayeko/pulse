import { signIn, connectPartner } from './auth';
import { supabase } from '@/integrations/supabase/client';
import { vi } from 'vitest';

test('signIn calls supabase auth method', async () => {
  await signIn('test@example.com', 'password');
  expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password',
  });
});

describe('partner connections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const qb: any = supabase.from('profiles');
    qb.single.mockReset();
    qb.update.mockReset();
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
});
