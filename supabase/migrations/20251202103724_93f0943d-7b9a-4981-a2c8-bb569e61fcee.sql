-- Fix RLS policies to allow public read access to content
-- Drop overly restrictive policies
DROP POLICY IF EXISTS "Diary entries viewable by owner only" ON public.diary_entries;
DROP POLICY IF EXISTS "Travel posts viewable by owner only" ON public.travel_posts;
DROP POLICY IF EXISTS "Tasks viewable by owner only" ON public.tasks;

-- Create public read policies
CREATE POLICY "Diary entries viewable by everyone" 
ON public.diary_entries FOR SELECT USING (true);

CREATE POLICY "Travel posts viewable by everyone" 
ON public.travel_posts FOR SELECT USING (true);

CREATE POLICY "Tasks viewable by everyone" 
ON public.tasks FOR SELECT USING (true);

-- Insert 20 random truth/dare questions
INSERT INTO public.truth_dare_questions (question_type, question_text, difficulty_level) VALUES
('truth', 'What is the most embarrassing thing you''ve ever done in public?', 'medium'),
('truth', 'Have you ever lied to your best friend? What about?', 'hard'),
('truth', 'What''s your biggest fear that you''ve never told anyone?', 'hard'),
('truth', 'What''s the most childish thing you still do?', 'easy'),
('truth', 'If you could swap lives with someone for a day, who would it be?', 'easy'),
('truth', 'What''s a secret you''ve kept from your parents?', 'medium'),
('truth', 'What''s the worst date you''ve ever been on?', 'medium'),
('truth', 'Have you ever had a crush on a teacher or professor?', 'easy'),
('truth', 'What''s something you''re glad your family doesn''t know about you?', 'hard'),
('truth', 'What''s the most embarrassing song on your playlist?', 'easy'),
('dare', 'Do your best impression of someone in the room', 'easy'),
('dare', 'Speak in an accent for the next 3 rounds', 'medium'),
('dare', 'Let someone else post on your social media', 'hard'),
('dare', 'Do 20 pushups right now', 'medium'),
('dare', 'Call your crush and tell them a joke', 'hard'),
('dare', 'Dance with no music for 1 minute', 'medium'),
('dare', 'Eat a spoonful of a condiment of the group''s choice', 'medium'),
('dare', 'Text your ex and say "I miss you"', 'hard'),
('dare', 'Let the group give you a new hairstyle', 'hard'),
('dare', 'Do your best animal impression until someone guesses it', 'easy');