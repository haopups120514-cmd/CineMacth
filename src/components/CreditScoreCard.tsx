"use client";

import { motion } from "framer-motion";
import { Star, Shield, MessageSquare } from "lucide-react";
import type { CreditScore } from "@/types";

interface CreditScoreCardProps {
  score: CreditScore;
  name: string;
}

// 根据分数返回等级和颜色
function getScoreLevel(score: number) {
  if (score >= 95) return { label: "极好", color: "#22c55e", bg: "from-emerald-500/20 to-emerald-500/5" };
  if (score >= 90) return { label: "优秀", color: "#5CC8D6", bg: "from-[#5CC8D6]/20 to-[#5CC8D6]/5" };
  if (score >= 85) return { label: "良好", color: "#a78bfa", bg: "from-violet-500/20 to-violet-500/5" };
  if (score >= 80) return { label: "中等", color: "#fbbf24", bg: "from-amber-500/20 to-amber-500/5" };
  return { label: "较低", color: "#f87171", bg: "from-red-500/20 to-red-500/5" };
}

// SVG 圆环仪表盘
function ScoreGauge({ score, size = 160 }: { score: number; size?: number }) {
  const level = getScoreLevel(score);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  // 分数范围 0-100 映射到圆环 (270度)
  const percentage = Math.min(score, 100) / 100;
  const dashOffset = circumference * (1 - percentage * 0.75);
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        {/* 背景轨道 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
        />
        {/* 分数弧线 */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={level.color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference * 0.75 }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${level.color}40)` }}
        />
      </svg>
      {/* 中间数字 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-extrabold text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {score}
        </motion.span>
        <motion.span
          className="mt-1 text-xs font-medium"
          style={{ color: level.color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          {level.label}
        </motion.span>
      </div>
    </div>
  );
}

// 单项维度条
function DimensionBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const level = getScoreLevel(value);
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-xs text-neutral-400 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: level.color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay }}
        />
      </div>
      <span className="w-8 text-xs text-neutral-300 text-right">{value}</span>
    </div>
  );
}

export default function CreditScoreCard({ score, name }: CreditScoreCardProps) {
  const level = getScoreLevel(score.overall);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden"
    >
      {/* 头部：信用分仪表盘 */}
      <div className={`bg-gradient-to-b ${level.bg} p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4" style={{ color: level.color }} />
          <span className="text-sm font-medium text-white">创作者信用</span>
        </div>

        <div className="flex items-center justify-between">
          <ScoreGauge score={score.overall} />

          <div className="flex-1 ml-6 space-y-2.5">
            <DimensionBar label="守时度" value={score.punctuality} delay={0.4} />
            <DimensionBar label="专业度" value={score.professionalism} delay={0.5} />
            <DimensionBar label="技能" value={score.skill} delay={0.6} />
            <DimensionBar label="沟通" value={score.communication} delay={0.7} />
            <DimensionBar label="可靠性" value={score.reliability} delay={0.8} />
          </div>
        </div>

        {/* 统计 */}
        <div className="mt-4 flex gap-6 border-t border-white/10 pt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{score.totalProjects}</p>
            <p className="text-xs text-neutral-400">完成项目</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{score.totalReviews}</p>
            <p className="text-xs text-neutral-400">收到评价</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">
              {score.reviews.length > 0
                ? (score.reviews.reduce((sum, r) => sum + r.rating, 0) / score.reviews.length).toFixed(1)
                : "—"}
            </p>
            <p className="text-xs text-neutral-400">平均星级</p>
          </div>
        </div>
      </div>

      {/* 评价列表 */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-medium text-white">合作评价</span>
        </div>

        <div className="space-y-4">
          {score.reviews.map((review, i) => (
            <motion.div
              key={`${review.reviewer}-${review.date}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
              className="flex gap-3"
            >
              {/* 评价者头像 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${review.avatarSeed}`}
                alt={review.reviewer}
                className="h-9 w-9 rounded-full bg-neutral-800 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{review.reviewer}</span>
                  <span className="text-xs text-neutral-500">{review.date}</span>
                </div>

                {/* 星级 */}
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`h-3 w-3 ${si < review.rating ? "text-amber-400 fill-amber-400" : "text-neutral-700"}`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-neutral-500">项目: {review.project}</span>
                </div>

                {/* 评价内容 */}
                <p className="mt-1.5 text-sm text-neutral-300 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
