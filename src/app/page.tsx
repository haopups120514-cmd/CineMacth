"use client";

import { useContext, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Megaphone, Upload, Shield, MessageCircle } from "lucide-react";
import Link from "next/link";
import { AuthContext } from "@/contexts/AuthContext";
import PortfolioUpload from "@/components/PortfolioUpload";
import { fetchUserPortfolios, type DbPortfolio } from "@/lib/database";

export default function Home() {
  const { user, session, userProfile } = useContext(AuthContext);
  const [portfolios, setPortfolios] = useState<DbPortfolio[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(false);

  const loadPortfolios = useCallback(async () => {
    if (!user) return;
    setLoadingPortfolios(true);
    const items = await fetchUserPortfolios(user.id);
    setPortfolios(items);
    setLoadingPortfolios(false);
  }, [user]);

  useEffect(() => {
    if (user) loadPortfolios();
  }, [user, loadPortfolios]);

  return (
    <div>
      {/* Hero 区域 */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* 背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111318] to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(92,200,214,0.12)_0%,transparent_70%)]" />

        {/* 内容 */}
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          >
            找到你的
            <br />
            <span className="text-[#5CC8D6]">创作伙伴</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-6 max-w-xl text-lg text-neutral-400 sm:text-xl md:mt-8 md:text-2xl"
          >
            连接东京学生电影创作者的平台
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6 md:mt-14"
          >
            <Link href="/find-crew" className="group flex items-center gap-3 rounded-xl bg-[#5CC8D6] px-8 py-4 text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF] hover:shadow-lg hover:shadow-[#5CC8D6]/25">
              <Users className="h-5 w-5 transition-transform group-hover:scale-110" />
              招募创作伙伴
            </Link>

            <Link href="/projects" className="group flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/25">
              <Megaphone className="h-5 w-5 transition-transform group-hover:scale-110" />
              加入拍摄计划
            </Link>
          </motion.div>

          {/* 登录后显示快捷入口 */}
          {session && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="mt-8 flex items-center gap-4"
            >
              <Link
                href="/messages"
                className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:bg-white/10 transition-all"
              >
                <MessageCircle className="h-4 w-4 text-[#5CC8D6]" />
                我的私信
              </Link>
              <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm text-neutral-300">
                <Shield className="h-4 w-4 text-amber-400" />
                信用分 {userProfile?.credit_score ?? 80}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* 作品集上传区域 - 登录后显示 */}
      {session && user && (
        <section className="relative bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(92,200,214,0.06)_0%,transparent_60%)]" />

          <div className="relative z-10 mx-auto max-w-5xl px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-white">我的作品集</h2>
                  <p className="mt-2 text-neutral-400">
                    上传你的影视作品，让更多创作者看到你的才华
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
                  <Upload className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400">{portfolios.length} 部作品</span>
                </div>
              </div>

              <PortfolioUpload
                portfolios={portfolios}
                onUpdate={loadPortfolios}
              />
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
