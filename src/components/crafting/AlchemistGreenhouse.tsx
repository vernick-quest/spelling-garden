"use client";

import type { Inventory } from "@/types/database";

interface Props {
  inventory: Inventory | null;
}

const GRID_SIZE = 5;

export function AlchemistGreenhouse({ inventory }: Props) {
  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE });

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="text-center">
        <h2 className="font-display text-sm tracking-widest text-[var(--text-muted)] uppercase">
          Alchemist&apos;s Greenhouse
        </h2>
      </div>

      <div className="flex justify-around text-xs text-[var(--text-muted)]">
        <span>💧 {inventory?.water_drops ?? 0}</span>
        <span>🌿 {inventory?.pollen ?? 0}</span>
        <span>✨ {(inventory?.shimmer_seeds as unknown[])?.length ?? 0} shimmer</span>
      </div>

      <section>
        <h3 className="text-xs font-semibold text-[var(--text-muted)] mb-2 text-center uppercase tracking-wider">
          Cross-Pollination Grid
        </h3>
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        >
          {cells.map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded border border-[var(--panel-border)] bg-[var(--panel-bg)] flex items-center justify-center cursor-pointer hover:border-[var(--accent-shimmer)] transition-colors"
            />
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] text-center mt-2">
          Drag seeds into the grid to merge flowers
        </p>
      </section>

      <section className="flex-1">
        <h3 className="text-xs font-semibold text-[var(--text-muted)] mb-2 text-center uppercase tracking-wider">
          Hybrid Finder
        </h3>
        <div className="rounded border border-[var(--panel-border)] bg-[var(--panel-bg)] p-3 text-xs text-[var(--text-muted)] text-center">
          Discover hybrids by merging flowers in the grid above
        </div>
      </section>
    </div>
  );
}
