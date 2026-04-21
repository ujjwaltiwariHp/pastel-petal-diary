-- Fix 1: Diary entries should only be viewable by owner
DROP POLICY IF EXISTS "Diary entries viewable by everyone" ON public.diary_entries;

CREATE POLICY "Owner can view own diary entries"
ON public.diary_entries
FOR SELECT
USING (auth.uid() = user_id);

-- Fix 2: Messages should only be viewable/deletable by admins
DROP POLICY IF EXISTS "Messages viewable by owner" ON public.messages;
DROP POLICY IF EXISTS "Owner can delete messages" ON public.messages;

CREATE POLICY "Admin can view messages"
ON public.messages
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete messages"
ON public.messages
FOR DELETE
USING (public.is_admin(auth.uid()));