"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Banknote,
  FileText,
  Users,
} from "lucide-react";
import PageBackground from "@/components/PageBackground";
import TagBadge from "@/components/TagBadge";
import { mockProjects } from "@/data/mock-projects";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslateEnum, TranslatedText } from "@/hooks/useTranslate";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const project = mockProjects.find((p) => p.id === id);
  const { t } = useLanguage();
  const te = useTranslateEnum();
  const [showToast, setShowToast] = useState(false);

  if (!project) {
    return (
      <section className="relative min-h-screen">
        <PageBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <p className="text-neutral-400">{t("projectDetail", "notFound")}</p>
        </div>
      </section>
    );
  }

  const formatDate = (d: string) => d.replace(/-/g, ".");
  const openPositions = project.positions.filter((p) => p.filled < p.count);

  const handleApply = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-12">
        {/* 返回 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("projectDetail", "backToBoard")}
          </Link>
        </motion.div>

        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white md:text-4xl">
              <TranslatedText text={project.title} />
            </h1>
            <TagBadge text={te(project.type)} variant="accent" />
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              {te(project.status)}
            </span>
          </div>
          <p className="mt-2 text-sm text-neutral-500">
            {t("projectDetail", "director")}{project.director} · {formatDate(project.createdAt)}{t("projectDetail", "posted")}
          </p>
        </motion.div>

        {/* 主布局 */}
        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* 左栏 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="flex-1"
          >
            {/* 项目简介 */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <h2 className="text-lg font-bold text-white">{t("projectDetail", "synopsis")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                <TranslatedText text={project.description} />
              </p>
            </div>

            {/* 剧本大纲 */}
            {project.synopsis && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#5CC8D6]" />
                  <h2 className="text-lg font-bold text-white">{t("projectDetail", "script")}</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                  <TranslatedText text={project.synopsis || ""} />
                </p>
              </div>
            )}

            {/* 拍摄信息 */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">{t("projectDetail", "shootDate")}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-white">
                  {formatDate(project.shootingDateStart)} -{" "}
                  {formatDate(project.shootingDateEnd)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs">{t("projectDetail", "shootLocation")}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-white">
                  <TranslatedText text={project.location} />
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Banknote className="h-4 w-4" />
                  <span className="text-xs">{t("projectDetail", "compensation")}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-white">
                  {te(project.compensation)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">{t("projectDetail", "projectType")}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-white">
                  {te(project.type)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* 右栏：招募职位 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-72 shrink-0"
          >
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-md">
              <h2 className="text-lg font-bold text-white">{t("projectDetail", "recruitRoles")}</h2>

              <div className="mt-4 flex flex-col gap-3">
                {project.positions.map((pos) => {
                  const isFull = pos.filled >= pos.count;
                  return (
                    <div
                      key={pos.title}
                      className="flex items-center justify-between"
                    >
                      <span
                        className={`text-sm ${
                          isFull
                            ? "text-neutral-600 line-through"
                            : "text-white"
                        }`}
                      >
                        <TranslatedText text={pos.title} />
                      </span>
                      <span
                        className={`text-xs ${
                          isFull ? "text-neutral-600" : "text-[#5CC8D6]"
                        }`}
                      >
                        {pos.filled}/{pos.count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {openPositions.length > 0 && (
                <p className="mt-3 text-xs text-neutral-500">
                  {t("projectDetail", "remaining").replace("{n}", String(openPositions.reduce((sum, p) => sum + (p.count - p.filled), 0)))}
                </p>
              )}

              {/* 标签 */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <TagBadge key={tag} text={te(tag)} variant="muted" />
                ))}
              </div>

              {/* 申请加入 */}
              <button
                onClick={handleApply}
                className="mt-6 w-full rounded-xl bg-[#5CC8D6] py-3 text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF] cursor-pointer"
              >
                {t("projectDetail", "applyJoin")}
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
            {t("projectDetail", "comingSoon")}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
