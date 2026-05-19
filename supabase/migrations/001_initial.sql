-- Spelling Garden — Initial Schema
-- Run this in the Supabase SQL editor before first use.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

-- Users (extends auth.users; auto-provisioned via trigger)
CREATE TABLE public.users (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email          TEXT UNIQUE NOT NULL,
  name           TEXT NOT NULL,
  avatar_url     TEXT,
  spelling_level INTEGER DEFAULT 1 CHECK (spelling_level >= 1),
  mmr            INTEGER DEFAULT 1000 CHECK (mmr >= 0),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Flower master catalog (seeded separately)
CREATE TABLE public.flowers (
  id              TEXT PRIMARY KEY,  -- slug: "luminescent-lily"
  name            TEXT NOT NULL,
  description     TEXT,
  lore            TEXT,
  rarity          TEXT NOT NULL CHECK (rarity IN ('common','uncommon','rare','shimmer','mythic')),
  base_seed_cost  JSONB NOT NULL DEFAULT '{"standard":1,"shimmer":0}',
  recipe          JSONB,             -- NULL=base flower; {"ingredients":["id1","id2"]}=hybrid
  spelling_trait  TEXT,              -- "double_vowel","silent_letter","sight_word","consonant_cluster"
  particle_effect TEXT DEFAULT 'none' CHECK (particle_effect IN ('none','sparkle','glow','float')),
  image_url       TEXT,
  is_discoverable BOOLEAN DEFAULT TRUE
);

-- Spelling progress (one row per user+word pair)
CREATE TABLE public.spelling_progress (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  word                    TEXT NOT NULL,
  word_list               TEXT NOT NULL DEFAULT 'grade5-week1',
  mastery_level           INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 3),
  -- 0=unseen  1=struggling (2+ misses)  2=learning (≥1 correct)  3=mastered (3+ first-try wins)
  attempts                INTEGER DEFAULT 0,
  correct_first_try_count INTEGER DEFAULT 0,
  is_trouble_word         BOOLEAN DEFAULT FALSE,
  last_practiced_at       TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word)
);

-- Inventory (one row per user, auto-created by trigger)
CREATE TABLE public.inventory (
  user_id        UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  pollen         INTEGER DEFAULT 0 CHECK (pollen >= 0),
  water_drops    INTEGER DEFAULT 0 CHECK (water_drops >= 0),
  shimmer_seeds  JSONB DEFAULT '[]',  -- [{flower_id: string, quantity: number}]
  standard_seeds JSONB DEFAULT '[]',
  nutrients      JSONB DEFAULT '{"nitrogen":0,"phosphorus":0,"sunlight":0}',
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Garden layouts (flowers placed in the world)
CREATE TABLE public.garden_layouts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  flower_id    TEXT NOT NULL REFERENCES public.flowers(id),
  x_coordinate FLOAT NOT NULL CHECK (x_coordinate BETWEEN 0 AND 1),  -- normalized 0–1
  y_coordinate FLOAT NOT NULL CHECK (y_coordinate BETWEEN 0 AND 1),
  scale        FLOAT DEFAULT 1.0 CHECK (scale BETWEEN 0.1 AND 3.0),
  rotation     FLOAT DEFAULT 0.0 CHECK (rotation BETWEEN -180 AND 180),
  is_shimmer   BOOLEAN DEFAULT FALSE,
  is_wilting   BOOLEAN DEFAULT FALSE,  -- TRUE when linked word becomes a trouble word
  placed_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Emoji pollen (safe social reactions — no free text)
CREATE TABLE public.emoji_pollen (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  garden_layout_id UUID NOT NULL REFERENCES public.garden_layouts(id) ON DELETE CASCADE,
  emoji            TEXT NOT NULL CHECK (emoji IN ('✨','❤️','👍','🌟','🎉')),
  is_seen          BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, garden_layout_id)  -- one reaction per flower per visitor
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────

CREATE INDEX idx_sp_user    ON public.spelling_progress(user_id);
CREATE INDEX idx_sp_trouble ON public.spelling_progress(user_id) WHERE is_trouble_word;
CREATE INDEX idx_gl_user    ON public.garden_layouts(user_id);
CREATE INDEX idx_ep_layout  ON public.emoji_pollen(garden_layout_id);
CREATE INDEX idx_ep_unseen  ON public.emoji_pollen(garden_layout_id) WHERE NOT is_seen;

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spelling_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_layouts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emoji_pollen      ENABLE ROW LEVEL SECURITY;

-- users: own row only
CREATE POLICY "own profile"
  ON public.users FOR ALL USING (auth.uid() = id);

-- flowers: public read (catalog browsing)
CREATE POLICY "flowers public"
  ON public.flowers FOR SELECT USING (TRUE);

-- garden_layouts: public read (visitor mode), owner full control
CREATE POLICY "garden public read"
  ON public.garden_layouts FOR SELECT USING (TRUE);
CREATE POLICY "own garden write"
  ON public.garden_layouts FOR ALL USING (auth.uid() = user_id);

-- spelling_progress: private
CREATE POLICY "own spelling progress"
  ON public.spelling_progress FOR ALL USING (auth.uid() = user_id);

-- inventory: private
CREATE POLICY "own inventory"
  ON public.inventory FOR ALL USING (auth.uid() = user_id);

-- emoji_pollen: anyone can drop; owner & sender can read
CREATE POLICY "drop pollen"
  ON public.emoji_pollen FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "read pollen"
  ON public.emoji_pollen FOR SELECT
  USING (
    auth.uid() = from_user_id OR
    EXISTS (
      SELECT 1 FROM public.garden_layouts g
      WHERE g.id = garden_layout_id AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "mark pollen seen"
  ON public.emoji_pollen FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.garden_layouts g
      WHERE g.id = garden_layout_id AND g.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- TRIGGER: auto-provision user + inventory on sign-up
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.inventory (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
