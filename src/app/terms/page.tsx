"use client";

import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import PageBackground from "@/components/PageBackground";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsPage() {
  const { locale: language } = useLanguage();

  const content = {
    zh: {
      title: "利用规约",
      subtitle: "使用本服务前请仔细阅读",
      back: "返回首页",
      sections: [
        {
          heading: "1. 禁止事项",
          body: "以下行为被禁止。违反者账户将被即时停用，不另行通知。\n・对他人的诽谤中伤、骚扰行为\n・发布违反公序良俗的内容\n・反复无故取消（放鸽子）",
        },
        {
          heading: "2. 内容权利",
          body: "用户上传的图片、视频、文字的著作权全部归投稿者本人所有。\n本服务仅在站内展示及推广目的范围内使用这些内容。",
        },
        {
          heading: "3. 服务变更・停止",
          body: "本服务由学生个人开发，因此可能未经预告变更或停止功能。",
        },
      ],
    },
    en: {
      title: "Terms of Service",
      subtitle: "Please read carefully before using this service",
      back: "Back to Home",
      sections: [
        {
          heading: "1. Prohibited Actions",
          body: "The following actions are prohibited. Violators will have their accounts suspended without notice.\n・Slander, defamation, or harassment toward others\n・Posting content that violates public order and morals\n・Repeated no-shows or last-minute cancellations",
        },
        {
          heading: "2. Content Rights",
          body: "Copyright for all images, videos, and text uploaded by users belongs entirely to the original poster.\nThis service may only use such content for display and promotion within the site.",
        },
        {
          heading: "3. Service Changes & Suspension",
          body: "This service is developed by an individual student and may change or suspend features without prior notice.",
        },
      ],
    },
    ja: {
      title: "利用規約",
      subtitle: "本サービスをご利用になる前にお読みください",
      back: "ホームに戻る",
      sections: [
        {
          heading: "1. 禁止事項",
          body: "以下の行為を禁止します。違反した場合、予告なくアカウントを停止します。\n・他者への誹謗中傷、ハラスメント行為\n・公序良俗に反するコンテンツの投稿\n・無断キャンセル（ドタキャン）の繰り返し",
        },
        {
          heading: "2. コンテンツの権利",
          body: "ユーザーが投稿した画像・動画・テキストの著作権は、すべて投稿者本人に帰属します。\n本サービスは、サイト内での表示・プロモーションの目的範囲内でのみこれを使用できるものとします。",
        },
        {
          heading: "3. サービスの変更・停止",
          body: "本サービスは学生による個人開発のため、予告なく機能を変更・停止する場合があります。",
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
            <FileText className="h-6 w-6 text-[#5CC8D6]" />
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
