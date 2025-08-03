-- Add snooze_until column to profiles
ALTER TABLE public.profiles
ADD COLUMN snooze_until TIMESTAMP WITH TIME ZONE;
