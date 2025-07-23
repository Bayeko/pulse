-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update partner_id foreign key to use ON DELETE SET NULL
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_partner_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_partner_id_fkey 
FOREIGN KEY (partner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Tighten profiles RLS policy for privacy - only allow users to see their own profile or their partner's
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile and their partner's profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- Add performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_created 
ON public.messages(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_created 
ON public.messages(receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_partner_id 
ON public.profiles(partner_id) WHERE partner_id IS NOT NULL;