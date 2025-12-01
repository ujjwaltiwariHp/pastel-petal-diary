-- FIX CRITICAL SECURITY ISSUE: Restrict diary entries to only the owner
DROP POLICY IF EXISTS "Diary entries viewable by everyone" ON public.diary_entries;

CREATE POLICY "Diary entries viewable by owner only" 
ON public.diary_entries 
FOR SELECT 
USING (auth.uid() = user_id);

-- Also fix travel posts to be owner-only since they may contain personal information
DROP POLICY IF EXISTS "Travel posts viewable by everyone" ON public.travel_posts;

CREATE POLICY "Travel posts viewable by owner only" 
ON public.travel_posts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Fix tasks to be owner-only
DROP POLICY IF EXISTS "Tasks viewable by everyone" ON public.tasks;

CREATE POLICY "Tasks viewable by owner only" 
ON public.tasks 
FOR SELECT 
USING (auth.uid() = user_id);