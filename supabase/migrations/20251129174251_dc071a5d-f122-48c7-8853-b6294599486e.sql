-- Add profile enhancements
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Create social links table
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create media uploads table
CREATE TABLE IF NOT EXISTS public.media_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('diary', 'travel', 'profile')),
  entity_id UUID,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create post likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  post_type TEXT NOT NULL CHECK (post_type IN ('diary', 'travel')),
  post_id UUID NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_type, post_id, user_id),
  UNIQUE(post_type, post_id, ip_address)
);

-- Create post comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_type TEXT NOT NULL CHECK (post_type IN ('diary', 'travel')),
  post_id UUID NOT NULL,
  user_id UUID,
  commenter_name TEXT,
  comment_text TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create truth dare questions table
CREATE TABLE IF NOT EXISTS public.truth_dare_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_type TEXT NOT NULL CHECK (question_type IN ('truth', 'dare')),
  question_text TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create anonymous questions game table
CREATE TABLE IF NOT EXISTS public.anonymous_game_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  asker_ip TEXT,
  answer_text TEXT,
  is_answered BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'general' CHECK (category IN ('get-to-know-me', 'hot-takes', 'would-you-rather', 'general')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user roles enum and table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'visitor');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'visitor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create function to check if user is admin (based on is_owner flag)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND is_owner = true
  );
$$;

-- Enable RLS on all new tables
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truth_dare_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_links
CREATE POLICY "Social links viewable by everyone"
  ON public.social_links FOR SELECT USING (is_visible = true);

CREATE POLICY "Admin can manage social links"
  ON public.social_links FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for media_uploads
CREATE POLICY "Media viewable by everyone"
  ON public.media_uploads FOR SELECT USING (true);

CREATE POLICY "Admin can manage media"
  ON public.media_uploads FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for post_likes
CREATE POLICY "Likes viewable by everyone"
  ON public.post_likes FOR SELECT USING (true);

CREATE POLICY "Anyone can like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can unlike their own posts"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id OR ip_address IS NOT NULL);

-- RLS Policies for post_comments
CREATE POLICY "Public comments viewable by everyone"
  ON public.post_comments FOR SELECT
  USING (is_hidden = false OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can comment"
  ON public.post_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can manage comments"
  ON public.post_comments FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete comments"
  ON public.post_comments FOR DELETE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for truth_dare_questions
CREATE POLICY "Active questions viewable by everyone"
  ON public.truth_dare_questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage truth dare questions"
  ON public.truth_dare_questions FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for anonymous_game_questions
CREATE POLICY "Public game questions viewable by everyone"
  ON public.anonymous_game_questions FOR SELECT
  USING (is_public = true OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can submit game questions"
  ON public.anonymous_game_questions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can manage game questions"
  ON public.anonymous_game_questions FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Roles viewable by everyone"
  ON public.user_roles FOR SELECT USING (true);

CREATE POLICY "Admin can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('diary-images', 'diary-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('travel-images', 'travel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile-pictures
CREATE POLICY "Profile pictures viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-pictures');

CREATE POLICY "Admin can upload profile pictures"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-pictures' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin can update profile pictures"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-pictures' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete profile pictures"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-pictures' AND public.is_admin(auth.uid()));

-- Storage policies for diary-images
CREATE POLICY "Diary images viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'diary-images');

CREATE POLICY "Admin can upload diary images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'diary-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin can update diary images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'diary-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete diary images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'diary-images' AND public.is_admin(auth.uid()));

-- Storage policies for travel-images
CREATE POLICY "Travel images viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'travel-images');

CREATE POLICY "Admin can upload travel images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'travel-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin can update travel images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'travel-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete travel images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'travel-images' AND public.is_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_social_links_updated_at
  BEFORE UPDATE ON public.social_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_truth_dare_questions_updated_at
  BEFORE UPDATE ON public.truth_dare_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anonymous_game_questions_updated_at
  BEFORE UPDATE ON public.anonymous_game_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();