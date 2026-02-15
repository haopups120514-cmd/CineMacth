"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Code,
  Heart,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import PageBackground from "@/components/PageBackground";
import { useLanguage } from "@/contexts/LanguageContext";

const techStack = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Supabase",
  "Vercel",
  "Framer Motion",
];

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        {/* ===== Section 1: 使命 ===== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* 小标签 */}
          <span className="inline-flex items-center gap-2 rounded-full border border-[#5CC8D6]/30 bg-[#5CC8D6]/10 px-4 py-1.5 text-xs text-[#5CC8D6]">
            <Heart className="h-3 w-3" />
            {t("aboutPage", "missionLabel")}
          </span>

          <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold leading-snug text-white md:text-5xl">
            {t("aboutPage", "missionTitle1")}
            <br />
            {t("aboutPage", "missionTitle2")} <span className="text-[#5CC8D6]">CineMatch</span>？
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
            {t("aboutPage", "missionP1")}
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
            {t("aboutPage", "missionP2")}
          </p>
        </motion.div>

        {/* 夜景图片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="mt-10 overflow-hidden rounded-2xl border border-white/10"
        >
          <div className="relative aspect-[21/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/user/photo-2.jpg"
              alt="东京街头"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </motion.div>

        {/* ===== Section 2: 开发者 ===== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="mt-24"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#5CC8D6]/30 bg-[#5CC8D6]/10 px-4 py-1.5 text-xs text-[#5CC8D6]">
            <Code className="h-3 w-3" />
            {t("aboutPage", "creatorLabel")}
          </span>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* 头像区域 */}
            <div className="shrink-0">
              <div className="relative h-32 w-32 sm:h-48 sm:w-48 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#5CC8D6]/20 to-[#0a0a0a]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-bold text-[#5CC8D6]/60">K</span>
                </div>
                {/* 替换为真实头像：
                <Image src="/images/avatar.jpg" alt="Koko" fill className="object-cover" /> */}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
                <MapPin className="h-3.5 w-3.5" />
                {t("aboutPage", "location")}
              </div>
            </div>

            {/* 文字介绍 */}
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white md:text-3xl">
                {t("aboutPage", "aboutKoko")} <span className="text-[#5CC8D6]">Koko</span>
                <span className="ml-2 text-base font-normal text-neutral-500">
                  (Hu Haoyu)
                </span>
              </h2>

              <p className="mt-4 text-base leading-relaxed text-neutral-400">
                {t("aboutPage", "kokoP1")}
              </p>
              <p className="mt-3 text-base leading-relaxed text-neutral-400">
                {t("aboutPage", "kokoP2")}<strong>{t("aboutPage", "kokoP2Bold")}</strong>{t("aboutPage", "kokoP2End")}
              </p>

              {/* INTP 标签 */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs text-purple-400">
                {t("aboutPage", "intp")}
              </div>

              {/* Tech Stack */}
              <div className="mt-8">
                <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-600">
                  Tech Stack
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===== Section 3: 视觉展示 ===== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="mt-24"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#5CC8D6]/30 bg-[#5CC8D6]/10 px-4 py-1.5 text-xs text-[#5CC8D6]">
            <Sparkles className="h-3 w-3" />
            {t("aboutPage", "visualsLabel")}
          </span>

          <h2 className="mt-6 text-xl sm:text-2xl font-extrabold text-white md:text-3xl">
            {t("aboutPage", "visualsTitle")}
          </h2>
          <p className="mt-3 text-base text-neutral-400">
            {t("aboutPage", "visualsDesc")}
          </p>

          {/* 照片墙 */}
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              "/images/user/photo-1.jpg",
              "/images/user/photo-3.jpg",
              "/images/user/photo-4.jpg",
              "/images/user/photo-5.jpg",
            ].map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className={`group relative overflow-hidden rounded-xl border border-white/10 ${
                  i === 0 ? "col-span-2 md:col-span-2" : ""
                }`}
              >
                <div className={`relative bg-neutral-900 ${i === 0 ? 'aspect-[16/9]' : 'aspect-[3/2]'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* 封面展示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-6 overflow-hidden rounded-2xl border border-white/10"
          >
            <div className="relative aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/user/photo-6.jpg"
                alt="创作集锦"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-sm font-medium text-white/80">{t("aboutPage", "gallery")}</p>
                <p className="mt-1 text-xs text-white/50">{t("aboutPage", "gallerySubtitle")}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ===== CTA ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-24 text-center"
        >
          <p className="text-lg text-neutral-400">
            {t("aboutPage", "ctaReady")}
          </p>
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/find-crew"
              className="group flex items-center gap-2 rounded-xl bg-[#5CC8D6] px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF]"
            >
              {t("aboutPage", "ctaRecruit")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              {t("aboutPage", "ctaJoin")}
            </Link>
          </div>
        </motion.div>

        {/* ===== Contact Section ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-24 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 text-center md:p-12"
        >
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {t("aboutPage", "contactTitle")}
          </h2>
          <p className="mt-3 text-base text-neutral-400">
            {t("aboutPage", "contactDesc")}
          </p>
          <a
            href="mailto:haopups120514@gmail.com"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#5CC8D6] px-8 py-3 text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF]"
          >
            <span>haopups120514@gmail.com</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>

        {/* 底部留白 */}
        <div className="h-16" />
      </div>
    </section>
  );
}
