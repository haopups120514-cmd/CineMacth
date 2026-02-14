"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Megaphone } from "lucide-react";
import Link from "next/link";
import { AuthContext } from "@/contexts/AuthContext";

export default function Home() {
  const { session, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      router.push("/dashboard");
    }
  }, [session, loading, router]);

  if (loading || session) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-white">Redirecting...</div>
      </div>
    );
  }

  return (
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
      </div>
    </section>
  );
}
