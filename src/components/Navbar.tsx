"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "人才库", href: "/crew" },
  { label: "机会广场", href: "/projects" },
  { label: "关于", href: "/about" },
];

export default function Navbar() {
  const { user, loading, signOut, userProfile } = useAuth();

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
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 transition-all"
          >
            登录
          </Link>
        )}

        {!loading && user && (
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
            >
              {/* 头像 */}
              <div className="w-8 h-8 rounded-full border border-[#5CC8D6]/30 bg-white/10 flex items-center justify-center overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt={user.email || "用户"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%235CC8D6' width='100' height='100'/%3E%3Ctext x='50' y='60' font-size='50' fill='white' text-anchor='middle'%3E%3C/text%3E%3C/svg%3E";
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
              登出
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
