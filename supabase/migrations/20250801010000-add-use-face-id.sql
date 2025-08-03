-- Add use_face_id preference to profiles
ALTER TABLE public.profiles
ADD COLUMN use_face_id BOOLEAN DEFAULT FALSE;
