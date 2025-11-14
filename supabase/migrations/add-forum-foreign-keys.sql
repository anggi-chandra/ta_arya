-- Migration: Add foreign key constraints for forum tables
-- This fixes the PGRST200 error: "Could not find a relationship between 'forum_topics' and 'profiles'"
-- 
-- Problem: forum_topics.author_id references auth.users(id), but Supabase PostgREST queries
-- use profiles!forum_topics_author_id_fkey which requires a foreign key to profiles(id)
--
-- Solution: Drop the foreign key to auth.users and create one to profiles(id)
-- This is safe because profiles.id references auth.users(id), so the values are compatible

-- Ensure all users have profiles (create profiles for any users that don't have one)
INSERT INTO public.profiles (id, full_name, username)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1))
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing foreign key constraint from forum_topics.author_id to auth.users
ALTER TABLE public.forum_topics 
DROP CONSTRAINT IF EXISTS forum_topics_author_id_fkey;

-- Add new foreign key constraint from forum_topics.author_id to profiles.id
ALTER TABLE public.forum_topics 
ADD CONSTRAINT forum_topics_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Drop existing foreign key constraint from forum_replies.author_id to auth.users
ALTER TABLE public.forum_replies 
DROP CONSTRAINT IF EXISTS forum_replies_author_id_fkey;

-- Add new foreign key constraint from forum_replies.author_id to profiles.id
ALTER TABLE public.forum_replies 
ADD CONSTRAINT forum_replies_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Ensure forum_topics_category_id_fkey exists and is correctly named
ALTER TABLE public.forum_topics 
DROP CONSTRAINT IF EXISTS forum_topics_category_id_fkey;

ALTER TABLE public.forum_topics 
ADD CONSTRAINT forum_topics_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES public.forum_categories(id) 
ON DELETE CASCADE;

-- Ensure forum_replies_topic_id_fkey exists and is correctly named
ALTER TABLE public.forum_replies 
DROP CONSTRAINT IF EXISTS forum_replies_topic_id_fkey;

ALTER TABLE public.forum_replies 
ADD CONSTRAINT forum_replies_topic_id_fkey 
FOREIGN KEY (topic_id) 
REFERENCES public.forum_topics(id) 
ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_topics_author_id ON public.forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON public.forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON public.forum_topics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON public.forum_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_topic_id ON public.forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created_at ON public.forum_replies(created_at DESC);

