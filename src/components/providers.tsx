"use client";

import { createClient } from "@/lib/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/types/database";

interface SessionContextValue {
  supabaseUser: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextValue>({
  supabaseUser: null,
  profile: null,
  loading: true,
});

export function useSession() {
  return useContext(SessionContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSupabaseUser(user);
      if (user) fetchProfile(user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from("users").select("*").eq("id", userId).single();
    setProfile(data ?? null);
    setLoading(false);
  }

  return (
    <SessionContext.Provider value={{ supabaseUser, profile, loading }}>
      {children}
    </SessionContext.Provider>
  );
}
