"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/game";
import type { GardenLayout, Flower, Inventory } from "@/types/database";
import type { Grade } from "@/lib/words";

type LayoutWithFlower = GardenLayout & { flowers: Flower | null };

interface Props {
  inventory: Inventory | null;
  layouts: LayoutWithFlower[];
  grade: Grade;
}

export function GameInitializer({ inventory, layouts, grade }: Props) {
  const init = useGameStore((s) => s.init);

  useEffect(() => {
    init({
      pollen: inventory?.pollen ?? 0,
      waterDrops: inventory?.water_drops ?? 0,
      grade,
      layouts,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
