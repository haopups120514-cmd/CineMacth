"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUnreadCount } from "@/lib/database";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const { user, loading, signOut, userProfile } = useAuth();
  const { t } = useLanguage();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // 路由切换时关闭移动菜单
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 bg-black/40 backdrop-blur-md border-b border-white/10">
        <Link href="/" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          CineMatch
        </Link>

        {/* ====== 桌面端导航 ====== */}
        <div className="hidden md:flex items-center gap-8">
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

        {/* ====== 移动端右侧：语言+消息+汉堡 ====== */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          {!loading && user && (
            <Link
              href="/messages"
              className="relative flex items-center p-2 rounded-lg hover:bg-white/5"
            >
              <MessageCircle className="h-5 w-5 text-neutral-300" />
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#5CC8D6] text-[9px] font-bold text-[#050505]">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* ====== 移动端侧边栏 ====== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* 菜单面板 */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#0f0f0f] border-l border-white/10 md:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* 菜单头部 */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <span className="text-lg font-bold text-white">CineMatch</span>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* 用户信息（登录后） */}
                {!loading && user && (
                  <div className="p-4 border-b border-white/10">
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full border border-[#5CC8D6]/30 bg-white/10 flex items-center justify-center overflow-hidden">
                        <img
                          src={userProfile?.avatar_url || `https://api.dicebear.com/9.x/adventurer/svg?seed=${user.id}`}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${user.id}`;
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {userProfile?.display_name || user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </Link>
                  </div>
                )}

                {/* 导航链接 */}
                <div className="flex-1 p-4 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-4 py-3 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-all text-sm"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {!loading && user && (
                    <Link
                      href="/messages"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-all text-sm"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {t("nav", "messages") || t("home", "myMessages")}
                      {unreadMessages > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#5CC8D6] text-[9px] font-bold text-[#050505]">
                          {unreadMessages > 9 ? "9+" : unreadMessages}
                        </span>
                      )}
                    </Link>
                  )}
                </div>

                {/* 底部操作 */}
                <div className="p-4 border-t border-white/10 space-y-2">
                  {!loading && !user && (
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full px-5 py-3 text-sm font-medium text-[#050505] rounded-lg bg-[#5CC8D6] hover:bg-[#7AD4DF] transition-all"
                    >
                      {t("nav", "login")}
                    </Link>
                  )}
                  {!loading && user && (
                    <button
                      onClick={() => {
                        signOut();
                        setMobileOpen(false);
                      }}
                      className="flex items-center justify-center w-full px-5 py-3 text-sm text-neutral-400 hover:text-white rounded-lg border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                    >
                      {t("nav", "logout")}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
