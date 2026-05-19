import type { Rarity, ParticleEffect } from "./database";

export type { Rarity, ParticleEffect };

export type SpellingTrait =
  | "double_vowel"
  | "silent_letter"
  | "sight_word"
  | "consonant_cluster"
  | "prefix"
  | "suffix"
  | "irregular";

export type WordOutcome = "flawless" | "guided" | "pending";

export interface MergeRecipe {
  ingredients: [string, string];
  result: string;
  requiresShimmer?: boolean;
}

export interface SeedBundle {
  shimmer: number;
  standard: number;
  pollen?: number;
  water?: number;
}

export interface WordReward {
  outcome: WordOutcome;
  seeds: SeedBundle;
  traitUnlocked?: SpellingTrait;
  flowerHint?: string;
}

export interface GardenFlower {
  layoutId: string;
  flowerId: string;
  name: string;
  rarity: Rarity;
  particleEffect: ParticleEffect;
  imageUrl: string | null;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  isShimmer: boolean;
  isWilting: boolean;
}
