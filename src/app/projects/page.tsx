"use client";

import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  MapPin,
  Calendar,
  Briefcase,
  User,
  Loader2,
  Trash2,
} from "lucide-react";
import PageBackground from "@/components/PageBackground";
import ProjectCard from "@/components/ProjectCard";
import { mockProjects } from "@/data/mock-projects";
import {
  fetchRecruitments,
  deleteRecruitment,
  getDisplayName,
  getAvatarUrl,
  formatRelativeTime,
  type DbRecruitment,
  type DbProfile,
} from "@/lib/database";
import { AuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CompensationType } from "@/types";

const compensationOptions: (CompensationType | "全部")[] = [
  "全部",
  "有薪",
  "包食宿",
  "互免",
  "可谈",
];

export default function ProjectsPage() {
  const { user, session } = useContext(AuthContext);
  const { t } = useLanguage();
  const compLabel: Record<string, string> = {
    "全部": t("projects", "all"),
    "有薪": t("home", "compPaid"),
    "包食宿": t("home", "compAccom"),
    "互免": t("home", "compExchange"),
    "可谈": t("home", "compNegotiable"),
  };
  const [selectedComp, setSelectedComp] = useState<
    CompensationType | "全部"
  >("全部");

  // 招聘信息
  const [recruitments, setRecruitments] = useState<(DbRecruitment & { poster?: DbProfile })[]>([]);
  const [loadingRecruitments, setLoadingRecruitments] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRecruitments = useCallback(async () => {
    setLoadingRecruitments(true);
    const data = await fetchRecruitments();
    setRecruitments(data);
    setLoadingRecruitments(false);
  }, []);

  useEffect(() => {
    loadRecruitments();
  }, [loadRecruitments]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const ok = await deleteRecruitment(id);
    if (ok) loadRecruitments();
    setDeletingId(null);
  };

  // 筛选招聘信息
  const filteredRecruitments = useMemo(() => {
    if (selectedComp === "全部") return recruitments;
    return recruitments.filter((r) => r.compensation === selectedComp);
  }, [selectedComp, recruitments]);

  // 筛选 mock 项目
  const filteredProjects = useMemo(() => {
    if (selectedComp === "全部") return mockProjects;
    return mockProjects.filter((p) => p.compensation === selectedComp);
  }, [selectedComp]);

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {/* 标题 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl font-extrabold text-white md:text-5xl"
        >
          {t("projects", "title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mt-3 text-lg text-neutral-400"
        >
          {t("projects", "subtitle")}
        </motion.p>

        {/* 筛选 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-8 flex flex-wrap gap-2"
        >
          {compensationOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelectedComp(opt)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                selectedComp === opt
                  ? "border-[#5CC8D6]/50 bg-[#5CC8D6]/20 text-[#5CC8D6]"
                  : "border-white/15 bg-white/5 text-neutral-400 hover:border-white/25 hover:text-neutral-300"
              }`}
            >
              {compLabel[opt] || opt}
            </button>
          ))}
        </motion.div>

        {/* ========== 招聘信息区 ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="h-5 w-5 text-[#5CC8D6]" />
            <h2 className="text-xl font-bold text-white">{t("projects", "recruitmentSection")}</h2>
            <span className="text-sm text-neutral-500">
              {loadingRecruitments ? "..." : `${filteredRecruitments.length}${t("projects", "count")}`}
            </span>
          </div>

          {loadingRecruitments ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 rounded-full border-2 border-[#5CC8D6] border-t-transparent animate-spin" />
              <p className="mt-2 text-neutral-500 text-sm">{t("common", "loading")}</p>
            </div>
          ) : filteredRecruitments.length === 0 ? (
            <div className="text-center py-10 rounded-xl border border-dashed border-white/10">
              <Briefcase className="mx-auto h-8 w-8 text-neutral-600" />
              <p className="mt-2 text-neutral-500 text-sm">{t("projects", "noRecruitments")}</p>
              <Link
                href="/"
                className="mt-3 inline-block text-sm text-[#5CC8D6] hover:text-[#7AD4DF]"
              >
                {t("projects", "goPostRecruitment")}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecruitments.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:border-white/20 transition-all backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* 标题行 */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-base font-semibold text-white">
                          {item.title}
                        </h3>
                        <span className="rounded-md bg-[#5CC8D6]/15 px-2 py-0.5 text-xs font-medium text-[#5CC8D6]">
                          {item.status}
                        </span>
                      </div>

                      {/* 标签信息 */}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {item.role_needed}
                        </span>
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </span>
                        )}
                        {item.shoot_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.shoot_date}
                          </span>
                        )}
                        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-400">
                          {item.compensation}
                        </span>
                      </div>

                      {/* 描述 */}
                      {item.description && (
                        <p className="mt-2 text-sm text-neutral-400 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* 发布者 */}
                      <div className="mt-3 flex items-center gap-2">
                        <img
                          src={item.poster ? getAvatarUrl(item.poster) : `https://api.dicebear.com/9.x/adventurer/svg?seed=${item.user_id}`}
                          alt=""
                          className="h-5 w-5 rounded-full bg-neutral-800"
                        />
                        <span className="text-xs text-neutral-500">
                          {item.poster ? getDisplayName(item.poster) : t("common", "unknownUser")}
                        </span>
                        <span className="text-xs text-neutral-600">·</span>
                        <span className="text-xs text-neutral-600">
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* 操作区 */}
                    <div className="flex items-center gap-2 shrink-0">
                      {session && user?.id !== item.user_id && (
                        <Link
                          href={`/find-crew/${item.user_id}`}
                          className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/10 transition-all flex items-center gap-1"
                        >
                          <User className="h-3 w-3" />
                          {t("common", "contact")}
                        </Link>
                      )}
                      {user?.id === item.user_id && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="rounded-lg bg-red-500/10 border border-red-500/20 p-1.5 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ========== 示例项目区 ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-xl font-bold text-white mb-1">{t("projects", "sampleProjects")}</h2>
          <p className="text-sm text-neutral-500 mb-4">
            {filteredProjects.length}{t("projects", "projectCount")}
          </p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="flex flex-col gap-4"
          >
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </motion.div>
        </motion.div>

        {filteredRecruitments.length === 0 && filteredProjects.length === 0 && (
          <div className="mt-16 text-center text-neutral-500">
            <p className="text-lg">{t("projects", "noProjects")}</p>
            <p className="mt-2 text-sm">{t("projects", "tryOther")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
