"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Shield, Users } from "lucide-react";
import { mockCrew } from "@/data/mock-crew";
import { fetchAllProfiles, getDisplayName, getAvatarUrl, type DbProfile } from "@/lib/database";

export default function CrewListPage() {
  const [realUsers, setRealUsers] = useState<DbProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const load = async () => {
      const profiles = await fetchAllProfiles();
      setRealUsers(profiles);
      setLoadingUsers(false);
    };
    load();
  }, []);

  const totalCount = realUsers.length + mockCrew.length;

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
          className="sticky top-16 z-10 bg-black/40 backdrop-blur-md border-b border-white/10 px-6 py-4"
        >
          <h1 className="text-xl font-bold text-white">
            人才库
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {loadingUsers ? "加载中..." : `${totalCount} 位创作者`}
            {realUsers.length > 0 && (
              <span className="ml-2 text-emerald-400">
                · {realUsers.length} 位已注册
              </span>
            )}
          </p>
        </motion.div>

        {/* 真实注册用户 */}
        {realUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 px-6 pt-4 pb-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">注册用户</span>
              <Users className="h-3 w-3 text-emerald-400" />
            </div>
            <div className="divide-y divide-white/5">
              {realUsers.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/find-crew/${profile.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-emerald-500/5 transition-colors group border-l-2 border-emerald-500/30"
                >
                  {/* 头像 */}
                  <img
                    src={getAvatarUrl(profile)}
                    alt={getDisplayName(profile)}
                    className="h-14 w-14 rounded-full object-cover flex-shrink-0 bg-neutral-800"
                  />

                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white truncate">
                        {getDisplayName(profile)}
                      </h3>
                      {profile.role && (
                        <span className="inline-block px-2 py-1 text-xs rounded bg-[#5CC8D6]/20 text-[#5CC8D6] flex-shrink-0">
                          {profile.role}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-amber-400" />
                        <span className="text-xs text-amber-400">{profile.credit_score ?? 80}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500 truncate">
                      {profile.bio || "这个人很懒，什么都没写"}
                    </p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {(profile.styles || []).slice(0, 2).map((style) => (
                        <span
                          key={style}
                          className="inline-block text-xs text-neutral-400 px-2 py-1 rounded border border-neutral-600"
                        >
                          {style}
                        </span>
                      ))}
                      {profile.location && (
                        <span className="inline-block text-xs text-neutral-500 px-2 py-1">
                          📍 {profile.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 箭头 */}
                  <ChevronRight className="h-5 w-5 text-neutral-600 flex-shrink-0 group-hover:text-white transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* 分割线 */}
        {realUsers.length > 0 && (
          <div className="flex items-center gap-4 px-6 py-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-neutral-600">示例创作者</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        )}

        {/* 示例创作者列表 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="divide-y divide-white/5"
        >
          {mockCrew.map((member) => (
            <Link
              key={member.id}
              href={`/find-crew/${member.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors group"
            >
              {/* 头像 */}
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="h-14 w-14 rounded-full object-cover flex-shrink-0 bg-neutral-800"
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
