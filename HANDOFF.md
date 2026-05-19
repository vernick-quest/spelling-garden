# Spelling Garden — Handoff Document

**Last updated:** 2026-05-18  
**Repo:** https://github.com/vernick-quest/spelling-garden  
**Live URL:** https://spelling-garden-vert.vercel.app  
**Supabase project:** epueqpfnsdxeoesxrpck  

---

## What This Is

A gamified spelling education web app for grades 4–8. Students hear a word read aloud by an AI voice (ElevenLabs / Victoria), type it into a clean input, and earn pollen currency on correct answers. Pollen is spent to plant flowers in a persistent garden. Higher grades unlock rarer, more complex flowers. Classmates can visit each other's gardens in a read-only mode and drop emoji reactions.

The core philosophy: **no punishing failure screens** — wrong answers just replay the word and let you try again.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Canvas | PixiJS v8 (currently rendering emoji as Text sprites) |
| Backend | Supabase (Postgres + Auth + Realtime) |
| Auth | Google OAuth via Supabase Auth |
| TTS | ElevenLabs API (Victoria voice) with Web Speech API fallback in dev |
| State | Zustand (`src/store/game.ts`) |
| Hosting | Vercel (auto-deploys on push to `main`) |

---

## Environment Variables

Set in Vercel production. For local dev, copy `.env.example` → `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://epueqpfnsdxeoesxrpck.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<service role key — not yet used but add it>
ELEVENLABS_API_KEY=<in Vercel — ask Robert>
ELEVENLABS_VOICE_ID=qSeXEcewz7tA0Q0qk9fH   ← Victoria
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1085842074560-vo290qk8aroo9h2cp3cl4dgboc8q1uc8.apps.googleusercontent.com
```

In dev, TTS automatically falls back to the browser's Web Speech API (no ElevenLabs calls).

---

## Database

Run migrations in order via **Supabase → SQL Editor**.

### `supabase/migrations/001_initial.sql` ✅ (already run)
Creates all 6 tables, RLS policies, indexes, and the `handle_new_user` trigger that auto-provisions a `users` row and an `inventory` row on first Google sign-in.

### Flower seed SQL (run this if not already done)
```sql
INSERT INTO public.flowers (id, name, description, lore, rarity, base_seed_cost, spelling_trait, particle_effect) VALUES
('common-daisy',        'Common Daisy',        'A cheerful white flower',             'The first flower every garden grows',                   'common',   '{"standard":1,"shimmer":0}', null,               'none'),
('luminescent-lily',    'Luminescent Lily',    'A glowing blue lily',                 'Found only near magical springs',                       'uncommon', '{"standard":2,"shimmer":0}', 'double_vowel',     'glow'),
('midnight-fern',       'Midnight Fern',       'A dark fern that absorbs moonlight',  'Grows in the shadows of ancient trees',                 'uncommon', '{"standard":2,"shimmer":0}', 'silent_letter',    'none'),
('shimmer-rose',        'Shimmer Rose',        'A rose that sparkles with inner light','Only blooms for those who truly know their words',     'rare',     '{"standard":3,"shimmer":0}', 'sight_word',       'sparkle'),
('sunfire-bloom',       'Sunfire Bloom',       'Warm orange petals like embers',      'Grows where brave spellers have studied',               'uncommon', '{"standard":2,"shimmer":0}', 'consonant_cluster','glow'),
('cloud-prickle-cactus','Cloud-Prickle Cactus','A soft cactus with floating spines',  'Defies gravity like a well-earned shimmer seed',        'rare',     '{"standard":4,"shimmer":0}', 'irregular',        'float'),
('star-glass-orchid',   'Star-Glass Orchid',   'Hybrid of lily and fern',             'Discovered by the first botanical alchemist',           'rare',     '{"standard":0,"shimmer":1}', null,               'sparkle'),
('lattice-vine',        'Lattice Vine',        'Geometric petal patterns',            'Grows wherever Latin words were once studied',          'rare',     '{"standard":3,"shimmer":0}', 'latin_root',       'none'),
('echo-bloom',          'Echo Bloom',          'Petals that perfectly mirror each other','Repeats ancient whispered words',                    'rare',     '{"standard":3,"shimmer":0}', 'double_vowel',     'glow'),
('chronos-blossom',     'Chronos Blossom',     'A silver flower frozen in time',      'Blooms for those who master time-root words',           'shimmer',  '{"standard":4,"shimmer":0}', 'greek_root',       'sparkle'),
('geo-crystal',         'Geo Crystal',         'A translucent earth flower',          'Formed deep in soil by concentrated knowledge',         'shimmer',  '{"standard":4,"shimmer":0}', 'greek_root',       'glow'),
('phantom-orchid',      'Phantom Orchid',      'A ghostly white hovering flower',     'Appears when silent letters are truly understood',      'shimmer',  '{"standard":4,"shimmer":0}', 'silent_letter',    'float'),
('paradox-lily',        'Paradox Lily',        'Petals on both sides of the stem',    'Contradicts itself beautifully — like all great words', 'mythic',   '{"standard":5,"shimmer":1}', 'latin_root',       'float'),
('ubiquity-weed',       'Ubiquity Weed',       'Appears to grow everywhere at once',  'Masters of advanced vocabulary always find it',         'mythic',   '{"standard":5,"shimmer":1}', 'latin_root',       'sparkle'),
('logos-flower',        'Logos Flower',        'Inscribed with glowing symbols',      'The rarest flower — blooms only for true word masters', 'mythic',   '{"standard":6,"shimmer":2}', 'greek_root',       'float');

UPDATE public.flowers SET recipe = '{"ingredients":["luminescent-lily","midnight-fern"]}' WHERE id = 'star-glass-orchid';
```

---

## Key Files

```
src/
├── app/
│   ├── page.tsx                  ← Main garden (protected, server component)
│   ├── login/page.tsx            ← Google sign-in page
│   ├── garden/[userId]/page.tsx  ← Read-only visitor view
│   ├── auth/callback/route.ts    ← Supabase OAuth callback
│   └── api/tts/route.ts          ← Server-side ElevenLabs proxy
├── components/
│   ├── GardenHeader.tsx          ← Sticky header with grade picker + user menu
│   ├── GameInitializer.tsx       ← Hydrates Zustand store from server data
│   ├── UserAvatar.tsx            ← Ported from PrepClutch; color-hash initials
│   ├── garden/GardenCanvas.tsx   ← PixiJS canvas; click-to-plant; emoji flowers
│   ├── crafting/AlchemistGreenhouse.tsx ← Flower catalog + plant flow + grid
│   ├── spelling/DailyBloom.tsx   ← Spelling input, TTS buttons, reward animation
│   └── social/GardenExplorer.tsx ← Classmates list with visit links
├── store/
│   └── game.ts                   ← Zustand: pollen, waterDrops, grade, placedFlowers
├── lib/
│   ├── supabase/client.ts        ← Browser Supabase client
│   ├── supabase/server.ts        ← Server Supabase client (SSR)
│   ├── elevenlabs/tts.ts         ← speakWord() — real in prod, mock in dev
│   └── words/index.ts            ← Word lists for grades 4–8 with traits + pollen rewards
└── types/
    ├── database.ts               ← Hand-coded DB types (User, Flower, GardenLayout, etc.)
    └── game.ts                   ← Game-domain types (GardenFlower, WordReward, etc.)
```

---

## What Works Today

- [x] Google sign-in via Supabase OAuth
- [x] ElevenLabs TTS (Victoria voice) reads words aloud; auto-plays on word change
- [x] Grade selector (4th–8th) in header, persisted to `users.spelling_level`
- [x] 20 words per grade (100 total), each tagged with a spelling trait
- [x] Correct spell → animated reward overlay (✨ shimmer or 🌱 standard)
- [x] Pollen earned scales with grade (grades 4–5 = 1, grades 6–7 = 2, grade 8 = 3)
- [x] Trait hint shown on correct spell ("Double-petaled flowers grow from double vowel words")
- [x] Flower catalog in greenhouse filtered by grade (common → mythic unlocked progressively)
- [x] Click "Plant" → crosshair mode → click garden to place flower
- [x] Flowers persist to Supabase `garden_layouts`, render as emoji in PixiJS
- [x] Read-only visitor garden at `/garden/[userId]`
- [x] User avatar + sign-out dropdown (ported from PrepClutch)

---

## What's Not Built Yet (Prioritized)

### High priority
- [ ] **Cross-pollination merging** — `AlchemistGreenhouse` has the grid UI but no drag-and-drop logic. Two flowers dragged into adjacent cells should check `flowers.recipe` and produce a hybrid. `star-glass-orchid` already has its recipe defined.
- [ ] **Real flower artwork** — PixiJS is rendering emoji as placeholder. Real sprites should load from `flowers.image_url`. A consistent art style (illustrated botanical) would make the garden feel magical.
- [ ] **Wilting mechanic** — when `spelling_progress.is_trouble_word` becomes true (3+ misses), the linked `garden_layouts.is_wilting` should flip to `true`. Wilted flowers show at 40% opacity and need to be "revived" by spelling the word correctly again.

### Medium priority
- [ ] **Classroom / grouping system** — `GardenExplorer` currently shows all users. Need a `classrooms` table (teacher creates, students join by code) so the visitor panel only shows actual classmates.
- [ ] **Emoji pollen reactions** — DB schema (`emoji_pollen` table) is ready. Visitor clicks a flower → drops an emoji. Owner gets a notification badge on next login.
- [ ] **Sentence context for TTS** — "Play Sentence" button calls `speakWord("Here is X in a sentence.")` which is a stub. Should call an API route that generates a grade-appropriate example sentence (Claude API or GPT) and caches it per word.
- [ ] **Shimmer seeds** — `waterDrops` currency is tracked but has no spending mechanic yet. Shimmer seeds should produce `is_shimmer = true` flowers (extra particle effects).

### Lower priority
- [ ] **PixiJS particle effects** — `flowers.particle_effect` field is `sparkle | glow | float | none` but PixiJS particles aren't wired up. Each effect type needs a particle emitter definition.
- [ ] **Word list expansion** — 20 words per grade is a starting set. Should pull from a curated source or allow teachers to upload custom lists.
- [ ] **Progress dashboard** — no view of `spelling_progress` data yet. A simple chart of words mastered vs. trouble words would motivate students.
- [ ] **Mobile layout** — current layout is a 3-column desktop design. Needs a responsive stacked layout for tablets/iPads (primary student device).

---

## Known Issues

- **Supabase type inference** — the hand-coded `Database` type in `src/types/database.ts` causes `never` inference on some `.update()` / `.upsert()` calls. Worked around with `as any` casts in `DailyBloom`, `GardenCanvas`, and `GardenHeader`. Long-term fix: run `supabase gen types typescript` to auto-generate proper types.
- **Grade picker shows "4th" not "4"** — the `GardenHeader` renders `{g}th` for all grades; grade 4 renders correctly but a future designer may want "4th / 5th / 6th / 7th / 8th" labels. Currently renders `4th 5th 6th 7th 8th`.
- **PixiJS canvas doesn't resize** — `resizeTo` is set on init but placed flowers keep their stored normalized coordinates. If the window is resized after flowers are placed they stay correct, but the canvas itself may not re-render flowers on resize without a full remount.
- **Spelling progress upsert** — the `upsert` doesn't increment `attempts` correctly (it overwrites with the current session's count rather than adding to the DB total). Needs a Supabase RPC function or a read-then-write.

---

## Local Dev Setup

```bash
cd ~/projects/spelling-garden
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
# → http://localhost:3000
# TTS auto-uses Web Speech API (no ElevenLabs key needed locally)
```

Add `http://localhost:3000/auth/callback` to **Supabase → Auth → URL Configuration → Redirect URLs** for local OAuth to work.

---

## Related Projects

- **PrepClutch** (`~/projects/prepclutch`, GitHub: `vernick-quest/prepclutch`) — HSPT prep app. `UserAvatar.tsx` and the sticky header pattern were ported from there. Google OAuth Client ID is shared between both apps.
