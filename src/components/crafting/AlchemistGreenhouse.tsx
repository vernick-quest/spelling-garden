"use client";

import { useGameStore } from "@/store/game";
import type { Flower } from "@/types/database";
import type { Grade } from "@/lib/words";

// Flowers available by grade tier — matches min_grade column in DB
const GRADE_RARITY: Record<Grade, string[]> = {
  4: ["common"],
  5: ["common", "uncommon"],
  6: ["common", "uncommon", "rare"],
  7: ["common", "uncommon", "rare", "shimmer"],
  8: ["common", "uncommon", "rare", "shimmer", "mythic"],
};

interface Props {
  flowers: Flower[];
}

export const FLOWER_EMOJI: Record<string, string> = {
  "common-daisy": "🌼",
  "luminescent-lily": "🌸",
  "midnight-fern": "🌿",
  "shimmer-rose": "🌹",
  "star-glass-orchid": "🌺",
  "cloud-prickle-cactus": "🌵",
  "sunfire-bloom": "🌻",
  "twilight-violet": "💜",
};

const RARITY_COLOR: Record<string, string> = {
  common: "#64748b",
  uncommon: "#34d399",
  rare: "#60a5fa",
  shimmer: "#a78bfa",
  mythic: "#f59e0b",
};

const GRID_SIZE = 5;

export function AlchemistGreenhouse({ flowers }: Props) {
  const pollen = useGameStore((s) => s.pollen);
  const waterDrops = useGameStore((s) => s.waterDrops);
  const plantingFlower = useGameStore((s) => s.plantingFlower);
  const selectPlanting = useGameStore((s) => s.selectPlanting);
  const grade = useGameStore((s) => s.grade);

  const allowedRarities = GRADE_RARITY[grade];
  const gradeFlowers = flowers.filter((f) => !f.recipe && allowedRarities.includes(f.rarity));
  const lockedByGrade = flowers.filter((f) => !f.recipe && !allowedRarities.includes(f.rarity));

  const affordable = gradeFlowers.filter((f) => pollen >= f.base_seed_cost.standard);
  const locked = gradeFlowers.filter((f) => pollen < f.base_seed_cost.standard);

  return (
    <div className="flex flex-col h-full p-4 gap-4">

      {/* Header */}
      <h2 className="font-display text-sm tracking-widest text-[var(--text-muted)] uppercase text-center">
        Alchemist&apos;s Greenhouse
      </h2>

      {/* Currency */}
      <div className="flex justify-around rounded-lg border border-[var(--panel-border)] bg-[var(--garden-bg)] px-3 py-2">
        <div className="text-center">
          <div className="text-xl">🌿</div>
          <div className="text-sm font-bold text-[var(--text-primary)]">{pollen}</div>
          <div className="text-xs text-[var(--text-muted)]">Pollen</div>
        </div>
        <div className="w-px bg-[var(--panel-border)]" />
        <div className="text-center">
          <div className="text-xl">💧</div>
          <div className="text-sm font-bold text-[var(--text-primary)]">{waterDrops}</div>
          <div className="text-xs text-[var(--text-muted)]">Drops</div>
        </div>
      </div>

      {/* Planting mode banner */}
      {plantingFlower && (
        <div className="rounded-lg border border-[var(--accent-shimmer)] bg-violet-900/30 px-3 py-2 text-xs text-violet-300 text-center">
          {FLOWER_EMOJI[plantingFlower.id] ?? "🌸"} Planting <strong>{plantingFlower.name}</strong>
          <br />Click anywhere in the garden to place it
          <button
            onClick={() => selectPlanting(null)}
            className="block mx-auto mt-1 text-violet-400 hover:text-violet-200 underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Flower catalog */}
      <section className="flex-1 overflow-y-auto flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Seed Catalog
        </h3>

        {flowers.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] text-center py-4">
            Spell words to unlock flowers
          </p>
        ) : (
          <>
            {affordable.map((f) => (
              <FlowerCard key={f.id} flower={f} canAfford isPlanting={plantingFlower?.id === f.id}
                onPlant={() => selectPlanting(plantingFlower?.id === f.id ? null : f)} />
            ))}
            {locked.map((f) => (
              <FlowerCard key={f.id} flower={f} canAfford={false} isPlanting={false} onPlant={() => {}} />
            ))}
            {lockedByGrade.length > 0 && (
              <div className="rounded-lg border border-dashed border-[var(--panel-border)] p-2.5 text-center">
                <p className="text-xs text-[var(--text-muted)]">
                  🔒 {lockedByGrade.length} rarer flower{lockedByGrade.length > 1 ? "s" : ""} unlock at higher grades
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Cross-pollination grid — placeholder */}
      <section>
        <h3 className="text-xs font-semibold text-[var(--text-muted)] mb-2 text-center uppercase tracking-wider">
          Cross-Pollination Grid
        </h3>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded border border-[var(--panel-border)] bg-[var(--panel-bg)] flex items-center justify-center hover:border-[var(--accent-shimmer)] transition-colors cursor-pointer"
            />
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] text-center mt-1">
          Drag flowers here to discover hybrids
        </p>
      </section>
    </div>
  );
}

function FlowerCard({
  flower, canAfford, isPlanting, onPlant,
}: {
  flower: Flower;
  canAfford: boolean;
  isPlanting: boolean;
  onPlant: () => void;
}) {
  const emoji = FLOWER_EMOJI[flower.id] ?? "🌸";
  const rarityColor = RARITY_COLOR[flower.rarity] ?? "#64748b";

  return (
    <div className={`rounded-lg border p-2.5 flex items-center gap-3 transition-colors ${isPlanting ? "border-[var(--accent-shimmer)] bg-violet-900/20" : "border-[var(--panel-border)] bg-[var(--panel-bg)]"} ${!canAfford ? "opacity-50" : ""}`}>
      <span className="text-2xl shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{flower.name}</span>
          <span className="text-xs shrink-0" style={{ color: rarityColor }}>
            {flower.rarity}
          </span>
        </div>
        <div className="text-xs text-[var(--text-muted)] truncate">{flower.description ?? "A garden flower"}</div>
        <div className="text-xs mt-0.5" style={{ color: canAfford ? "#34d399" : "#ef4444" }}>
          🌿 {flower.base_seed_cost.standard} pollen
        </div>
      </div>
      {canAfford && (
        <button
          onClick={onPlant}
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold border transition-colors ${isPlanting ? "border-[var(--accent-shimmer)] bg-violet-700/50 text-violet-200" : "border-emerald-600 bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/50"}`}
        >
          {isPlanting ? "✓" : "Plant"}
        </button>
      )}
    </div>
  );
}
