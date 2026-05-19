import { createClient } from "@/lib/supabase/server";
import { GardenCanvas } from "@/components/garden/GardenCanvas";
import { notFound } from "next/navigation";
import type { GardenLayout, Flower } from "@/types/database";

type LayoutWithFlower = GardenLayout & { flowers: Flower | null };

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function VisitorGardenPage({ params }: Props) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: rawOwner } = await supabase
    .from("users")
    .select("name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  const owner = rawOwner as { name: string; avatar_url: string | null } | null;
  if (!owner) notFound();

  const { data: layouts } = await supabase
    .from("garden_layouts")
    .select("*, flowers(*)")
    .eq("user_id", userId);

  const {
    data: { user: visitor },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-col h-screen">
      <header className="flex items-center gap-3 px-6 py-3 border-b border-[var(--panel-border)]">
        <span className="font-display text-lg text-[var(--accent-shimmer)]">
          {owner.name}&apos;s Garden
        </span>
        <span className="text-xs text-[var(--text-muted)]">Read-only visitor view</span>
      </header>

      <div className="flex-1 min-h-0">
        <GardenCanvas
          initialLayouts={(layouts as LayoutWithFlower[]) ?? []}
          userId={userId}
          readOnly
          visitorId={visitor?.id}
        />
      </div>
    </main>
  );
}
