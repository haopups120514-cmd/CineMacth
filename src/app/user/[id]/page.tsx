"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PageBackground from "@/components/PageBackground";

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  full_name: string;
  bio: string;
  role: string;
  equipment: string;
  styles: string[];
  avatar_url: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        if (fetchError) {
          setError("用户资料不存在");
          return;
        }

        if (data) {
          setProfile(data);
        }
      } catch (err) {
        setError("加载资料失败，请重试");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <PageBackground />
        <div className="relative z-10 text-white">加载中...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <PageBackground />
        <div className="relative z-10 text-center">
          <p className="text-white mb-4">{error || "用户资料不存在"}</p>
          <Link href="/crew" className="inline-flex items-center gap-2 text-[#5CC8D6] hover:text-[#7AD4DF]">
            <ChevronLeft className="h-4 w-4" />
            返回人才库
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            href="/crew"
            className="inline-flex items-center gap-2 text-[#5CC8D6] hover:text-[#7AD4DF] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            返回人才库
          </Link>
        </motion.div>

        {/* 用户信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
        >
          {/* 头像 */}
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center mb-8">
            <div className="w-24 h-24 rounded-2xl border border-[#5CC8D6]/30 bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-white mb-2">
                {profile.display_name}
              </h1>
              {profile.full_name && (
                <p className="text-sm text-neutral-400 mb-3">
                  全名：{profile.full_name}
                </p>
              )}
              {profile.role && (
                <div className="inline-block px-3 py-1 rounded-lg bg-[#5CC8D6]/20 text-[#5CC8D6] text-sm font-semibold">
                  {profile.role}
                </div>
              )}
            </div>
          </div>

          {/* 分隔线 */}
          <div className="h-px bg-white/10 my-6" />

          {/* 个人简介 */}
          {profile.bio && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-neutral-300 mb-2">
                个人简介
              </h2>
              <p className="text-base text-neutral-300 leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* 创作风格 */}
          {profile.styles && profile.styles.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-neutral-300 mb-3">
                创作风格
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.styles.map((style) => (
                  <span
                    key={style}
                    className="inline-block px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-sm"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 设备 */}
          {profile.equipment && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-neutral-300 mb-2">
                拥有的设备
              </h2>
              <p className="text-base text-neutral-300">
                {profile.equipment}
              </p>
            </div>
          )}

          {/* 联系提示 */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-neutral-400">
              💡 在人才库中查看或联系这位创作者
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
