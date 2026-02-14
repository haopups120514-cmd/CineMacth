"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Shield } from "lucide-react";
import PageBackground from "@/components/PageBackground";
import FilterBar from "@/components/FilterBar";
import CrewCard from "@/components/CrewCard";
import { mockCrew } from "@/data/mock-crew";
import { fetchAllProfiles, getDisplayName, getAvatarUrl, type DbProfile } from "@/lib/database";
import type { CrewFilters, CrewMember, VisualStyle, Equipment, CrewRole } from "@/types";

// 将数据库用户资料转为 CrewMember 兼容格式
function profileToCrewMember(p: DbProfile): CrewMember {
  const roleMap: Record<string, CrewRole> = {
    "摄影师": "摄影",
    "灯光师": "灯光",
    "美术师": "美术",
    "录音师": "录音",
  };
  const role = roleMap[p.role || ""] || "摄影";

  return {
    id: p.id,
    name: getDisplayName(p),
    nameReading: "",
    role,
    styles: (p.styles || []) as VisualStyle[],
    equipment: p.equipment ? p.equipment.split(",").map(s => s.trim()) as Equipment[] : [],
    tags: [
      p.location ? `#${p.location}` : "",
      p.university ? `#${p.university}` : "",
    ].filter(Boolean),
    coverImage: "",
    avatarUrl: getAvatarUrl(p),
    location: p.location || "未设置",
    university: p.university || "未设置",
    bio: p.bio || "这个人很懒，什么都没写",
    works: [],
    creditScore: {
      overall: p.credit_score ?? 80,
      punctuality: 80,
      professionalism: 80,
      skill: 80,
      communication: 80,
      reliability: 80,
      totalProjects: 0,
      totalReviews: 0,
      reviews: [],
    },
  };
}

export default function FindCrewPage() {
  const [filters, setFilters] = useState<CrewFilters>({
    role: null,
    style: null,
    equipment: null,
  });
  const [realUsers, setRealUsers] = useState<CrewMember[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // 加载真实用户
  useEffect(() => {
    const load = async () => {
      const profiles = await fetchAllProfiles();
      setRealUsers(profiles.map(profileToCrewMember));
      setLoadingUsers(false);
    };
    load();
  }, []);

  // 合并：真实用户（优先）+ 示例数据
  const allCrew = useMemo(() => {
    return [...realUsers, ...mockCrew];
  }, [realUsers]);

  const filteredCrew = useMemo(() => {
    return allCrew.filter((c) => {
      if (filters.role && c.role !== filters.role) return false;
      if (filters.style && !c.styles.includes(filters.style)) return false;
      if (filters.equipment && !c.equipment.includes(filters.equipment))
        return false;
      return true;
    });
  }, [filters, allCrew]);

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        {/* 标题 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl font-extrabold text-white md:text-5xl"
        >
          招募创作伙伴
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mt-3 text-lg text-neutral-400"
        >
          找到适合你项目的创作伙伴
          {realUsers.length > 0 && (
            <span className="ml-2 text-[#5CC8D6]">
              · {realUsers.length} 位真实用户已注册
            </span>
          )}
        </motion.p>

        {/* 筛选栏 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-8"
        >
          <FilterBar filters={filters} onChange={setFilters} />
        </motion.div>

        {/* 结果计数 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 text-sm text-neutral-500"
        >
          {loadingUsers ? "加载中..." : `找到 ${filteredCrew.length} 位创作者`}
        </motion.p>

        {/* 真实用户区域 */}
        {realUsers.length > 0 && !filters.role && !filters.style && !filters.equipment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-emerald-400">注册用户</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {realUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/find-crew/${user.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-12 w-12 rounded-full bg-neutral-800 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white truncate">{user.name}</h3>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#5CC8D6]/20 text-[#5CC8D6]">
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="h-3 w-3 text-amber-400" />
                      <span className="text-xs text-amber-400">{user.creditScore.overall}分</span>
                      {user.location !== "未设置" && (
                        <>
                          <MapPin className="h-3 w-3 text-neutral-500" />
                          <span className="text-xs text-neutral-500">{user.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 分割线 */}
            <div className="mt-8 mb-2 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-neutral-500">示例创作者</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </motion.div>
        )}

        {/* 卡片网格（示例 + 真实用户） */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {(filters.role || filters.style || filters.equipment
            ? filteredCrew
            : mockCrew
          ).map((crew) => (
            <CrewCard key={crew.id} crew={crew} />
          ))}
        </motion.div>

        {filteredCrew.length === 0 && !loadingUsers && (
          <div className="mt-16 text-center text-neutral-500">
            <p className="text-lg">没有找到符合条件的创作者</p>
            <p className="mt-2 text-sm">试试调整筛选条件</p>
          </div>
        )}
      </div>
    </section>
  );
}
