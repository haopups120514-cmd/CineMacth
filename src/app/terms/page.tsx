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
          heading: "1. 适用范围",
          body: "本规约适用于与本服务使用相关的一切关系。",
        },
        {
          heading: "2. 禁止事项",
          body: "用户不得进行以下行为：\n\n・违反法律法规或公序良俗的行为\n・宗教劝诱、传销、垃圾信息行为\n・对其他用户的骚扰、诽谤中伤\n・对服务器施加过度负担的行为",
        },
        {
          heading: "3. 投稿数据的权利",
          body: "用户投稿的文章、图片、视频链接等的著作权归该用户所有。但本服务可在运营所需范围内（展示、缩放等）使用。",
        },
        {
          heading: "4. 免责声明",
          body: "・本服务为学生个人开发的Beta版。\n・对于因意外Bug导致的数据丢失或服务暂停，运营者不承担责任。\n・用户之间的纠纷（金钱、拍摄现场事故等）由当事人自行解决。",
        },
      ],
    },
    en: {
      title: "Terms of Service",
      subtitle: "Please read carefully before using this service",
      back: "Back to Home",
      sections: [
        {
          heading: "1. Scope of Application",
          body: "These terms apply to all matters related to the use of this service.",
        },
        {
          heading: "2. Prohibited Actions",
          body: "Users must not engage in the following:\n\n・Actions that violate laws or public order and morals\n・Religious solicitation, pyramid schemes, or spam\n・Harassment, slander, or defamation toward other users\n・Actions that place excessive load on servers",
        },
        {
          heading: "3. Rights to Posted Content",
          body: "Copyright for text, images, video links, etc. posted by users is retained by the respective user. However, this service may use such content within the scope necessary for site operations (display, resizing, etc.).",
        },
        {
          heading: "4. Disclaimer",
          body: "・This service is a beta version developed by an individual student.\n・The operator cannot be held responsible for data loss due to unexpected bugs or temporary service suspension.\n・Disputes between users (financial, on-set accidents, etc.) shall be resolved between the parties involved.",
        },
      ],
    },
    ja: {
      title: "利用規約",
      subtitle: "本サービスをご利用になる前にお読みください",
      back: "ホームに戻る",
      sections: [
        {
          heading: "1. 適用範囲",
          body: "本規約は、当サービスの利用に関する一切の関係に適用されます。",
        },
        {
          heading: "2. 禁止事項",
          body: "ユーザーは、以下の行為を行ってはなりません。\n\n・法令または公序良俗に反する行為\n・宗教勧誘、マルチ商法、スパム行為\n・他のユーザーへの嫌がらせ、誹謗中傷\n・サーバーに過度の負担をかける行為",
        },
        {
          heading: "3. 投稿データの権利",
          body: "ユーザーが投稿した文章、画像、動画リンク等の著作権は、当該ユーザーに留保されます。ただし、当サービスはこれをサイト運営に必要な範囲（表示、リサイズ等）で利用できるものとします。",
        },
        {
          heading: "4. 免責事項",
          body: "・当サービスは学生による個人開発のベータ版です。\n・予期せぬバグによるデータ消失や、サービスの一時停止について、運営者は責任を負いかねます。\n・ユーザー間のトラブル（金銭、撮影現場での事故等）は、当事者同士で解決するものとします。",
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
