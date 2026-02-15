"use client";

import { useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Megaphone,
  Shield,
  MessageCircle,
  Plus,
  MapPin,
  Calendar,
  Briefcase,
  Loader2,
  X,
  Trash2,
  User,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { AuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAutoTranslate, useTranslateEnum } from "@/hooks/useTranslate";
import {
  fetchRecruitments,
  createRecruitment,
  deleteRecruitment,
  applyToRecruitment,
  checkIfApplied,
  getDisplayName,
  getAvatarUrl,
  formatRelativeTime,
  type DbRecruitment,
  type DbProfile,
} from "@/lib/database";

function RecruitmentCard({
  item,
  isOwn,
  isLoggedIn,
  isApplied,
  isApplying,
  isDeleting,
  t,
  onApply,
  onDelete,
}: {
  item: DbRecruitment & { poster?: DbProfile };
  isOwn: boolean;
  isLoggedIn: boolean;
  isApplied: boolean;
  isApplying: boolean;
  isDeleting: boolean;
  t: (ns: string, key: string) => string;
  onApply: () => void;
  onDelete: () => void;
}) {
  const title = useAutoTranslate(item.title);
  const description = useAutoTranslate(item.description || "");
  const roleNeeded = useAutoTranslate(item.role_needed);
  const locationText = useAutoTranslate(item.location || "");
  const te = useTranslateEnum();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:border-white/20 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <span className="rounded-md bg-[#5CC8D6]/15 px-2 py-0.5 text-xs font-medium text-[#5CC8D6]">
              {te(item.status)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {roleNeeded}
            </span>
            {item.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {locationText}
              </span>
            )}
            {item.shoot_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {item.shoot_date}
              </span>
            )}
            <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-400">
              {te(item.compensation)}
            </span>
          </div>
          {item.description && (
            <p className="mt-2 text-sm text-neutral-400 line-clamp-2">{description}</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <img
              src={item.poster ? getAvatarUrl(item.poster) : `https://api.dicebear.com/9.x/adventurer/svg?seed=${item.user_id}`}
              alt=""
              className="h-5 w-5 rounded-full bg-neutral-800"
            />
            <span className="text-xs text-neutral-500">
              {item.poster ? getDisplayName(item.poster) : t("common", "unknownUser")}
            </span>
            <span className="text-xs text-neutral-600">·</span>
            <span className="text-xs text-neutral-600">{formatRelativeTime(item.created_at)}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isLoggedIn && !isOwn && (
            isApplied ? (
              <span className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-xs text-green-400 flex items-center gap-1">
                {t("common", "applied")}
              </span>
            ) : (
              <button
                onClick={onApply}
                disabled={isApplying}
                className="rounded-lg bg-[#5CC8D6]/10 border border-[#5CC8D6]/20 px-3 py-1.5 text-xs text-[#5CC8D6] hover:bg-[#5CC8D6]/20 transition-all flex items-center gap-1 cursor-pointer"
              >
                {isApplying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                {t("common", "apply")}
              </button>
            )
          )}
          {isLoggedIn && !isOwn && (
            <Link
              href={`/find-crew/${item.user_id}`}
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/10 transition-all flex items-center gap-1"
            >
              <User className="h-3 w-3" />
              {t("common", "contact")}
            </Link>
          )}
          {isOwn && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded-lg bg-red-500/10 border border-red-500/20 p-1.5 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { user, session, userProfile } = useContext(AuthContext);
  const { t } = useLanguage();
  const [recruitments, setRecruitments] = useState<(DbRecruitment & { poster?: DbProfile })[]>([]);
  const [loadingRecruitments, setLoadingRecruitments] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [postError, setPostError] = useState("");
  const [postForm, setPostForm] = useState({
    title: "",
    description: "",
    role_needed: "",
    location: "",
    compensation: "可谈",
    shoot_date: "",
  });

  const loadRecruitments = useCallback(async () => {
    setLoadingRecruitments(true);
    const data = await fetchRecruitments();
    setRecruitments(data);
    // 检查已申请的招聘
    if (user) {
      const applied = new Set<string>();
      for (const r of data) {
        if (r.user_id !== user.id) {
          const isApplied = await checkIfApplied(r.id, user.id);
          if (isApplied) applied.add(r.id);
        }
      }
      setAppliedIds(applied);
    }
    setLoadingRecruitments(false);
  }, [user]);

  useEffect(() => {
    loadRecruitments();
  }, [loadRecruitments]);

  const handlePost = async () => {
    if (!user || !postForm.title.trim() || !postForm.role_needed.trim()) {
      setPostError(t("home", "formError"));
      return;
    }

    setPosting(true);
    setPostError("");

    const result = await createRecruitment({
      user_id: user.id,
      title: postForm.title.trim(),
      description: postForm.description.trim(),
      role_needed: postForm.role_needed.trim(),
      location: postForm.location.trim(),
      compensation: postForm.compensation,
      shoot_date: postForm.shoot_date.trim(),
    });

    if (result) {
      setPostForm({
        title: "",
        description: "",
        role_needed: "",
        location: "",
        compensation: t("home", "compNegotiable"),
        shoot_date: "",
      });
      setShowPostForm(false);
      loadRecruitments();
    } else {
      setPostError(t("home", "postFailed"));
    }
    setPosting(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const ok = await deleteRecruitment(id);
    if (ok) loadRecruitments();
    setDeletingId(null);
  };

  const handleApply = async (recruitmentId: string) => {
    if (!user) return;
    setApplyingId(recruitmentId);
    const result = await applyToRecruitment(recruitmentId, user.id);
    if (result) {
      setAppliedIds((prev) => new Set(prev).add(recruitmentId));
    }
    setApplyingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#111318] to-[#050505]">
      {/* 背景 */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(92,200,214,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pt-20 sm:pt-24 pb-12 sm:pb-16">
        {/* ========== iOS 小组件风格 Hero ========== */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* 主卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="sm:col-span-2 lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col justify-between"
          >
            <div>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                {t("home", "heroTitle1")}<span className="text-[#5CC8D6]">{t("home", "heroTitle2")}</span>
              </h1>
              <p className="mt-2 text-sm text-neutral-400">
                {t("home", "heroSubtitle")}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
              <Link href="/find-crew" className="group flex items-center gap-2 rounded-xl bg-[#5CC8D6] px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#050505] hover:bg-[#7AD4DF] transition-all">
                <Users className="h-4 w-4" />
                {t("home", "recruitPartner")}
              </Link>
              <Link href="/projects" className="group flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition-all">
                <Megaphone className="h-4 w-4" />
                {t("home", "board")}
              </Link>
              <Link href="/plans" className="group flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition-all">
                <ClipboardList className="h-4 w-4" />
                {t("home", "myPlans")}
              </Link>
            </div>
          </motion.div>

          {/* 快捷入口卡片 */}
          {session ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={userProfile?.avatar_url || `https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.id}`}
                  alt=""
                  className="h-10 w-10 rounded-full bg-neutral-800 border border-white/10"
                />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {userProfile?.display_name || user?.email?.split("@")[0]}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Shield className="h-3 w-3" />
                    {t("common", "creditScore")} {userProfile?.credit_score ?? 80}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  href="/messages"
                  className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:bg-white/10 transition-all w-full"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-[#5CC8D6]" />
                  {t("home", "myMessages")}
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:bg-white/10 transition-all w-full"
                >
                  <User className="h-3.5 w-3.5 text-[#5CC8D6]" />
                  {t("home", "editProfile")}
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center"
            >
              <Shield className="h-8 w-8 text-[#5CC8D6] mb-3" />
              <p className="text-sm text-neutral-400 mb-3">{t("home", "unlockFeatures")}</p>
              <Link href="/login" className="rounded-xl bg-[#5CC8D6] px-5 py-2 text-sm font-semibold text-[#050505] hover:bg-[#7AD4DF] transition-all">
                {t("home", "loginRegister")}
              </Link>
            </motion.div>
          )}
        </div>

        {/* ========== 招聘信息模块 ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8"
        >
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                  <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-[#5CC8D6]" />
                  {t("home", "recruitmentSection")}
                </h2>
                <p className="mt-2 text-neutral-400">
                  {t("home", "recruitmentDesc")}
                </p>
              </div>
              {session && (
                <button
                  onClick={() => setShowPostForm(!showPostForm)}
                  className="flex items-center gap-2 rounded-xl bg-[#5CC8D6] px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#050505] hover:bg-[#7AD4DF] transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  {t("home", "postRecruitment")}
                </button>
              )}
            </div>

            {/* 发布表单 */}
            <AnimatePresence>
              {showPostForm && session && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-white">{t("home", "postRecruitmentTitle")}</h3>
                    <button
                      onClick={() => { setShowPostForm(false); setPostError(""); }}
                      className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {postError && (
                    <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                      {postError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={postForm.title}
                      onChange={(e) => setPostForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder={t("home", "titlePlaceholder")}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={postForm.role_needed}
                        onChange={(e) => setPostForm((p) => ({ ...p, role_needed: e.target.value }))}
                        placeholder={t("home", "rolePlaceholder")}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
                      />
                      <input
                        type="text"
                        value={postForm.location}
                        onChange={(e) => setPostForm((p) => ({ ...p, location: e.target.value }))}
                        placeholder={t("home", "locationPlaceholder")}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={postForm.compensation}
                        onChange={(e) => setPostForm((p) => ({ ...p, compensation: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#5CC8D6]/50"
                      >
                        <option value="可谈">{t("home", "compNegotiable")}</option>
                        <option value="有薪">{t("home", "compPaid")}</option>
                        <option value="包食宿">{t("home", "compAccom")}</option>
                        <option value="互免">{t("home", "compExchange")}</option>
                        <option value="志愿">{t("home", "compVolunteer")}</option>
                      </select>
                      <input
                        type="text"
                        value={postForm.shoot_date}
                        onChange={(e) => setPostForm((p) => ({ ...p, shoot_date: e.target.value }))}
                        placeholder={t("home", "datePlaceholder")}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
                      />
                    </div>

                    <textarea
                      value={postForm.description}
                      onChange={(e) => setPostForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder={t("home", "descriptionPlaceholder")}
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50 resize-none"
                    />

                    <button
                      onClick={handlePost}
                      disabled={posting || !postForm.title.trim() || !postForm.role_needed.trim()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#5CC8D6] py-3 text-base font-semibold text-[#050505] hover:bg-[#7AD4DF] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {posting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {t("home", "posting")}
                        </>
                      ) : (
                        <>
                          <Megaphone className="h-5 w-5" />
                          {t("home", "postRecruitmentBtn")}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 招聘列表 */}
            {loadingRecruitments ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 rounded-full border-2 border-[#5CC8D6] border-t-transparent animate-spin" />
                <p className="mt-3 text-neutral-500 text-sm">{t("common", "loading")}</p>
              </div>
            ) : recruitments.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-dashed border-white/10">
                <Briefcase className="mx-auto h-10 w-10 text-neutral-600" />
                <p className="mt-3 text-neutral-500">{t("home", "noRecruitments")}</p>
                {session && (
                  <button
                    onClick={() => setShowPostForm(true)}
                    className="mt-4 text-sm text-[#5CC8D6] hover:text-[#7AD4DF] cursor-pointer"
                  >
                    {t("home", "postFirst")}
                  </button>
                )}
                {!session && (
                  <Link
                    href="/login"
                    className="mt-4 inline-block text-sm text-[#5CC8D6] hover:text-[#7AD4DF]"
                  >
                    {t("home", "loginToPost")}
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {recruitments.map((item) => (
                  <RecruitmentCard
                    key={item.id}
                    item={item}
                    isOwn={user?.id === item.user_id}
                    isLoggedIn={!!session}
                    isApplied={appliedIds.has(item.id)}
                    isApplying={applyingId === item.id}
                    isDeleting={deletingId === item.id}
                    t={t}
                    onApply={() => handleApply(item.id)}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
      </div>
    </div>
  );
}
