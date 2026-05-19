import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GardenCanvas } from "@/components/garden/GardenCanvas";
import { AlchemistGreenhouse } from "@/components/crafting/AlchemistGreenhouse";
import { DailyBloom } from "@/components/spelling/DailyBloom";
import { GardenExplorer } from "@/components/social/GardenExplorer";
import { GardenHeader } from "@/components/GardenHeader";
import { GameInitializer } from "@/components/GameInitializer";
import type { GardenLayout, Flower } from "@/types/database";

type LayoutWithFlower = GardenLayout & { flowers: Flower | null };

export default async function GardenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: layouts }, { data: inventory }, { data: flowers }] = await Promise.all([
    supabase.from("garden_layouts").select("*, flowers(*)").eq("user_id", user.id),
    supabase.from("inventory").select("*").eq("user_id", user.id).single(),
    supabase.from("flowers").select("*").eq("is_discoverable", true).order("rarity"),
  ]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <GardenHeader />
      <GameInitializer
        inventory={inventory ?? null}
        layouts={(layouts as LayoutWithFlower[]) ?? []}
      />

      <main className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="w-80 shrink-0 border-r border-[var(--panel-border)] overflow-y-auto">
          <AlchemistGreenhouse flowers={(flowers as Flower[]) ?? []} />
        </aside>

        <section className="flex flex-col flex-1 min-w-0">
          <GardenCanvas
            userId={user.id}
            initialLayouts={(layouts as LayoutWithFlower[]) ?? []}
          />
          <DailyBloom userId={user.id} />
        </section>

        <aside className="w-72 shrink-0 border-l border-[var(--panel-border)] overflow-y-auto">
          <GardenExplorer currentUserId={user.id} />
        </aside>
      </main>
    </div>
  );
}
