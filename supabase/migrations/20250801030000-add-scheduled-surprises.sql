-- Create scheduled_surprises table
CREATE TABLE public.scheduled_surprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_surprises ENABLE ROW LEVEL SECURITY;

-- RLS policy: users manage their scheduled surprises
CREATE POLICY "Users can manage their scheduled surprises"
ON public.scheduled_surprises
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
