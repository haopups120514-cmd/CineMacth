"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { mockCrew } from "@/data/mock-crew";

export default function CrewListPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#111318] to-[#050505]">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(92,200,214,0.08)_0%,transparent_70%)]" />

      {/* 内容 */}
      <div className="relative z-10">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sticky top-0 z-10 bg-black/40 backdrop-blur-md border-b border-white/10 px-6 py-4"
        >
          <h1 className="text-xl font-bold text-white">
            人才库
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {mockCrew.length} 位创作者
          </p>
        </motion.div>

        {/* 创作者列表 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="divide-y divide-white/5"
        >
          {mockCrew.map((member, index) => (
            <Link
              key={member.id}
              href={`/find-crew/${member.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors group"
            >
              {/* 头像 */}
              <img
                src={member.coverImage}
                alt={member.name}
                className="h-14 w-14 rounded-full object-cover flex-shrink-0"
              />

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white truncate">
                    {member.name}
                  </h3>
                  <span className="inline-block px-2 py-1 text-xs rounded bg-[#5CC8D6]/20 text-[#5CC8D6] flex-shrink-0">
                    {member.role}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500 truncate">
                  {member.bio}
                </p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {member.styles.slice(0, 2).map((style) => (
                    <span
                      key={style}
                      className="inline-block text-xs text-neutral-400 px-2 py-1 rounded border border-neutral-600"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              {/* 箭头 */}
              <ChevronRight className="h-5 w-5 text-neutral-600 flex-shrink-0 group-hover:text-white transition-colors" />
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
