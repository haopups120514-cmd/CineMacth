"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "人才库", href: "/find-crew" },
  { label: "机会广场", href: "/projects" },
  { label: "关于", href: "/about" },
];

export default function Navbar() {
  const { user, loading, signOut } = useAuth();

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
            <span className="text-sm text-[#5CC8D6]">
              {user.email?.split("@")[0]}
            </span>
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
