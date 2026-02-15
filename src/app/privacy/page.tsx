"use client";

import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import PageBackground from "@/components/PageBackground";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
  const { locale: language } = useLanguage();

  const content = {
    zh: {
      title: "隐私政策",
      subtitle: "我们如何保护您的数据",
      back: "返回首页",
      sections: [
        {
          heading: "1. 收集的信息",
          body: "本服务（CineMatch）在用户注册时收集电子邮箱、昵称及头像等信息。",
        },
        {
          heading: "2. 使用目的",
          body: "收集的信息仅用于以下目的：\n・服务的提供（登录、匹配功能）\n・用户间的沟通（聊天）\n・来自运营方的重要通知",
        },
        {
          heading: "3. 向第三方提供",
          body: "除法律规定的情况外，未经用户同意不会向第三方提供个人信息。",
        },
        {
          heading: "4. 数据管理",
          body: "我们尽力确保安全，但请理解本服务为个人开发的测试版。",
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      subtitle: "How we protect your data",
      back: "Back to Home",
      sections: [
        {
          heading: "1. Information We Collect",
          body: "CineMatch collects your email address, nickname, and profile image during registration.",
        },
        {
          heading: "2. Purpose of Use",
          body: "Collected information is used solely for:\n・Providing services (login, matching)\n・User communication (chat)\n・Important announcements from the team",
        },
        {
          heading: "3. Disclosure to Third Parties",
          body: "We will not share your personal information with third parties without your consent, except as required by law.",
        },
        {
          heading: "4. Data Management",
          body: "We do our best to ensure security, but please understand this is a beta version developed by an individual.",
        },
      ],
    },
    ja: {
      title: "プライバシーポリシー",
      subtitle: "お客様のデータの保護について",
      back: "ホームに戻る",
      sections: [
        {
          heading: "1. 収集する情報",
          body: "本サービス（CineMatch）は、ユーザー登録時にメールアドレス、ニックネーム、およびプロフィール画像等の情報を収集します。",
        },
        {
          heading: "2. 利用目的",
          body: "収集した情報は、以下の目的のみに使用します。\n・サービスの提供（ログイン、マッチング機能）\n・ユーザー間のコミュニケーション（チャット）\n・運営からの重要なお知らせ",
        },
        {
          heading: "3. 第三者への提供",
          body: "法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。",
        },
        {
          heading: "4. データの管理",
          body: "セキュリティには万全を期していますが、個人開発のベータ版であることをご理解ください。",
        },
      ],
    },
  };

  const c = content[language] || content.ja;

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-[#5CC8D6] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {c.back}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-[#5CC8D6]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {c.title}
            </h1>
          </div>
          <p className="text-neutral-400 mb-10">{c.subtitle}</p>

          <div className="space-y-8">
            {c.sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <h2 className="text-lg font-bold text-white mb-3">
                  {section.heading}
                </h2>
                <p className="text-sm leading-relaxed text-neutral-400 whitespace-pre-line">
                  {section.body}
                </p>
              </motion.div>
            ))}
          </div>

          <p className="mt-10 text-xs text-neutral-600 text-center">
            © 2026 CineMatch by Koko. All Rights Reserved.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
