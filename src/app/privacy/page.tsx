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
      date: "制定日: 2026年2月15日",
      sections: [
        {
          heading: "1. 基本方针",
          body: "CineMatch（以下简称「本服务」）重视个人信息保护，遵守日本《个人信息保护法》。",
        },
        {
          heading: "2. 收集的信息",
          body: "用户信息: 通过Google登录等方式提供的电子邮箱、姓名、头像。\n\n设备信息: 为改善服务而记录的访问日志（IP地址、浏览器类型）。",
        },
        {
          heading: "3. 数据使用目的",
          body: "・用户身份验证（认证）\n・防止和应对非法使用\n・服务的维护与改善",
        },
        {
          heading: "4. 外部服务的使用",
          body: "本服务使用以下第三方服务进行数据存储和认证：\n\n・Supabase: 数据库及认证基础设施\n・Vercel: 托管服务器\n\n这些服务均根据各自的隐私政策进行严格管理。",
        },
        {
          heading: "5. 关于Cookie",
          body: "本服务使用Cookie来维持登录状态。您可以在浏览器设置中禁用Cookie，但部分功能可能无法使用。",
        },
        {
          heading: "6. 联系方式",
          body: "如有隐私相关问题，请通过运营者的X（原Twitter）私信联系。",
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      subtitle: "How we protect your data",
      back: "Back to Home",
      date: "Established: February 15, 2026",
      sections: [
        {
          heading: "1. Basic Policy",
          body: 'CineMatch (hereinafter referred to as "this service") values the protection of personal information and complies with Japan\'s Act on the Protection of Personal Information.',
        },
        {
          heading: "2. Information We Collect",
          body: "User Information: Email address, name, and profile image provided through Google login, etc.\n\nDevice Information: Access logs (IP address, browser type) collected for service improvement.",
        },
        {
          heading: "3. Purpose of Data Use",
          body: "・User identity verification (authentication)\n・Prevention and response to unauthorized use\n・Service maintenance and improvement",
        },
        {
          heading: "4. Use of External Services",
          body: "This service uses the following third-party services for data storage and authentication:\n\n・Supabase: Database and authentication infrastructure\n・Vercel: Hosting server\n\nThese services are strictly managed according to their respective privacy policies.",
        },
        {
          heading: "5. About Cookies",
          body: "We use cookies to maintain your login status. You can disable cookies in your browser settings, but some features may become unavailable.",
        },
        {
          heading: "6. Contact",
          body: "For privacy-related inquiries, please contact the operator via X (formerly Twitter) DM.",
        },
      ],
    },
    ja: {
      title: "プライバシーポリシー",
      subtitle: "お客様のデータの保護について",
      back: "ホームに戻る",
      date: "制定日: 2026年2月15日",
      sections: [
        {
          heading: "1. 基本方針",
          body: "CineMatch（以下、「当サービス」）は、個人情報の保護を重要視し、日本の個人情報保護法を遵守します。",
        },
        {
          heading: "2. 収集する情報",
          body: "ユーザー情報: Googleログイン等を通じて提供されるメールアドレス、名前、プロフィール画像。\n\n端末情報: サービス改善のためのアクセスログ（IPアドレス、ブラウザの種類）。",
        },
        {
          heading: "3. データの利用目的",
          body: "・ユーザーの本人確認（認証）のため\n・不正利用の防止および対応のため\n・サービスの維持・改善のため",
        },
        {
          heading: "4. 外部サービスの利用",
          body: "当サービスは、データの保存および認証機能のために以下の第三者サービスを利用しています。\n\n・Supabase: データベースおよび認証基盤\n・Vercel: ホスティングサーバー\n\nこれらのサービスは、それぞれのプライバシーポリシーに基づいて厳重に管理されています。",
        },
        {
          heading: "5. Cookie（クッキー）について",
          body: "ログイン状態の保持のためにCookieを使用しています。ブラウザの設定で無効にすることも可能ですが、その場合サービスの一部が利用できなくなります。",
        },
        {
          heading: "6. お問い合わせ",
          body: "プライバシーに関するお問い合わせは、運営者のX（旧Twitter）DMまでご連絡ください。",
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

          <p className="mt-10 text-xs text-neutral-500 text-center">
            {c.date}
          </p>
          <p className="mt-2 text-xs text-neutral-600 text-center">
            © 2026 CineMatch by Koko. All Rights Reserved.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
