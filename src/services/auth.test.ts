import { signIn } from './auth';
import { supabase } from '@/integrations/supabase/client';

test('signIn calls supabase auth method', async () => {
  await signIn('test@example.com', 'password');
  expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password',
  });
});
