"use client";

// Header ported from PrepClutch's App.jsx sticky user bar + dropdown pattern.
// Adapted for Supabase Auth sign-out and Spelling Garden branding.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "./providers";
import { UserAvatar } from "./UserAvatar";

export function GardenHeader() {
  const { profile } = useSession();
  const [showDropdown, setDropdown] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Close dropdown on outside click — same pattern as PrepClutch
  useEffect(() => {
    if (!showDropdown) return;
    const handler = () => setDropdown(false);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [showDropdown]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 300,
        background: "#0a1628cc", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a3a5c",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 20px",
      }}
    >
      <span style={{ fontFamily: "var(--font-cinzel), Georgia, serif", fontSize: 16, color: "#a78bfa", letterSpacing: "0.05em" }}>
        Spelling Garden
      </span>

      {profile ? (
        <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setDropdown((d) => !d)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center", gap: 8 }}
          >
            <UserAvatar size={32} showName />
          </button>

          {showDropdown && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "#0d1f3c", border: "1px solid #1a3a5c", borderRadius: 12,
              padding: 16, minWidth: 220, zIndex: 400,
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>{profile.name}</div>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 14 }}>{profile.email}</div>
              <button
                onClick={handleSignOut}
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: 8,
                  border: "1px solid #ef444444", background: "#ef444411",
                  color: "#fca5a5", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
}
