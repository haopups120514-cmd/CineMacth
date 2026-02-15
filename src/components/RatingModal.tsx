"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Loader2 } from "lucide-react";
import { submitReview } from "@/lib/database";
import { useLanguage } from "@/contexts/LanguageContext";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  reviewerId: string;
  revieweeId: string;
  revieweeName: string;
  recruitmentId: string;
}

const DIMENSIONS = ["punctuality", "professionalism", "skill", "communication", "reliability"] as const;
type Dimension = typeof DIMENSIONS[number];

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-neutral-300 w-20 shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 cursor-pointer transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hover || value)
                  ? "text-amber-400 fill-amber-400"
                  : "text-neutral-600"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-neutral-500 w-4">{value}</span>
      </div>
    </div>
  );
}

export default function RatingModal({
  isOpen,
  onClose,
  onSubmitted,
  reviewerId,
  revieweeId,
  revieweeName,
  recruitmentId,
}: RatingModalProps) {
  const { t } = useLanguage();
  const [ratings, setRatings] = useState<Record<Dimension, number>>({
    punctuality: 0,
    professionalism: 0,
    skill: 0,
    communication: 0,
    reliability: 0,
  });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const dimensionLabels: Record<Dimension, string> = {
    punctuality: t("creditScore", "punctuality"),
    professionalism: t("creditScore", "professionalism"),
    skill: t("creditScore", "skill"),
    communication: t("creditScore", "communication"),
    reliability: t("creditScore", "reliability"),
  };

  const allRated = DIMENSIONS.every((d) => ratings[d] > 0);
  const avgRating = allRated
    ? Math.round((DIMENSIONS.reduce((s, d) => s + ratings[d], 0) / 5) * 10) / 10
    : 0;

  const handleSubmit = async () => {
    if (!allRated) {
      setError(t("rating", "rateAllDimensions"));
      return;
    }
    setError("");
    setSubmitting(true);

    const result = await submitReview({
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      recruitment_id: recruitmentId,
      punctuality: ratings.punctuality,
      professionalism: ratings.professionalism,
      skill: ratings.skill,
      communication: ratings.communication,
      reliability: ratings.reliability,
      comment,
    });

    setSubmitting(false);
    if (result) {
      onSubmitted();
      onClose();
      // Reset
      setRatings({ punctuality: 0, professionalism: 0, skill: 0, communication: 0, reliability: 0 });
      setComment("");
    } else {
      setError(t("rating", "submitFailed"));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {t("plans", "ratePartner")}
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  {t("plans", "rateFor").replace("{name}", revieweeName)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 维度评分 */}
            <div className="space-y-4">
              {DIMENSIONS.map((dim) => (
                <StarRating
                  key={dim}
                  label={dimensionLabels[dim]}
                  value={ratings[dim]}
                  onChange={(v) => setRatings((prev) => ({ ...prev, [dim]: v }))}
                />
              ))}
            </div>

            {/* 综合分预览 */}
            {allRated && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-center justify-between"
              >
                <span className="text-sm text-amber-400">{t("rating", "overallScore")}</span>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="text-lg font-bold text-amber-400">{avgRating}</span>
                  <span className="text-xs text-amber-400/60">/5</span>
                </div>
              </motion.div>
            )}

            {/* 评论 */}
            <div className="mt-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("plans", "reviewPlaceholder")}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-[#5CC8D6]/50 focus:outline-none resize-none"
              />
            </div>

            {/* 错误 */}
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}

            {/* 提交 */}
            <button
              onClick={handleSubmit}
              disabled={!allRated || submitting}
              className="mt-4 w-full rounded-xl bg-[#5CC8D6] py-3 text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {t("plans", "submitRating")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
