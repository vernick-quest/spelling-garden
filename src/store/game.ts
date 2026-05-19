"use client";

import { create } from "zustand";
import type { Flower, GardenLayout } from "@/types/database";
import type { Grade } from "@/lib/words";

export interface PlacedFlower {
  layoutId: string;
  flower: Flower;
  x: number;
  y: number;
  isShimmer: boolean;
  isWilting: boolean;
}

interface RewardAnimation {
  text: string;
  emoji: string;
  shimmer: boolean;
}

interface GameStore {
  pollen: number;
  waterDrops: number;
  grade: Grade;
  placedFlowers: PlacedFlower[];
  plantingFlower: Flower | null;
  reward: RewardAnimation | null;

  init: (opts: {
    pollen: number;
    waterDrops: number;
    grade: Grade;
    layouts: (GardenLayout & { flowers: Flower | null })[];
  }) => void;
  setGrade: (g: Grade) => void;
  earnPollen: (amount?: number) => void;
  earnWater: (amount?: number) => void;
  showReward: (r: RewardAnimation) => void;
  clearReward: () => void;
  selectPlanting: (f: Flower | null) => void;
  commitPlant: (layoutId: string, x: number, y: number, isShimmer: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  pollen: 0,
  waterDrops: 0,
  grade: 5,
  placedFlowers: [],
  plantingFlower: null,
  reward: null,

  init: ({ pollen, waterDrops, grade, layouts }) =>
    set({
      pollen,
      waterDrops,
      grade,
      placedFlowers: layouts
        .filter((l) => l.flowers)
        .map((l) => ({
          layoutId: l.id,
          flower: l.flowers!,
          x: l.x_coordinate,
          y: l.y_coordinate,
          isShimmer: l.is_shimmer,
          isWilting: l.is_wilting,
        })),
    }),

  setGrade: (g) => set({ grade: g }),
  earnPollen: (amount = 1) => set((s) => ({ pollen: s.pollen + amount })),
  earnWater: (amount = 1) => set((s) => ({ waterDrops: s.waterDrops + amount })),
  showReward: (r) => set({ reward: r }),
  clearReward: () => set({ reward: null }),
  selectPlanting: (f) => set({ plantingFlower: f }),

  commitPlant: (layoutId, x, y, isShimmer) =>
    set((s) => ({
      placedFlowers: [
        ...s.placedFlowers,
        { layoutId, flower: s.plantingFlower!, x, y, isShimmer, isWilting: false },
      ],
      plantingFlower: null,
      pollen: s.pollen - (s.plantingFlower?.base_seed_cost.standard ?? 0),
    })),
}));
