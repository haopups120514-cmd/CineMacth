"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  LogOut,
  User,
  Zap,
  ArrowRight,
  Users,
  Megaphone,
  Heart
} from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
import PageBackground from "@/components/PageBackground";

export default function DashboardPage() {
  const { user, session, signOut, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
    }
  }, [session, loading, router]);

  if (loading || !session) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <PageBackground />
        <div className="relative z-10 text-white">Loading...</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        {/* 头部欢迎区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-white md:text-4xl">
                欢迎回来！
              </h1>
              <p className="mt-2 text-lg text-neutral-400">
                {user?.email}
              </p>
            </div>
            {/* 头像显示 */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-[#5CC8D6]/30 bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                alt={user?.email || "用户"}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              登出
            </button>
          </div>
        </motion.div>

        {/* 快速导航卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-12"
        >
          {/* 个人资料卡片 */}
          <Link href="/profile">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#5CC8D6]/10 to-[#0a0a0a] p-6 transition-all hover:border-[#5CC8D6]/30 hover:bg-[#5CC8D6]/5 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5CC8D6]/0 to-[#5CC8D6]/0 group-hover:from-[#5CC8D6]/5 group-hover:to-transparent transition-all" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#5CC8D6]/20 p-3">
                      <User className="h-6 w-6 text-[#5CC8D6]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">个人资料</h3>
                      <p className="text-sm text-neutral-400">编辑你的个人信息</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-neutral-600 group-hover:text-[#5CC8D6] transition-colors" />
                </div>
              </div>
            </div>
          </Link>

          {/* 我的活动卡片 */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-[#0a0a0a] p-6 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-transparent transition-all" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/20 p-3">
                    <Zap className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">我的活动</h3>
                    <p className="text-sm text-neutral-400">敬请期待</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 快速操作区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-white">接下来做什么?</h2>
            <p className="mt-2 text-neutral-400">探索 CineMatch 的各个部分</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* 寻找创作伙伴 */}
            <Link href="/crew">
              <div className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-[#5CC8D6]/50 hover:bg-white/10 cursor-pointer">
                <div className="rounded-lg bg-[#5CC8D6]/20 p-3">
                  <Users className="h-5 w-5 text-[#5CC8D6]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">人才库</h3>
                  <p className="text-sm text-neutral-400">招募创作伙伴</p>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-600 group-hover:text-[#5CC8D6] transition-colors" />
              </div>
            </Link>

            {/* 浏览项目 */}
            <Link href="/projects">
              <div className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-purple-500/50 hover:bg-white/10 cursor-pointer">
                <div className="rounded-lg bg-purple-500/20 p-3">
                  <Megaphone className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">机会广场</h3>
                  <p className="text-sm text-neutral-400">加入拍摄计划</p>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-600 group-hover:text-purple-400 transition-colors" />
              </div>
            </Link>
          </div>
        </motion.div>

        {/* 关于平台 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 rounded-2xl border border-white/10 bg-[#5CC8D6]/5 p-6"
        >
          <div className="flex items-start gap-4">
            <Heart className="h-5 w-5 text-[#5CC8D6] flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-white">CineMatch 使命</h3>
              <p className="mt-2 text-sm text-neutral-400">
                连接东京的孤独创作者，让每一个有梦想的电影人都能找到共鸣。
              </p>
              <Link
                href="/about"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#5CC8D6] hover:text-[#7AD4DF] transition-colors"
              >
                了解更多 <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
