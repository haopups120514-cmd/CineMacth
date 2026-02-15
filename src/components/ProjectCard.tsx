"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Banknote } from "lucide-react";
import type { Project } from "@/types";
import TagBadge from "./TagBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAutoTranslate, useTranslateEnum, useAutoTranslateBatch } from "@/hooks/useTranslate";

interface ProjectCardProps {
  project: Project;
}

const compensationColors: Record<string, string> = {
  有薪: "text-green-400",
  包食宿: "text-blue-400",
  互免: "text-orange-400",
  可谈: "text-neutral-400",
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useLanguage();
  const te = useTranslateEnum();
  const translatedTitle = useAutoTranslate(project.title);
  const translatedDesc = useAutoTranslate(project.description);
  const translatedLocation = useAutoTranslate(project.location);
  const translatedPositionTitles = useAutoTranslateBatch(project.positions.map(p => p.title));
  const translatedTags = useAutoTranslateBatch(project.tags);

  const openPositions = project.positions.filter((p) => p.filled < p.count);
  const formatDate = (d: string) => d.replace(/-/g, ".");

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <Link
        href={`/projects/${project.id}`}
        className="group block rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-[#5CC8D6]/30 md:p-6"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          {/* 左侧：主要信息 */}
          <div className="flex-1 min-w-0">
            {/* 第一行：项目名 + 类型 + 状态 */}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-white">{translatedTitle}</h3>
              <TagBadge text={te(project.type)} variant="muted" />
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                {te(project.status)}
              </span>
            </div>

            {/* 第二行：简介 */}
            <p className="mt-2 text-sm text-neutral-400 line-clamp-2">
              {translatedDesc}
            </p>

            {/* 第三行：信息标签 */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(project.shootingDateStart)} -{" "}
                {formatDate(project.shootingDateEnd)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {translatedLocation}
              </span>
              <span
                className={`flex items-center gap-1.5 ${compensationColors[project.compensation]}`}
              >
                <Banknote className="h-3.5 w-3.5" />
                {te(project.compensation)}
              </span>
            </div>

            {/* 标签 */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.map((tag, index) => (
                <TagBadge key={tag} text={translatedTags[index] || tag} variant="muted" />
              ))}
            </div>
          </div>

          {/* 右侧：招募职位 */}
          <div className="flex flex-row flex-wrap gap-2 md:flex-col md:items-end md:gap-1.5 shrink-0">
            <span className="text-xs text-neutral-600 hidden md:block mb-1">
              {t("projectCard", "recruitRoles")}
            </span>
            {project.positions.map((pos, index) => {
              const isFull = pos.filled >= pos.count;
              return (
                <span
                  key={pos.title}
                  className={`text-xs ${
                    isFull
                      ? "text-neutral-600 line-through"
                      : "text-[#5CC8D6]"
                  }`}
                >
                  {translatedPositionTitles[index] || pos.title} {pos.filled}/{pos.count}
                </span>
              );
            })}
            {openPositions.length > 0 && (
              <span className="mt-1 text-xs text-neutral-600 hidden md:block">
                {t("projectCard", "remaining").replace("{n}", String(openPositions.length))}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
