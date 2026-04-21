ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_links;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diary_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.travel_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.qna_questions;

ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.social_links REPLICA IDENTITY FULL;
ALTER TABLE public.diary_entries REPLICA IDENTITY FULL;
ALTER TABLE public.travel_posts REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.qna_questions REPLICA IDENTITY FULL;