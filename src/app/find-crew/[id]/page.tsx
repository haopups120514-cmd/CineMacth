"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, MapPin, GraduationCap, Wrench } from "lucide-react";
import PageBackground from "@/components/PageBackground";
import TagBadge from "@/components/TagBadge";
import { mockCrew } from "@/data/mock-crew";

export default function CrewDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const crew = mockCrew.find((c) => c.id === id);
  const [showToast, setShowToast] = useState(false);

  if (!crew) {
    return (
      <section className="relative min-h-screen">
        <PageBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <p className="text-neutral-400">未找到该创作者</p>
        </div>
      </section>
    );
  }

  const handleInvite = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        {/* 返回 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/find-crew"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回人才库
          </Link>
        </motion.div>

        {/* 主布局 */}
        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* 左栏 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1"
          >
            {/* Showreel */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <div className="relative aspect-video">
                <Image
                  src={crew.coverImage}
                  alt={`${crew.name} showreel`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <Play className="h-7 w-7 text-white ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-sm font-medium text-neutral-400">
                  Showreel
                </h2>
              </div>
            </div>

            {/* 作品集 */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white">作品集</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {crew.works.map((work) => (
                  <div
                    key={work.title}
                    className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={work.coverImage}
                        alt={work.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-white">
                        {work.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {work.year} · {work.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 右栏：个人信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="w-full lg:w-80 shrink-0"
          >
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              {/* 名字 */}
              <h1 className="text-2xl font-bold text-white">{crew.name}</h1>
              <p className="mt-1 text-xs text-neutral-500">
                {crew.nameReading}
              </p>

              {/* 职业 */}
              <div className="mt-4">
                <TagBadge text={crew.role} variant="accent" />
              </div>

              {/* 学校 */}
              <div className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
                <GraduationCap className="h-4 w-4 text-neutral-500" />
                {crew.university}
              </div>

              {/* 地点 */}
              <div className="mt-2 flex items-center gap-2 text-sm text-neutral-400">
                <MapPin className="h-4 w-4 text-neutral-500" />
                {crew.location}
              </div>

              {/* Bio */}
              <p className="mt-4 text-sm text-neutral-300">{crew.bio}</p>

              {/* 风格 */}
              <div className="mt-4">
                <p className="text-xs text-neutral-500 mb-2">风格</p>
                <div className="flex flex-wrap gap-1.5">
                  {crew.styles.map((s) => (
                    <TagBadge key={s} text={s} variant="accent" />
                  ))}
                </div>
              </div>

              {/* 设备 */}
              {crew.equipment.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-neutral-500 mb-2">设备</p>
                  <div className="flex flex-wrap gap-1.5">
                    {crew.equipment.map((e) => (
                      <span
                        key={e}
                        className="flex items-center gap-1 text-xs text-neutral-400"
                      >
                        <Wrench className="h-3 w-3" />
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 标签 */}
              <div className="mt-4">
                <div className="flex flex-wrap gap-1.5">
                  {crew.tags.map((tag) => (
                    <TagBadge key={tag} text={tag} variant="muted" />
                  ))}
                </div>
              </div>

              {/* 邀请合作按钮 */}
              <button
                onClick={handleInvite}
                className="mt-6 w-full rounded-xl bg-[#5CC8D6] py-3 text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF] cursor-pointer"
              >
                邀请合作
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50 rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-sm text-white backdrop-blur-md"
          >
            功能开发中，敬请期待
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
