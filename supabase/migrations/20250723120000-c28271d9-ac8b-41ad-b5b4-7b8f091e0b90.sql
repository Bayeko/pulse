-- Create time_slots table
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "start" TIME NOT NULL,
  "end" TIME NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mutual','suggested','booked')),
  title TEXT
);

-- Enable Row Level Security
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- RLS policy: users manage their own time slots
CREATE POLICY "Users can manage their own time slots"
ON public.time_slots
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
