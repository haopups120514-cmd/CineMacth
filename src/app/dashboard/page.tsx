"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  LogOut,
  User,
  ArrowRight,
  Users,
  Megaphone,
  Heart,
  MessageCircle,
  Shield,
  Upload
} from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageBackground from "@/components/PageBackground";

export default function DashboardPage() {
  const { user, session, signOut, loading, userProfile } = useContext(AuthContext);
  const { t } = useLanguage();
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
        <div className="relative z-10 text-white">{t("common", "loadingAlt")}</div>
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

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        {/* 头部欢迎区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white md:text-4xl">
                {t("dashboard", "welcome")}
              </h1>
              <p className="mt-2 text-lg text-neutral-400">
                {user?.email}
              </p>
            </div>
            {/* 头像显示 */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl border border-[#5CC8D6]/30 bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={userProfile?.avatar_url || `https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.id}`}
                alt={user?.email || t("common", "user")}
                className="w-full h-full object-cover"
              />
            </div>
            {/* 信用分 */}
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 flex-shrink-0">
              <Shield className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">{userProfile?.credit_score ?? 80}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              {t("common", "logout")}
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
                      <h3 className="font-semibold text-white">{t("dashboard", "profile")}</h3>
                      <p className="text-sm text-neutral-400">{t("dashboard", "profileDesc")}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-neutral-600 group-hover:text-[#5CC8D6] transition-colors" />
                </div>
              </div>
            </div>
          </Link>

          {/* 私信卡片 */}
          <Link href="/messages">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-[#0a0a0a] p-6 transition-all hover:border-purple-500/30 hover:bg-purple-500/5 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-transparent transition-all" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-500/20 p-3">
                      <MessageCircle className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{t("dashboard", "myMessages")}</h3>
                      <p className="text-sm text-neutral-400">{t("dashboard", "viewConversations")}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-neutral-600 group-hover:text-purple-400 transition-colors" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* 快速操作区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-8 backdrop-blur-sm"
        >
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">{t("dashboard", "whatNext")}</h2>
            <p className="mt-2 text-neutral-400">{t("dashboard", "exploreDesc")}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* 寻找创作伙伴 */}
            <Link href="/crew">
              <div className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-[#5CC8D6]/50 hover:bg-white/10 cursor-pointer">
                <div className="rounded-lg bg-[#5CC8D6]/20 p-3">
                  <Users className="h-5 w-5 text-[#5CC8D6]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{t("dashboard", "talentPool")}</h3>
                  <p className="text-sm text-neutral-400">{t("dashboard", "recruitPartner")}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-600 group-hover:text-[#5CC8D6] transition-colors" />
              </div>
            </Link>

            {/* 作品集 */}
            <Link href="/profile">
              <div className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-emerald-500/50 hover:bg-white/10 cursor-pointer">
                <div className="rounded-lg bg-emerald-500/20 p-3">
                  <Upload className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{t("dashboard", "portfolio")}</h3>
                  <p className="text-sm text-neutral-400">{t("dashboard", "uploadWorks")}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-600 group-hover:text-emerald-400 transition-colors" />
              </div>
            </Link>

            {/* 浏览项目 */}
            <Link href="/projects">
              <div className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-purple-500/50 hover:bg-white/10 cursor-pointer">
                <div className="rounded-lg bg-purple-500/20 p-3">
                  <Megaphone className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{t("dashboard", "opportunities")}</h3>
                  <p className="text-sm text-neutral-400">{t("dashboard", "joinPlans")}</p>
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
              <h3 className="font-semibold text-white">{t("dashboard", "mission")}</h3>
              <p className="mt-2 text-sm text-neutral-400">
                {t("dashboard", "missionDesc")}
              </p>
              <Link
                href="/about"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#5CC8D6] hover:text-[#7AD4DF] transition-colors"
              >
                {t("dashboard", "learnMore")} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
