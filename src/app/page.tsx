import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GardenCanvas } from "@/components/garden/GardenCanvas";
import { AlchemistGreenhouse } from "@/components/crafting/AlchemistGreenhouse";
import { DailyBloom } from "@/components/spelling/DailyBloom";
import { GardenExplorer } from "@/components/social/GardenExplorer";
import { GardenHeader } from "@/components/GardenHeader";
import type { GardenLayout, Flower } from "@/types/database";

type LayoutWithFlower = GardenLayout & { flowers: Flower | null };

export default async function GardenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: layouts } = await supabase
    .from("garden_layouts")
    .select("*, flowers(*)")
    .eq("user_id", user.id);

  const { data: inventory } = await supabase
    .from("inventory")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <GardenHeader />

      <main className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="w-80 shrink-0 border-r border-[var(--panel-border)] overflow-y-auto">
          <AlchemistGreenhouse inventory={inventory ?? null} />
        </aside>

        <section className="flex flex-col flex-1 min-w-0">
          <GardenCanvas layouts={(layouts as LayoutWithFlower[]) ?? []} userId={user.id} />
          <DailyBloom userId={user.id} />
        </section>

        <aside className="w-72 shrink-0 border-l border-[var(--panel-border)] overflow-y-auto">
          <GardenExplorer currentUserId={user.id} />
        </aside>
      </main>
    </div>
  );
}
