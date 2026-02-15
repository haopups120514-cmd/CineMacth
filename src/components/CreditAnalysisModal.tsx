"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreditAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    overall: number;
    punctuality: number;
    professionalism: number;
    skill: number;
    communication: number;
    reliability: number;
    totalReviews: number;
  };
  creditScore: number;
}

type Dimension = "punctuality" | "professionalism" | "skill" | "communication" | "reliability";

const DIMENSIONS: Dimension[] = ["punctuality", "professionalism", "skill", "communication", "reliability"];

function RadarChart({ stats }: { stats: Record<Dimension, number> }) {
  const size = 200;
  const center = size / 2;
  const maxR = 80;
  const angles = DIMENSIONS.map((_, i) => (Math.PI * 2 * i) / 5 - Math.PI / 2);

  const getPoint = (angle: number, value: number) => ({
    x: center + Math.cos(angle) * (value / 5) * maxR,
    y: center + Math.sin(angle) * (value / 5) * maxR,
  });

  // Grid rings
  const rings = [1, 2, 3, 4, 5];

  // Stat points
  const points = DIMENSIONS.map((d, i) => getPoint(angles[i], stats[d]));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Grid */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={angles.map((a) => {
            const p = getPoint(a, r);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}
      {/* Axes */}
      {angles.map((a, i) => {
        const end = getPoint(a, 5);
        return (
          <line key={i} x1={center} y1={center} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        );
      })}
      {/* Data polygon */}
      <motion.polygon
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="rgba(92, 200, 214, 0.15)"
        stroke="#5CC8D6"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />
      {/* Data points */}
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#5CC8D6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.1 }}
        />
      ))}
    </svg>
  );
}

export default function CreditAnalysisModal({ isOpen, onClose, stats, creditScore }: CreditAnalysisModalProps) {
  const { t } = useLanguage();

  const dimensionLabels: Record<Dimension, string> = {
    punctuality: t("creditScore", "punctuality"),
    professionalism: t("creditScore", "professionalism"),
    skill: t("creditScore", "skill"),
    communication: t("creditScore", "communication"),
    reliability: t("creditScore", "reliability"),
  };

  const sorted = [...DIMENSIONS].sort((a, b) => stats[b] - stats[a]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const getIcon = (value: number) => {
    if (value >= 4) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (value >= 3) return <Minus className="h-4 w-4 text-amber-400" />;
    return <TrendingDown className="h-4 w-4 text-red-400" />;
  };

  const getColor = (value: number) => {
    if (value >= 4) return "text-green-400";
    if (value >= 3) return "text-amber-400";
    return "text-red-400";
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
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">{t("rating", "analysisTitle")}</h2>
                <p className="text-sm text-neutral-400 mt-1">
                  {t("rating", "basedOn").replace("{n}", String(stats.totalReviews))}
                </p>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 transition-all cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 雷达图 */}
            <div className="relative">
              <RadarChart stats={stats} />
              {/* Labels around radar */}
              {DIMENSIONS.map((dim, i) => {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const labelR = 105;
                const x = 100 + Math.cos(angle) * labelR;
                const y = 100 + Math.sin(angle) * labelR;
                return (
                  <div
                    key={dim}
                    className="absolute text-xs text-neutral-300 font-medium"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      transform: "translate(-50%, -50%)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {dimensionLabels[dim]}
                  </div>
                );
              })}
            </div>

            {/* 详细分数 */}
            <div className="mt-6 space-y-3">
              {DIMENSIONS.map((dim) => (
                <div key={dim} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(stats[dim])}
                    <span className="text-sm text-neutral-300">{dimensionLabels[dim]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= Math.round(stats[dim]) ? "text-amber-400 fill-amber-400" : "text-neutral-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-sm font-medium w-8 text-right ${getColor(stats[dim])}`}>
                      {stats[dim].toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 分析总结 */}
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white">{t("rating", "summary")}</h3>
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-green-500/15 p-1.5 shrink-0 mt-0.5">
                  <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-green-400 font-medium">{t("rating", "strength")}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {dimensionLabels[strongest]} ({stats[strongest].toFixed(1)}/5)
                  </p>
                </div>
              </div>

              {stats[weakest] < 4 && (
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-amber-500/15 p-1.5 shrink-0 mt-0.5">
                    <TrendingDown className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-400 font-medium">{t("rating", "improvement")}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {dimensionLabels[weakest]} ({stats[weakest].toFixed(1)}/5)
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-white/5">
                <p className="text-xs text-neutral-500">
                  {t("rating", "creditFormula").replace("{score}", String(creditScore))}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
