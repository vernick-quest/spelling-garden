"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/game";
import type { GardenLayout, Flower, Inventory } from "@/types/database";

type LayoutWithFlower = GardenLayout & { flowers: Flower | null };

interface Props {
  inventory: Inventory | null;
  layouts: LayoutWithFlower[];
}

export function GameInitializer({ inventory, layouts }: Props) {
  const init = useGameStore((s) => s.init);

  useEffect(() => {
    init({
      pollen: inventory?.pollen ?? 0,
      waterDrops: inventory?.water_drops ?? 0,
      layouts,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
