-- Add username column to profiles for multi-tenancy URL routing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Create a table for visitor game responses (Truth or Dare responses)
CREATE TABLE IF NOT EXISTS public.game_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.truth_dare_questions(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  responder_name TEXT DEFAULT 'Anonymous',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on game_responses
ALTER TABLE public.game_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can submit game responses
CREATE POLICY "Anyone can submit game responses" 
ON public.game_responses 
FOR INSERT 
WITH CHECK (true);

-- Profile owners can view responses to their questions
CREATE POLICY "Profile owners can view their game responses" 
ON public.game_responses 
FOR SELECT 
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE id = auth.uid()
  )
  OR is_admin(auth.uid())
);

-- Profile owners can update (mark as read) and delete their responses
CREATE POLICY "Profile owners can manage their game responses" 
ON public.game_responses 
FOR UPDATE 
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE id = auth.uid()
  )
  OR is_admin(auth.uid())
);

CREATE POLICY "Profile owners can delete their game responses" 
ON public.game_responses 
FOR DELETE 
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE id = auth.uid()
  )
  OR is_admin(auth.uid())
);

-- Update existing profiles to have a username based on their id
UPDATE public.profiles 
SET username = LOWER(REPLACE(name, ' ', '-') || '-' || LEFT(id::text, 8))
WHERE username IS NULL;

-- Add profile_id to truth_dare_questions for multi-tenancy
ALTER TABLE public.truth_dare_questions 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add profile_id to anonymous_game_questions for multi-tenancy
ALTER TABLE public.anonymous_game_questions 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update existing truth_dare_questions to link to owner profile
UPDATE public.truth_dare_questions 
SET profile_id = (SELECT id FROM public.profiles WHERE is_owner = true LIMIT 1)
WHERE profile_id IS NULL;