"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PageBackground from "@/components/PageBackground";
import FilterBar from "@/components/FilterBar";
import CrewCard from "@/components/CrewCard";
import { mockCrew } from "@/data/mock-crew";
import type { CrewFilters } from "@/types";

export default function FindCrewPage() {
  const [filters, setFilters] = useState<CrewFilters>({
    role: null,
    style: null,
    equipment: null,
  });

  const filteredCrew = useMemo(() => {
    return mockCrew.filter((c) => {
      if (filters.role && c.role !== filters.role) return false;
      if (filters.style && !c.styles.includes(filters.style)) return false;
      if (filters.equipment && !c.equipment.includes(filters.equipment))
        return false;
      return true;
    });
  }, [filters]);

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
          人才库
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mt-3 text-lg text-neutral-400"
        >
          找到适合你项目的创作伙伴
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
          找到 {filteredCrew.length} 位创作者
        </motion.p>

        {/* 卡片网格 */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredCrew.map((crew) => (
            <CrewCard key={crew.id} crew={crew} />
          ))}
        </motion.div>

        {filteredCrew.length === 0 && (
          <div className="mt-16 text-center text-neutral-500">
            <p className="text-lg">没有找到符合条件的创作者</p>
            <p className="mt-2 text-sm">试试调整筛选条件</p>
          </div>
        )}
      </div>
    </section>
  );
}
