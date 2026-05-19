"use client";

import { useEffect, useRef, useCallback } from "react";
import { useGameStore } from "@/store/game";
import { createClient } from "@/lib/supabase/client";
import { FLOWER_EMOJI } from "@/components/crafting/AlchemistGreenhouse";
import type { GardenLayout, Flower } from "@/types/database";

type LayoutWithFlower = GardenLayout & { flowers: Flower | null };

interface Props {
  userId: string;
  initialLayouts: LayoutWithFlower[];
  readOnly?: boolean;
  visitorId?: string;
}

export function GardenCanvas({ userId, readOnly = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<import("pixi.js").Application | null>(null);
  const supabase = createClient();

  const placedFlowers = useGameStore((s) => s.placedFlowers);
  const plantingFlower = useGameStore((s) => s.plantingFlower);
  const commitPlant = useGameStore((s) => s.commitPlant);
  const pollen = useGameStore((s) => s.pollen);

  // Handle click-to-plant
  const handleCanvasClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      if (!plantingFlower || readOnly || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { data } = await db
        .from("garden_layouts")
        .insert({ user_id: userId, flower_id: plantingFlower.id, x_coordinate: x, y_coordinate: y })
        .select()
        .single();

      await db
        .from("inventory")
        .update({ pollen: pollen - plantingFlower.base_seed_cost.standard })
        .eq("user_id", userId);

      if (data) commitPlant(data.id, x, y, false);
    },
    [plantingFlower, readOnly, pollen, userId, supabase, commitPlant]
  );

  // PixiJS rendering
  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    async function init() {
      const { Application, Text, TextStyle, Graphics } = await import("pixi.js");

      const app = new Application();
      await app.init({
        resizeTo: containerRef.current!,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio ?? 1,
        autoDensity: true,
      });

      if (destroyed) { app.destroy(true); return; }
      containerRef.current!.appendChild(app.canvas);
      appRef.current = app;

      // Garden path — subtle stone path circles
      const path = new Graphics();
      const pathPoints = [[0.5,0.85],[0.45,0.75],[0.52,0.65],[0.48,0.55],[0.5,0.42]];
      for (const [px, py] of pathPoints) {
        path.circle(px * app.screen.width, py * app.screen.height, 22);
        path.fill({ color: 0x1a3a2a, alpha: 0.4 });
      }
      app.stage.addChild(path);

      // Render each placed flower
      for (const pf of placedFlowers) {
        const x = pf.x * app.screen.width;
        const y = pf.y * app.screen.height;
        const emoji = FLOWER_EMOJI[pf.flower.id] ?? "🌸";

        const emojiText = new Text({
          text: emoji,
          style: new TextStyle({ fontSize: 40 }),
        });
        emojiText.anchor.set(0.5);
        emojiText.x = x;
        emojiText.y = y;
        emojiText.alpha = pf.isWilting ? 0.4 : 1;

        const label = new Text({
          text: pf.flower.name,
          style: new TextStyle({
            fontSize: 10,
            fill: 0xaabbcc,
            fontFamily: "system-ui",
          }),
        });
        label.anchor.set(0.5, 0);
        label.x = x;
        label.y = y + 24;

        app.stage.addChild(emojiText);
        app.stage.addChild(label);
      }
    }

    init();

    return () => {
      destroyed = true;
      appRef.current?.destroy(true, { children: true, texture: true });
      appRef.current = null;
    };
  }, [placedFlowers]);

  return (
    <div
      ref={containerRef}
      onClick={handleCanvasClick}
      className="relative flex-1 min-h-0 w-full overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #071020 0%, #0a2010 60%, #0d2818 100%)",
        cursor: plantingFlower ? "crosshair" : "default",
      }}
      aria-label={readOnly ? "Visitor garden view" : "Your spelling garden"}
    >
      {/* Empty state */}
      {placedFlowers.length === 0 && !plantingFlower && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <p className="text-4xl">🌱</p>
          <p className="text-sm text-[var(--text-muted)] text-center max-w-xs">
            Spell words to earn pollen, then plant flowers from the greenhouse
          </p>
        </div>
      )}
      {plantingFlower && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full border border-[var(--accent-shimmer)] bg-[var(--panel-bg)]/80 px-4 py-1.5 text-xs text-violet-300 pointer-events-none backdrop-blur-sm">
          {FLOWER_EMOJI[plantingFlower.id] ?? "🌸"} Click to plant {plantingFlower.name}
        </div>
      )}
    </div>
  );
}
