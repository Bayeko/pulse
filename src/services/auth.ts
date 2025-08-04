import { supabase } from '@/integrations/supabase/client';

export const signIn = (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = (name: string, email: string, password: string) => {
  const redirectUrl = `${window.location.origin}/`;
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: { name }
    }
  });
};

export const signOut = () => supabase.auth.signOut();

export const getProfile = (userId: string) => {
  return supabase
    .from('profiles')
    .select(`
      *,
      partner:partner_id(name, snooze_until)
    `)
    .eq('user_id', userId)
    .single();
};

export const connectPartner = async (partnerEmail: string, currentUserId: string) => {
  const { data: partnerProfile, error: findError } = await supabase
    .from('profiles')
    .select('id, user_id, name')
    .eq('email', partnerEmail)
    .single();

  if (findError || !partnerProfile) {
    return { error: 'Partner not found. Please check the email address.' };
  }

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', currentUserId)
    .single();

  if (currentProfileError || !currentProfile) {
    return { error: 'Unable to retrieve your profile.' };
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ partner_id: partnerProfile.id })
    .eq('user_id', currentUserId);

  if (updateError) {
    return { error: 'Unable to connect with partner. Please try again.' };
  }

  const { error: partnerUpdateError } = await supabase
    .from('profiles')
    .update({ partner_id: currentProfile.id })
    .eq('user_id', partnerProfile.user_id);

  if (partnerUpdateError) {
    return { error: 'Unable to connect with partner. Please try again.' };
  }

  return { data: partnerProfile };
};

export const connectByCode = async (code: string, currentUserId: string) => {
  const { data: partnerProfile, error: findError } = await supabase
    .from('profiles')
    .select('id, user_id, name')
    .like('id', `${code}%`)
    .single();

  if (findError || !partnerProfile) {
    return { error: 'Partner not found. Please check the code.' };
  }

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', currentUserId)
    .single();

  if (currentProfileError || !currentProfile) {
    return { error: 'Unable to retrieve your profile.' };
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ partner_id: partnerProfile.id })
    .eq('user_id', currentUserId);

  if (updateError) {
    return { error: 'Unable to connect with partner. Please try again.' };
  }

  const { error: partnerUpdateError } = await supabase
    .from('profiles')
    .update({ partner_id: currentProfile.id })
    .eq('user_id', partnerProfile.user_id);

  if (partnerUpdateError) {
    return { error: 'Unable to connect with partner. Please try again.' };
  }

  return { data: partnerProfile };
};
