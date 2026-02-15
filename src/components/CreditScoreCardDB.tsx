"use client";

import { motion } from "framer-motion";
import { Star, Shield, MessageSquare, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAutoTranslate } from "@/hooks/useTranslate";
import type { DbReview, DbProfile, DbRecruitment } from "@/lib/database";
import { getDisplayName, getAvatarUrl, formatRelativeTime } from "@/lib/database";

interface CreditScoreCardProps {
  creditScore: number;
  reviews: (DbReview & { reviewer?: DbProfile; recruitment?: DbRecruitment })[];
  stats: {
    overall: number;
    punctuality: number;
    professionalism: number;
    skill: number;
    communication: number;
    reliability: number;
    totalReviews: number;
  } | null;
  onAnalyze?: () => void;
}

function getScoreLevel(score: number, t: (s: string, k: string) => string) {
  if (score >= 95) return { label: t("creditScore", "excellent"), color: "#22c55e", bg: "from-emerald-500/20 to-emerald-500/5" };
  if (score >= 90) return { label: t("creditScore", "great"), color: "#5CC8D6", bg: "from-[#5CC8D6]/20 to-[#5CC8D6]/5" };
  if (score >= 85) return { label: t("creditScore", "good"), color: "#a78bfa", bg: "from-violet-500/20 to-violet-500/5" };
  if (score >= 80) return { label: t("creditScore", "fair"), color: "#fbbf24", bg: "from-amber-500/20 to-amber-500/5" };
  return { label: t("creditScore", "low"), color: "#f87171", bg: "from-red-500/20 to-red-500/5" };
}

function ScoreGauge({ score, size = 140, t }: { score: number; size?: number; t: (s: string, k: string) => string }) {
  const level = getScoreLevel(score, t);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(score, 100) / 100;
  const dashOffset = circumference * (1 - percentage * 0.75);
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * 0.25} />
        <motion.circle cx={center} cy={center} r={radius} fill="none" stroke={level.color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference * 0.75 }} animate={{ strokeDashoffset: dashOffset }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }} style={{ filter: `drop-shadow(0 0 6px ${level.color}40)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-3xl font-extrabold text-white" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.5 }}>
          {score}
        </motion.span>
        <motion.span className="mt-1 text-xs font-medium" style={{ color: level.color }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.8 }}>
          {level.label}
        </motion.span>
      </div>
    </div>
  );
}

function DimensionStars({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <span className="w-16 text-xs text-neutral-400 shrink-0">{label}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= Math.round(value) ? "text-amber-400 fill-amber-400" : "text-neutral-700"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-neutral-400 ml-1">{value.toFixed(1)}</span>
    </motion.div>
  );
}

function ReviewComment({ review, index }: { review: DbReview & { reviewer?: DbProfile; recruitment?: DbRecruitment }; index: number }) {
  const translatedComment = useAutoTranslate(review.comment || "");

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
      className="flex gap-3"
    >
      <img
        src={review.reviewer ? getAvatarUrl(review.reviewer) : `https://api.dicebear.com/9.x/adventurer/svg?seed=${review.reviewer_id}`}
        alt=""
        className="h-9 w-9 rounded-full bg-neutral-800 shrink-0 object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">
            {review.reviewer ? getDisplayName(review.reviewer) : "Anonymous"}
          </span>
          <span className="text-xs text-neutral-500">{formatRelativeTime(review.created_at)}</span>
        </div>
        {/* 各维度星星 */}
        <div className="mt-1 flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`h-3 w-3 ${s <= Math.round(review.rating) ? "text-amber-400 fill-amber-400" : "text-neutral-700"}`} />
          ))}
          <span className="ml-2 text-xs text-neutral-500">{review.rating.toFixed(1)}</span>
          {review.recruitment && (
            <span className="ml-2 text-xs text-neutral-600">· {review.recruitment.title}</span>
          )}
        </div>
        {review.comment && (
          <p className="mt-1.5 text-sm text-neutral-300 leading-relaxed">
            {translatedComment}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function CreditScoreCardDB({ creditScore, reviews, stats, onAnalyze }: CreditScoreCardProps) {
  const { t } = useLanguage();
  const level = getScoreLevel(creditScore, t);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden"
    >
      {/* 头部 */}
      <div className={`bg-gradient-to-b ${level.bg} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" style={{ color: level.color }} />
            <span className="text-sm font-medium text-white">{t("creditScore", "title")}</span>
          </div>
          {onAnalyze && (
            <button
              onClick={onAnalyze}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-[#5CC8D6] transition-colors cursor-pointer"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              {t("rating", "analyze")}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <ScoreGauge score={creditScore} t={t} />

          {stats ? (
            <div className="flex-1 ml-4 space-y-2">
              <DimensionStars label={t("creditScore", "punctuality")} value={stats.punctuality} delay={0.4} />
              <DimensionStars label={t("creditScore", "professionalism")} value={stats.professionalism} delay={0.5} />
              <DimensionStars label={t("creditScore", "skill")} value={stats.skill} delay={0.6} />
              <DimensionStars label={t("creditScore", "communication")} value={stats.communication} delay={0.7} />
              <DimensionStars label={t("creditScore", "reliability")} value={stats.reliability} delay={0.8} />
            </div>
          ) : (
            <div className="flex-1 ml-4 flex items-center justify-center">
              <p className="text-sm text-neutral-500">{t("rating", "noReviews")}</p>
            </div>
          )}
        </div>

        {/* 统计 */}
        <div className="mt-4 flex gap-6 border-t border-white/10 pt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{stats?.totalReviews || 0}</p>
            <p className="text-xs text-neutral-400">{t("creditScore", "reviewsReceived")}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">
              {stats ? stats.overall.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-neutral-400">{t("creditScore", "avgRating")}</p>
          </div>
        </div>
      </div>

      {/* 评价列表 */}
      {reviews.length > 0 && (
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-medium text-white">{t("creditScore", "reviewsTitle")}</span>
          </div>
          <div className="space-y-4">
            {reviews.slice(0, 10).map((review, i) => (
              <ReviewComment key={review.id} review={review} index={i} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
