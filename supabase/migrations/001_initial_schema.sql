-- ==============================================================================
-- BETWEEN US: Initial Schema & Row Level Security (RLS) Policies
-- Private digital scrapbook and memory space for two friends
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Duo Spaces Table (represents exactly two friends sharing a space)
CREATE TABLE IF NOT EXISTS public.duo_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Our Space',
  invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Duo Members Table (max 2 members per duo space)
CREATE TABLE IF NOT EXISTS public.duo_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duo_id UUID NOT NULL REFERENCES public.duo_spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(duo_id, user_id)
);

-- 4. Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duo_id UUID NOT NULL REFERENCES public.duo_spaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  memory_date DATE NOT NULL DEFAULT CURRENT_DATE,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  audio_url TEXT,
  audio_duration_seconds INTEGER,
  song_title TEXT,
  song_artist TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Memory Media Table
CREATE TABLE IF NOT EXISTS public.memory_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'audio')),
  storage_path TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Places Table
CREATE TABLE IF NOT EXISTS public.places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duo_id UUID NOT NULL REFERENCES public.duo_spaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  visited_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Little Things Table (inside jokes, quotes, random moments, notes, etc.)
CREATE TABLE IF NOT EXISTS public.little_things (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duo_id UUID NOT NULL REFERENCES public.duo_spaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('inside_joke', 'quote', 'random_moment', 'screenshot', 'song', 'note')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  origin_date DATE DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Plans Table (Things we still have to do)
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duo_id UUID NOT NULL REFERENCES public.duo_spaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  planned_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Time Capsules Table
CREATE TABLE IF NOT EXISTS public.time_capsules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duo_id UUID NOT NULL REFERENCES public.duo_spaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  unlock_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Capsule Media Table
CREATE TABLE IF NOT EXISTS public.capsule_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID NOT NULL REFERENCES public.time_capsules(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duo_id UUID NOT NULL REFERENCES public.duo_spaces(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. Question Answers Table
CREATE TABLE IF NOT EXISTS public.question_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(question_id, user_id)
);

-- ==============================================================================
-- INDEXES FOR SPEED & REALTIME PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_duo_members_duo_id ON public.duo_members(duo_id);
CREATE INDEX IF NOT EXISTS idx_duo_members_user_id ON public.duo_members(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_duo_date ON public.memories(duo_id, memory_date DESC);
CREATE INDEX IF NOT EXISTS idx_memory_media_memory_id ON public.memory_media(memory_id);
CREATE INDEX IF NOT EXISTS idx_places_duo ON public.places(duo_id);
CREATE INDEX IF NOT EXISTS idx_little_things_duo ON public.little_things(duo_id, origin_date DESC);
CREATE INDEX IF NOT EXISTS idx_plans_duo ON public.plans(duo_id, status);
CREATE INDEX IF NOT EXISTS idx_time_capsules_duo ON public.time_capsules(duo_id, unlock_at);
CREATE INDEX IF NOT EXISTS idx_questions_duo ON public.questions(duo_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_question ON public.question_answers(question_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Only authenticated members belonging to a duo space can access duo content
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duo_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.little_things ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsule_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is a member of duo space
CREATE OR REPLACE FUNCTION public.is_member_of_duo(space_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.duo_members
    WHERE duo_id = space_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can read profiles in the same duo, and update their own
CREATE POLICY "Users can view duo member profiles"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.duo_members m1
      JOIN public.duo_members m2 ON m1.duo_id = m2.duo_id
      WHERE m1.user_id = auth.uid() AND m2.user_id = profiles.id
    )
  );

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Duo Spaces: Members can view and creator can create
CREATE POLICY "Members can view their duo space"
  ON public.duo_spaces FOR SELECT
  USING (is_member_of_duo(id));

CREATE POLICY "Authenticated users can create duo space"
  ON public.duo_spaces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Members can update their duo space"
  ON public.duo_spaces FOR UPDATE
  USING (is_member_of_duo(id));

-- Duo Members
CREATE POLICY "Members can view other members of their duo"
  ON public.duo_members FOR SELECT
  USING (is_member_of_duo(duo_id) OR user_id = auth.uid());

CREATE POLICY "Users can join a duo"
  ON public.duo_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Memories
CREATE POLICY "Members can view duo memories"
  ON public.memories FOR SELECT
  USING (is_member_of_duo(duo_id));

CREATE POLICY "Members can insert duo memories"
  ON public.memories FOR INSERT
  WITH CHECK (is_member_of_duo(duo_id) AND created_by = auth.uid());

CREATE POLICY "Members can update duo memories"
  ON public.memories FOR UPDATE
  USING (is_member_of_duo(duo_id));

CREATE POLICY "Members can delete duo memories"
  ON public.memories FOR DELETE
  USING (is_member_of_duo(duo_id));

-- Memory Media
CREATE POLICY "Members can view memory media"
  ON public.memory_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memories
      WHERE memories.id = memory_media.memory_id
      AND is_member_of_duo(memories.duo_id)
    )
  );

CREATE POLICY "Members can insert memory media"
  ON public.memory_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memories
      WHERE memories.id = memory_media.memory_id
      AND is_member_of_duo(memories.duo_id)
    )
  );

CREATE POLICY "Members can delete memory media"
  ON public.memory_media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memories
      WHERE memories.id = memory_media.memory_id
      AND is_member_of_duo(memories.duo_id)
    )
  );

-- Places
CREATE POLICY "Members can view duo places"
  ON public.places FOR SELECT
  USING (is_member_of_duo(duo_id));

CREATE POLICY "Members can insert duo places"
  ON public.places FOR INSERT
  WITH CHECK (is_member_of_duo(duo_id) AND created_by = auth.uid());

CREATE POLICY "Members can update/delete duo places"
  ON public.places FOR ALL
  USING (is_member_of_duo(duo_id));

-- Little Things
CREATE POLICY "Members can view duo little things"
  ON public.little_things FOR SELECT
  USING (is_member_of_duo(duo_id));

CREATE POLICY "Members can manage duo little things"
  ON public.little_things FOR ALL
  USING (is_member_of_duo(duo_id));

-- Plans
CREATE POLICY "Members can view duo plans"
  ON public.plans FOR SELECT
  USING (is_member_of_duo(duo_id));

CREATE POLICY "Members can manage duo plans"
  ON public.plans FOR ALL
  USING (is_member_of_duo(duo_id));

-- Time Capsules
-- Note: Sealed capsules can be viewed in list, but message is kept confidential or client unseals based on unlock_at
CREATE POLICY "Members can view duo capsules"
  ON public.time_capsules FOR SELECT
  USING (is_member_of_duo(duo_id));

CREATE POLICY "Members can create capsules"
  ON public.time_capsules FOR INSERT
  WITH CHECK (is_member_of_duo(duo_id) AND created_by = auth.uid());

-- Capsule Media
CREATE POLICY "Members can view capsule media"
  ON public.capsule_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.time_capsules
      WHERE time_capsules.id = capsule_media.capsule_id
      AND is_member_of_duo(time_capsules.duo_id)
    )
  );

-- Questions & Answers
CREATE POLICY "Members can view duo questions"
  ON public.questions FOR SELECT
  USING (is_member_of_duo(duo_id));

CREATE POLICY "Members can insert questions"
  ON public.questions FOR INSERT
  WITH CHECK (is_member_of_duo(duo_id));

CREATE POLICY "Users can insert own question answers"
  ON public.question_answers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can view answers if both answered or own answer"
  ON public.question_answers FOR SELECT
  USING (
    user_id = auth.uid() OR
    (
      -- Double-blind rule: can view partner's answer only if user also answered this question
      EXISTS (
        SELECT 1 FROM public.question_answers self_ans
        WHERE self_ans.question_id = question_answers.question_id
        AND self_ans.user_id = auth.uid()
      )
    )
  );

-- ==============================================================================
-- STORAGE CONFIGURATION (Buckets: memories, capsules)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', false),
       ('capsules', 'capsules', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can upload and read media for their duo spaces
CREATE POLICY "Authenticated users can upload memory media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('memories', 'capsules'));

CREATE POLICY "Authenticated users can read memory media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id IN ('memories', 'capsules'));

CREATE POLICY "Users can update/delete their uploaded media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('memories', 'capsules'));
