"use client";

import Link from "next/link";
import { Shield, FileText, Megaphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { locale: language } = useLanguage();

  const labels = {
    zh: { privacy: "隐私政策", terms: "利用规约", announcements: "公告栏" },
    en: { privacy: "Privacy Policy", terms: "Terms of Service", announcements: "Announcements" },
    ja: { privacy: "プライバシーポリシー", terms: "利用規約", announcements: "お知らせ" },
  };

  const l = labels[language] || labels.ja;

  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* 链接行 */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
          <Link
            href="/privacy"
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-[#5CC8D6] transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            {l.privacy}
          </Link>
          <span className="text-neutral-700">|</span>
          <Link
            href="/terms"
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-[#5CC8D6] transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            {l.terms}
          </Link>
          <span className="text-neutral-700">|</span>
          <Link
            href="/announcements"
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-[#5CC8D6] transition-colors"
          >
            <Megaphone className="h-3.5 w-3.5" />
            {l.announcements}
          </Link>
        </div>

        {/* 版权行 */}
        <p className="text-center text-xs text-neutral-500">
          © 2026 CineMatch by Koko. All Rights Reserved.
        </p>
        <p className="text-center text-xs text-neutral-600 mt-1">
          Made with ❤️ in Tokyo.
        </p>
      </div>
    </footer>
  );
}
