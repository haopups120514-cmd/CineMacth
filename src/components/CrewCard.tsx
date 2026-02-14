"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { CrewMember } from "@/types";
import TagBadge from "./TagBadge";

interface CrewCardProps {
  crew: CrewMember;
}

export default function CrewCard({ crew }: CrewCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <Link
        href={`/find-crew/${crew.id}`}
        className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-[#5CC8D6]/30 hover:-translate-y-1"
      >
        {/* 封面图 */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={crew.coverImage}
            alt={crew.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* 职业标签 */}
          <div className="absolute top-3 right-3">
            <TagBadge text={crew.role} variant="accent" />
          </div>
        </div>

        {/* 信息区域 */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">{crew.name}</h3>
            <span className="text-xs text-neutral-500">{crew.location}</span>
          </div>

          <p className="mt-1 text-xs text-neutral-500">{crew.university}</p>

          <p className="mt-2 text-sm text-neutral-400 line-clamp-1">
            {crew.bio}
          </p>

          {/* 风格 */}
          <p className="mt-2 text-xs text-[#5CC8D6]">
            {crew.styles.join(" · ")}
          </p>

          {/* 标签 */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {crew.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag} text={tag} variant="muted" />
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
