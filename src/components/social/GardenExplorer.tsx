"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { User } from "@/types/database";

interface Props {
  currentUserId: string;
}

export function GardenExplorer({ currentUserId }: Props) {
  const supabase = createClient();
  const [classmates, setClassmates] = useState<User[]>([]);

  useEffect(() => {
    supabase
      .from("users")
      .select("*")
      .neq("id", currentUserId)
      .limit(10)
      .then(({ data }) => setClassmates(data ?? []));
  }, [currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <h2 className="font-display text-sm tracking-widest text-[var(--text-muted)] uppercase text-center">
        Garden Explorer
      </h2>

      <section>
        <h3 className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
          Classmates ({classmates.length})
        </h3>
        {classmates.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] text-center py-4">
            No classmates yet — share your garden link!
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {classmates.map((c) => (
              <li key={c.id} className="flex items-center gap-3">
                <Avatar user={c} size={32} />
                <span className="text-sm flex-1 truncate">{c.name}</span>
                <Link
                  href={`/garden/${c.id}`}
                  className="text-xs text-[var(--accent-shimmer)] hover:underline shrink-0"
                >
                  Visit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Avatar({ user, size }: { user: User; size: number }) {
  if (user.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar_url}
        alt={user.name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const hue = (user.name.charCodeAt(0) * 37) % 360;
  return (
    <div
      className="rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ width: size, height: size, background: `hsl(${hue}, 60%, 40%)` }}
    >
      {initials}
    </div>
  );
}
