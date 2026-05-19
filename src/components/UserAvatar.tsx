"use client";

// Ported from PrepClutch's UserAvatar.jsx — color hash algorithm and initials logic preserved.
// Adapted: uses Supabase profile (avatar_url, name) instead of GSI payload (picture, name).

import { useSession } from "./providers";

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#a78bfa", "#0ea5e9", "#14b8a6",
  "#f97316", "#ec4899", "#f59e0b",
];

function getAvatarColor(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[Math.abs(h)];
}

interface Props {
  size?: number;
  showName?: boolean;
  ringColor?: string;
}

export function UserAvatar({ size = 32, showName = false, ringColor = "#a78bfa" }: Props) {
  const { profile } = useSession();
  if (!profile) return null;

  const initials = profile.name
    ? profile.name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()
    : "?";
  const bg = getAvatarColor(profile.name);
  const fontSize = Math.round(size * 0.38);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: showName ? 8 : 0 }}>
      <div
        style={{
          width: size, height: size, borderRadius: "50%",
          border: `2px solid ${ringColor}`,
          boxSizing: "border-box", overflow: "hidden", flexShrink: 0,
          background: bg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span style={{ fontSize, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
            {initials}
          </span>
        )}
      </div>
      {showName && (
        <span style={{ fontSize: 14, color: "#e2e8f0" }}>
          {profile.name.split(" ")[0]}
        </span>
      )}
    </div>
  );
}
