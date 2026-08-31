"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type SnsLink = { platform: string; url: string };

export type PublicUser = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_guest: boolean;
  total_likes_received: number;
  badge_level: number;
  bio: string | null;
  used_daws: string[];
  activity_area: string | null;
  sns_links: SnsLink[];
  follower_count: number;
  following_count: number;
  is_admin: boolean;
};

type AuthContextValue = {
  user: User | null;
  profile: PublicUser | null;
  isGuest: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("users")
      .select(
        "id, display_name, avatar_url, is_guest, total_likes_received, badge_level, bio, used_daws, activity_area, sns_links, follower_count, following_count, is_admin",
      )
      .eq("id", userId)
      .single();
    setProfile(data ?? null);
  }

  useEffect(() => {
    let active = true;

    async function init() {
      const {
        data: { session: current },
      } = await supabase.auth.getSession();

      if (!current) {
        // 初回訪問者には匿名認証で仮IDを発行する
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!active) return;
        if (!error && data.session) {
          setSession(data.session);
          await loadProfile(data.session.user.id);
        }
      } else {
        setSession(current);
        await loadProfile(current.user.id);
      }
      if (active) setLoading(false);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const value: AuthContextValue = {
    user: session?.user ?? null,
    profile,
    isGuest: profile?.is_guest ?? true,
    loading,
    refreshProfile: async () => {
      if (session?.user) await loadProfile(session.user.id);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
