export type Rarity = "common" | "uncommon" | "rare" | "shimmer" | "mythic";
export type ParticleEffect = "none" | "sparkle" | "glow" | "float";
export type Emoji = "✨" | "❤️" | "👍" | "🌟" | "🎉";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  spelling_level: number;
  mmr: number;
  created_at: string;
  updated_at: string;
}

export interface Flower {
  id: string;
  name: string;
  description: string | null;
  lore: string | null;
  rarity: Rarity;
  base_seed_cost: { standard: number; shimmer: number };
  recipe: { ingredients: string[] } | null;
  spelling_trait: string | null;
  particle_effect: ParticleEffect;
  image_url: string | null;
  is_discoverable: boolean;
}

export interface SpellingProgress {
  id: string;
  user_id: string;
  word: string;
  word_list: string;
  mastery_level: 0 | 1 | 2 | 3;
  attempts: number;
  correct_first_try_count: number;
  is_trouble_word: boolean;
  last_practiced_at: string | null;
  created_at: string;
}

export interface Inventory {
  user_id: string;
  pollen: number;
  water_drops: number;
  shimmer_seeds: SeedStack[];
  standard_seeds: SeedStack[];
  nutrients: { nitrogen: number; phosphorus: number; sunlight: number };
  updated_at: string;
}

export interface SeedStack {
  flower_id: string;
  quantity: number;
}

export interface GardenLayout {
  id: string;
  user_id: string;
  flower_id: string;
  x_coordinate: number;
  y_coordinate: number;
  scale: number;
  rotation: number;
  is_shimmer: boolean;
  is_wilting: boolean;
  placed_at: string;
}

export interface EmojiPollen {
  id: string;
  from_user_id: string;
  garden_layout_id: string;
  emoji: Emoji;
  is_seen: boolean;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> };
      flowers: { Row: Flower; Insert: Partial<Flower>; Update: Partial<Flower> };
      spelling_progress: {
        Row: SpellingProgress;
        Insert: Partial<SpellingProgress>;
        Update: Partial<SpellingProgress>;
      };
      inventory: {
        Row: Inventory;
        Insert: Partial<Inventory>;
        Update: Partial<Inventory>;
      };
      garden_layouts: {
        Row: GardenLayout;
        Insert: Partial<GardenLayout>;
        Update: Partial<GardenLayout>;
      };
      emoji_pollen: {
        Row: EmojiPollen;
        Insert: Partial<EmojiPollen>;
        Update: Partial<EmojiPollen>;
      };
    };
  };
};
