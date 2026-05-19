"use client";

import { useEffect, useRef } from "react";
import type { GardenLayout, Flower } from "@/types/database";

type LayoutWithFlower = GardenLayout & { flowers: Flower | null };

interface Props {
  layouts: LayoutWithFlower[];
  userId: string;
  readOnly?: boolean;
  visitorId?: string;
}

export function GardenCanvas({ layouts, readOnly = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let app: import("pixi.js").Application | null = null;

    async function initPixi() {
      const { Application, Graphics } = await import("pixi.js");

      app = new Application();
      await app.init({
        resizeTo: containerRef.current!,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio ?? 1,
        autoDensity: true,
      });
      containerRef.current!.appendChild(app.canvas);

      for (const layout of layouts) {
        const x = layout.x_coordinate * app.screen.width;
        const y = layout.y_coordinate * app.screen.height;

        if (layout.flowers?.image_url) {
          const { Sprite } = await import("pixi.js");
          const sprite = Sprite.from(layout.flowers.image_url);
          sprite.anchor.set(0.5);
          sprite.x = x;
          sprite.y = y;
          sprite.scale.set(layout.scale * 0.5);
          sprite.rotation = (layout.rotation * Math.PI) / 180;
          sprite.alpha = layout.is_wilting ? 0.4 : 1;
          if (!readOnly) {
            sprite.eventMode = "static";
            sprite.cursor = "pointer";
          }
          app.stage.addChild(sprite);
        } else {
          const g = new Graphics();
          g.circle(0, 0, 20 * layout.scale);
          g.fill({ color: layout.is_shimmer ? 0xa78bfa : 0x34d399, alpha: layout.is_wilting ? 0.4 : 1 });
          g.x = x;
          g.y = y;
          app.stage.addChild(g);
        }
      }
    }

    initPixi();
    return () => { app?.destroy(true, { children: true, texture: true }); };
  }, [layouts, readOnly]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-h-0 w-full overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #0d2040 100%)" }}
      aria-label={readOnly ? "Visitor view of garden" : "Your spelling garden"}
    />
  );
}
