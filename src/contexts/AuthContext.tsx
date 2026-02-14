"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { ensureProfile } from "@/lib/database";
import type { User, Session } from "@supabase/supabase-js";

export type UserProfile = {
  id?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  full_name?: string;
  bio?: string;
  role?: string;
  equipment?: string;
  styles?: string[];
  credit_score?: number;
  location?: string;
  university?: string;
  is_visible?: boolean;
  username_changed_at?: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  userProfile: null,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // 加载用户资料（如果不存在则自动创建，信用分默认80）
  const loadUserProfile = useCallback(async (userId: string, email: string) => {
    try {
      // 自动创建/获取资料 — 登录即加入人才库
      const profile = await ensureProfile(userId, email);

      if (profile) {
        setUserProfile({
          id: profile.id,
          username: profile.username || undefined,
          display_name: profile.display_name || undefined,
          avatar_url: profile.avatar_url || undefined,
          full_name: profile.full_name || undefined,
          bio: profile.bio || undefined,
          role: profile.role || undefined,
          equipment: profile.equipment || undefined,
          styles: profile.styles || [],
          credit_score: profile.credit_score ?? 80,
          location: profile.location || undefined,
          university: profile.university || undefined,
          is_visible: profile.is_visible ?? true,
        });
      }
    } catch (error) {
      console.error("加载用户资料异常:", error);
    }
  }, []);

  // 刷新用户资料
  const refreshProfile = useCallback(async () => {
    if (user?.id && user?.email) {
      await loadUserProfile(user.id, user.email);
    }
  }, [user, loadUserProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id && session?.user?.email) {
        loadUserProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id && session?.user?.email) {
        loadUserProfile(session.user.id, session.user.email);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userProfile, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
