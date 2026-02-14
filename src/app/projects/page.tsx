"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PageBackground from "@/components/PageBackground";
import ProjectCard from "@/components/ProjectCard";
import { mockProjects } from "@/data/mock-projects";
import type { CompensationType } from "@/types";

const compensationOptions: (CompensationType | "全部")[] = [
  "全部",
  "有薪",
  "包食宿",
  "互免",
  "可谈",
];

export default function ProjectsPage() {
  const [selectedComp, setSelectedComp] = useState<
    CompensationType | "全部"
  >("全部");

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
          通告板
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mt-3 text-lg text-neutral-400"
        >
          寻找你的下一个项目
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
              {opt}
            </button>
          ))}
        </motion.div>

        {/* 结果计数 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 text-sm text-neutral-500"
        >
          {filteredProjects.length} 个项目
        </motion.p>

        {/* 项目列表 */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="mt-4 flex flex-col gap-4"
        >
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </motion.div>

        {filteredProjects.length === 0 && (
          <div className="mt-16 text-center text-neutral-500">
            <p className="text-lg">没有找到符合条件的项目</p>
            <p className="mt-2 text-sm">试试选择其他报酬类型</p>
          </div>
        )}
      </div>
    </section>
  );
}
