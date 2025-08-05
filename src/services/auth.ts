import { supabase } from '@/integrations/supabase/client';
import { withRetry } from '@/lib/retry';

export const signIn = (email: string, password: string) => {
  return withRetry(() => supabase.auth.signInWithPassword({ email, password }));
};

export const signUp = (name: string, email: string, password: string, birthdate?: string) => {
  const redirectUrl = `${window.location.origin}/`;
  return withRetry(() =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name, birthdate }
      }
    })
  );
};

export const signOut = () => withRetry(() => supabase.auth.signOut());

export const getProfile = (userId: string) => {
  return withRetry(() =>
    supabase
      .from('profiles')
      .select(`
      *,
      partner:partner_id(name, snooze_until)
    `)
      .eq('user_id', userId)
      .single()
  );
};

const linkProfiles = async (
  lookupField: string,
  lookupValue: string,
  currentUserId: string,
  notFoundMessage: string
) => {
  const { data: partnerProfile, error: findError } = await withRetry(() =>
    supabase
      .from('profiles')
      .select('id, user_id, name, partner_id')
      .eq(lookupField, lookupValue)
      .single()
  );

  if (findError || !partnerProfile) {
    return { error: notFoundMessage };
  }

  const { data: currentProfile, error: currentProfileError } = await withRetry(() =>
    supabase
      .from('profiles')
      .select('id, partner_id')
      .eq('user_id', currentUserId)
      .single()
  );

  if (currentProfileError || !currentProfile) {
    return { error: 'Unable to retrieve your profile.' };
  }

  if (currentProfile.id === partnerProfile.id) {
    return { error: 'Cannot connect with yourself.' };
  }

  if (
    (currentProfile.partner_id && currentProfile.partner_id !== partnerProfile.id) ||
    (partnerProfile.partner_id && partnerProfile.partner_id !== currentProfile.id)
  ) {
    return { error: 'User already paired' };
  }

  const { error: updateError } = await withRetry(() =>
    supabase
      .from('profiles')
      .update({ partner_id: partnerProfile.id })
      .eq('user_id', currentUserId)
  );

  if (updateError) {
    return { error: 'Unable to connect with partner. Please try again.' };
  }

  const { error: partnerUpdateError } = await withRetry(() =>
    supabase
      .from('profiles')
      .update({ partner_id: currentProfile.id })
      .eq('user_id', partnerProfile.user_id)
  );

  if (partnerUpdateError) {
    await withRetry(() =>
      supabase
        .from('profiles')
        .update({ partner_id: null })
        .eq('user_id', currentUserId)
    );
    return { error: 'Unable to connect with partner. Please try again.' };
  }

  return { data: partnerProfile };
};

export const connectPartner = (partnerEmail: string, currentUserId: string) =>
  linkProfiles(
    'email',
    partnerEmail,
    currentUserId,
    'Partner not found. Please check the email address.'
  );

export const connectByCode = (code: string, currentUserId: string) =>
  linkProfiles('short_code', code, currentUserId, 'Partner not found. Please check the code.');
