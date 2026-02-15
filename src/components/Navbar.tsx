"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUnreadCount } from "@/lib/database";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const { user, loading, signOut, userProfile } = useAuth();
  const { t } = useLanguage();
  const [unreadMessages, setUnreadMessages] = useState(0);

  const navLinks = [
    { label: t("nav", "talent"), href: "/crew" },
    { label: t("nav", "opportunities"), href: "/projects" },
    { label: t("nav", "plans"), href: "/plans" },
    { label: t("nav", "about"), href: "/about" },
  ];

  // 定时检查未读消息
  useEffect(() => {
    if (!user) return;

    const check = async () => {
      const count = await getUnreadCount(user.id);
      setUnreadMessages(count);
    };

    check();
    const interval = setInterval(check, 15000); // 每15秒检查一次
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black/40 backdrop-blur-md border-b border-white/10">
      <Link href="/" className="text-2xl font-bold text-white tracking-tight">
        CineMatch
      </Link>

      <div className="flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-neutral-300 hover:text-white transition-colors"
          >
            {link.label}
          </Link>
        ))}

        {!loading && !user && (
          <>
            <LanguageSwitcher />
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 transition-all"
            >
              {t("nav", "login")}
            </Link>
          </>
        )}

        {!loading && user && (
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {/* 私信入口 */}
            <Link
              href="/messages"
              className="relative flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
            >
              <MessageCircle className="h-5 w-5 text-neutral-300 hover:text-[#5CC8D6]" />
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#5CC8D6] text-[9px] font-bold text-[#050505]">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
            >
              {/* 头像 */}
              <div className="w-8 h-8 rounded-full border border-[#5CC8D6]/30 bg-white/10 flex items-center justify-center overflow-hidden">
                <img
                  src={userProfile?.avatar_url || `https://api.dicebear.com/9.x/adventurer/svg?seed=${user.id}`}
                  alt={user.email || t("common", "user")}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${user.id}`;
                  }}
                />
              </div>
              {/* 显示名称或邮箱 */}
              <span className="text-sm text-[#5CC8D6] hover:text-[#7AD4DF] transition-colors hidden sm:inline">
                {userProfile?.display_name || user.email?.split("@")[0]}
              </span>
            </Link>
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              {t("nav", "logout")}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
