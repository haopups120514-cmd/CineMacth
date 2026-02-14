"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  MapPin,
  Code,
  Film,
  Heart,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import PageBackground from "@/components/PageBackground";

const techStack = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Supabase",
  "Vercel",
  "Framer Motion",
];

export default function AboutPage() {
  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        {/* ===== Section 1: 使命 ===== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* 小标签 */}
          <span className="inline-flex items-center gap-2 rounded-full border border-[#5CC8D6]/30 bg-[#5CC8D6]/10 px-4 py-1.5 text-xs text-[#5CC8D6]">
            <Heart className="h-3 w-3" />
            The Mission
          </span>

          <h1 className="mt-6 text-3xl font-extrabold leading-snug text-white md:text-5xl">
            为什么东京的夜晚
            <br />
            需要 <span className="text-[#5CC8D6]">CineMatch</span>？
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
            在东京，有无数像我一样的留学生怀揣电影梦，却因为找不到录音师、灯光师而不得不放弃。
            从新宿到下北泽，从涩谷到吉祥寺，散落着太多孤独的创作者——他们有才华、有热情，却彼此看不见。
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
            <span className="text-white font-medium">CineMatch 致力于连接每一个孤独的创作者。</span>
            让一个有剧本的导演能找到愿意用周末时间来帮忙的摄影师；
            让一个刚买了 Sony FX3 的留学生能加入一个真正的剧组。
          </p>
        </motion.div>

        {/* 夜景图片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="mt-10 overflow-hidden rounded-2xl border border-white/10"
        >
          <div className="relative aspect-[21/9] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e]">
            {/* 用渐变模拟夜景氛围，等你替换真实照片 */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(92,200,214,0.15)_0%,transparent_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Film className="mx-auto h-10 w-10 text-[#5CC8D6]/40" />
                <p className="mt-3 text-sm text-neutral-600">
                  锦糸町街头 · iPhone 16 Pro
                </p>
                <p className="mt-1 text-xs text-neutral-700">
                  替换为你的夜景照片 → public/images/night-street.jpg
                </p>
              </div>
            </div>
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
            The Creator
          </span>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* 头像区域 */}
            <div className="shrink-0">
              <div className="relative h-48 w-48 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#5CC8D6]/20 to-[#0a0a0a]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-[#5CC8D6]/60">K</span>
                </div>
                {/* 替换为真实头像：
                <Image src="/images/avatar.jpg" alt="Koko" fill className="object-cover" /> */}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
                <MapPin className="h-3.5 w-3.5" />
                东京, 日本
              </div>
            </div>

            {/* 文字介绍 */}
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-white md:text-3xl">
                关于 <span className="text-[#5CC8D6]">Koko</span>
                <span className="ml-2 text-base font-normal text-neutral-500">
                  (Hu Haoyu)
                </span>
              </h2>

              <p className="mt-4 text-base leading-relaxed text-neutral-400">
                我是一名生活在东京的 00 后创作者。作为一个 INTP，
                我习惯用逻辑去解构世界，再用影像去重组它。
              </p>
              <p className="mt-3 text-base leading-relaxed text-neutral-400">
                我不满足于仅仅作为画面的记录者，
                我更希望成为<span className="text-white font-medium">连接者的构建者</span>。
                CineMatch 是我用代码对电影制作流程的一次重新思考——
                在繁华却疏离的东京，让每一个孤独的创意灵魂都能找到共鸣。
              </p>

              {/* INTP 标签 */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs text-purple-400">
                INTP · 分析者
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
            Visuals
          </span>

          <h2 className="mt-6 text-2xl font-extrabold text-white md:text-3xl">
            影像与代码的结合
          </h2>
          <p className="mt-3 text-base text-neutral-400">
            不只是写代码——每一帧画面，每一行代码，都是对美的追求。
          </p>

          {/* 照片墙 */}
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              { src: "/images/works-1.jpg", label: "冬 · 雪中电话亭" },
              { src: "/images/works-2.jpg", label: "日常 · 花盆里的秘密" },
              { src: "/images/works-3.jpg", label: "春 · 紫色花海" },
              { src: "/images/works-4.jpg", label: "秋 · 银杏公园" },
            ].map((photo, i) => (
              <motion.div
                key={photo.src}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className={`group relative overflow-hidden rounded-xl border border-white/10 ${
                  i === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <div
                  className={`relative ${
                    i === 0 ? "aspect-square md:aspect-[4/3]" : "aspect-square"
                  }`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.label}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <p className="absolute bottom-3 left-3 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {photo.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 视频占位 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          >
            <div className="relative aspect-video">
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#111318]">
                <Film className="h-12 w-12 text-[#5CC8D6]/30" />
                <p className="mt-3 text-sm text-neutral-600">
                  DJI Pocket 3 · 东京街拍 Vlog
                </p>
                <p className="mt-1 text-xs text-neutral-700">
                  嵌入你的视频链接
                </p>
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
            准备好开始了吗？
          </p>
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/find-crew"
              className="group flex items-center gap-2 rounded-xl bg-[#5CC8D6] px-8 py-3 text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF]"
            >
              招募创作伙伴
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              加入拍摄计划
            </Link>
          </div>
        </motion.div>

        {/* ===== Contact Section ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-24 rounded-2xl border border-white/10 bg-white/5 p-8 text-center md:p-12"
        >
          <h2 className="text-2xl font-extrabold text-white">
            联系我
          </h2>
          <p className="mt-3 text-base text-neutral-400">
            有任何想法或建议？欢迎直接发送邮件
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
