"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Banknote,
  Users,
  User,
  MessageCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import PageBackground from "@/components/PageBackground";
import {
  fetchRecruitmentById,
  applyToRecruitment,
  checkIfApplied,
  getDisplayName,
  getAvatarUrl,
  formatRelativeTime,
  type DbRecruitment,
  type DbProfile,
} from "@/lib/database";
import { AuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAutoTranslate, useTranslateEnum } from "@/hooks/useTranslate";

export default function RecruitmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, session } = useContext(AuthContext);
  const { t } = useLanguage();
  const te = useTranslateEnum();

  const [recruitment, setRecruitment] = useState<(DbRecruitment & { poster?: DbProfile }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const translatedTitle = useAutoTranslate(recruitment?.title || "");
  const translatedDesc = useAutoTranslate(recruitment?.description || "");
  const translatedLocation = useAutoTranslate(recruitment?.location || "");
  const translatedRole = useAutoTranslate(recruitment?.role_needed || "");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchRecruitmentById(id);
      setRecruitment(data);
      if (data && user) {
        const hasApplied = await checkIfApplied(data.id, user.id);
        setApplied(hasApplied);
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  const handleApply = async () => {
    if (!user || !recruitment) return;
    setApplying(true);
    const result = await applyToRecruitment(recruitment.id, user.id);
    if (result) {
      setApplied(true);
      setToastMsg(t("common", "applied"));
    } else {
      setToastMsg(t("recruitDetail", "applyFailed"));
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    setApplying(false);
  };

  if (loading) {
    return (
      <section className="relative min-h-screen">
        <PageBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="inline-block h-6 w-6 rounded-full border-2 border-[#5CC8D6] border-t-transparent animate-spin" />
        </div>
      </section>
    );
  }

  if (!recruitment) {
    return (
      <section className="relative min-h-screen">
        <PageBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center flex-col gap-4">
          <p className="text-neutral-400">{t("recruitDetail", "notFound")}</p>
          <Link href="/projects" className="text-[#5CC8D6] hover:text-[#7AD4DF] text-sm">
            {t("recruitDetail", "backToBoard")}
          </Link>
        </div>
      </section>
    );
  }

  const statusColors: Record<string, string> = {
    "招募中": "bg-green-500/15 text-green-400",
    "已招到": "bg-blue-500/15 text-blue-400",
    "拍摄中": "bg-amber-500/15 text-amber-400",
    "已完成": "bg-neutral-500/15 text-neutral-400",
  };

  const compColors: Record<string, string> = {
    "有薪": "text-green-400",
    "包食宿": "text-blue-400",
    "互免": "text-orange-400",
    "可谈": "text-neutral-400",
  };

  const isOwner = user?.id === recruitment.user_id;
  const canApply = session && !isOwner && !applied && recruitment.status === "招募中";

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-12">
        {/* 返回 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("recruitDetail", "backToBoard")}
          </Link>
        </motion.div>

        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {translatedTitle}
            </h1>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${statusColors[recruitment.status] || statusColors["招募中"]}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {te(recruitment.status)}
            </span>
          </div>

          {/* 发布者信息 */}
          <div className="mt-3 flex items-center gap-3">
            <img
              src={recruitment.poster ? getAvatarUrl(recruitment.poster) : `https://api.dicebear.com/9.x/adventurer/svg?seed=${recruitment.user_id}`}
              alt=""
              className="h-8 w-8 rounded-full bg-neutral-800 object-cover"
            />
            <div>
              <Link
                href={`/find-crew/${recruitment.user_id}`}
                className="text-sm font-medium text-white hover:text-[#5CC8D6] transition-colors"
              >
                {recruitment.poster ? getDisplayName(recruitment.poster) : t("common", "unknownUser")}
              </Link>
              <p className="text-xs text-neutral-500">
                {formatRelativeTime(recruitment.created_at)}{t("recruitDetail", "posted")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 详情卡 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          {/* 信息标签 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-neutral-500 mb-2">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t("recruitDetail", "roleNeeded")}</span>
              </div>
              <p className="text-sm font-medium text-white">{translatedRole}</p>
            </div>
            {recruitment.location && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs">{t("recruitDetail", "location")}</span>
                </div>
                <p className="text-sm font-medium text-white">{translatedLocation}</p>
              </div>
            )}
            {recruitment.shoot_date && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">{t("recruitDetail", "shootDate")}</span>
                </div>
                <p className="text-sm font-medium text-white">{recruitment.shoot_date}</p>
              </div>
            )}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-neutral-500 mb-2">
                <Banknote className="h-4 w-4" />
                <span className="text-xs">{t("recruitDetail", "compensation")}</span>
              </div>
              <p className={`text-sm font-medium ${compColors[recruitment.compensation] || "text-white"}`}>
                {te(recruitment.compensation)}
              </p>
            </div>
          </div>

          {/* 描述 */}
          {recruitment.description && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-white mb-3">{t("recruitDetail", "description")}</h2>
              <p className="text-sm leading-relaxed text-neutral-300 whitespace-pre-wrap">
                {translatedDesc}
              </p>
            </div>
          )}
        </motion.div>

        {/* 操作区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          {canApply && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="flex items-center gap-2 rounded-xl bg-[#5CC8D6] px-6 py-3 text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF] disabled:opacity-50 cursor-pointer"
            >
              {applying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {t("common", "apply")}
            </button>
          )}
          {applied && (
            <div className="flex items-center gap-2 rounded-xl bg-green-500/15 px-6 py-3 text-sm text-green-400">
              <CheckCircle className="h-4 w-4" />
              {t("common", "applied")}
            </div>
          )}
          {session && !isOwner && (
            <Link
              href={`/find-crew/${recruitment.user_id}`}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm text-neutral-300 hover:bg-white/10 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              {t("recruitDetail", "contactPoster")}
            </Link>
          )}
          {!session && (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-[#5CC8D6] px-6 py-3 text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF]"
            >
              <User className="h-4 w-4" />
              {t("recruitDetail", "loginToApply")}
            </Link>
          )}
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50 rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-sm text-white backdrop-blur-md"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
