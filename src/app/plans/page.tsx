"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Briefcase,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Loader2,
  ChevronDown,
  Send,
  User,
} from "lucide-react";
import PageBackground from "@/components/PageBackground";
import RatingModal from "@/components/RatingModal";
import { AuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  fetchUserRecruitments,
  fetchMyApplications,
  fetchApplicationsByRecruitment,
  updateApplicationStatus,
  updateRecruitmentStatus,
  checkIfReviewed,
  getDisplayName,
  getAvatarUrl,
  formatRelativeTime,
  type DbRecruitment,
  type DbProfile,
  type DbApplication,
} from "@/lib/database";

type Tab = "my-posts" | "my-applications";

const statusColors: Record<string, string> = {
  "招募中": "bg-[#5CC8D6]/15 text-[#5CC8D6]",
  "已招到": "bg-amber-500/15 text-amber-400",
  "拍摄中": "bg-blue-500/15 text-blue-400",
  "已完成": "bg-green-500/15 text-green-400",
  "待处理": "bg-neutral-500/15 text-neutral-400",
  "已接受": "bg-green-500/15 text-green-400",
  "已拒绝": "bg-red-500/15 text-red-400",
};

const recruitmentStatuses = ["招募中", "已招到", "拍摄中", "已完成"];

export default function PlansPage() {
  const { user, session } = useContext(AuthContext);
  const { t } = useLanguage();
  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      "招募中": t("plans", "statusRecruiting"),
      "已招到": t("plans", "statusRecruited"),
      "拍摄中": t("plans", "statusShooting"),
      "已完成": t("plans", "statusCompleted"),
      "待处理": t("plans", "appPending"),
      "已接受": t("plans", "appAccepted"),
      "已拒绝": t("plans", "appRejected"),
    };
    return map[s] || s;
  };
  const [tab, setTab] = useState<Tab>("my-posts");
  const [myPosts, setMyPosts] = useState<DbRecruitment[]>([]);
  const [myApplications, setMyApplications] = useState<
    (DbApplication & { recruitment?: DbRecruitment & { poster?: DbProfile } })[]
  >([]);
  const [loading, setLoading] = useState(true);

  // 展开的招聘（查看申请人）
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [applications, setApplications] = useState<
    (DbApplication & { applicant?: DbProfile })[]
  >([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // 状态更新
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 评分
  const [showReviewForm, setShowReviewForm] = useState<{
    recruitmentId: string;
    revieweeId: string;
    revieweeName: string;
  } | null>(null);
  const [reviewedPairs, setReviewedPairs] = useState<Set<string>>(new Set());

  const loadMyPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await fetchUserRecruitments(user.id);
    setMyPosts(data);
    setLoading(false);
  }, [user]);

  const loadMyApplications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await fetchMyApplications(user.id);
    setMyApplications(data);

    // 检查哪些已经评过分
    const reviewed = new Set<string>();
    for (const app of data) {
      if (app.recruitment && app.recruitment.status === "已完成") {
        const isReviewed = await checkIfReviewed(
          user.id,
          app.recruitment.user_id,
          app.recruitment_id
        );
        if (isReviewed) reviewed.add(`${app.recruitment_id}:${app.recruitment.user_id}`);
      }
    }
    setReviewedPairs(reviewed);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (tab === "my-posts") loadMyPosts();
    else loadMyApplications();
  }, [tab, loadMyPosts, loadMyApplications]);

  // 展开查看申请人
  const toggleExpand = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }
    setExpandedPost(postId);
    setLoadingApps(true);
    const apps = await fetchApplicationsByRecruitment(postId);
    setApplications(apps);

    // 检查已评分
    if (user) {
      const reviewed = new Set(reviewedPairs);
      for (const app of apps) {
        if (app.status === "已接受") {
          const post = myPosts.find((p) => p.id === postId);
          if (post && post.status === "已完成") {
            const isReviewed = await checkIfReviewed(user.id, app.applicant_id, postId);
            if (isReviewed) reviewed.add(`${postId}:${app.applicant_id}`);
          }
        }
      }
      setReviewedPairs(reviewed);
    }
    setLoadingApps(false);
  };

  // 更新申请状态
  const handleUpdateApp = async (appId: string, status: string) => {
    setUpdatingId(appId);
    const ok = await updateApplicationStatus(appId, status);
    if (ok && expandedPost) {
      const apps = await fetchApplicationsByRecruitment(expandedPost);
      setApplications(apps);
    }
    setUpdatingId(null);
  };

  // 更新招聘状态
  const handleUpdateStatus = async (postId: string, status: string) => {
    setUpdatingId(postId);
    const ok = await updateRecruitmentStatus(postId, status);
    if (ok) loadMyPosts();
    setUpdatingId(null);
  };

  // 评分提交回调
  const handleReviewSubmitted = () => {
    if (showReviewForm) {
      setReviewedPairs((prev) => {
        const next = new Set(prev);
        next.add(`${showReviewForm.recruitmentId}:${showReviewForm.revieweeId}`);
        return next;
      });
    }
  };

  if (!session) {
    return (
      <section className="relative min-h-screen">
        <PageBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Briefcase className="mx-auto h-12 w-12 text-neutral-600 mb-4" />
            <p className="text-neutral-400 mb-4">{t("plans", "loginHint")}</p>
            <Link href="/login" className="rounded-xl bg-[#5CC8D6] px-6 py-2.5 text-sm font-semibold text-[#050505] hover:bg-[#7AD4DF] transition-all">
              {t("common", "login")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-12">
        {/* 标题 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-4xl font-extrabold text-white md:text-5xl"
        >
          {t("plans", "title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-lg text-neutral-400"
        >
          {t("plans", "subtitle")}
        </motion.p>

        {/* Tab 切换 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex gap-2"
        >
          <button
            onClick={() => setTab("my-posts")}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition-all cursor-pointer ${
              tab === "my-posts"
                ? "border-[#5CC8D6]/50 bg-[#5CC8D6]/20 text-[#5CC8D6]"
                : "border-white/15 bg-white/5 text-neutral-400 hover:text-neutral-300"
            }`}
          >
            <Briefcase className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            {t("plans", "myPosts")} ({myPosts.length})
          </button>
          <button
            onClick={() => setTab("my-applications")}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition-all cursor-pointer ${
              tab === "my-applications"
                ? "border-[#5CC8D6]/50 bg-[#5CC8D6]/20 text-[#5CC8D6]"
                : "border-white/15 bg-white/5 text-neutral-400 hover:text-neutral-300"
            }`}
          >
            <Send className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            {t("plans", "myApplications")} ({myApplications.length})
          </button>
        </motion.div>

        {/* 内容区 */}
        <div className="mt-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block h-8 w-8 rounded-full border-2 border-[#5CC8D6] border-t-transparent animate-spin" />
              <p className="mt-3 text-neutral-500 text-sm">{t("common", "loading")}</p>
            </div>
          ) : tab === "my-posts" ? (
            /* ========== 我发布的 ========== */
            myPosts.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-dashed border-white/10">
                <Briefcase className="mx-auto h-10 w-10 text-neutral-600" />
                <p className="mt-3 text-neutral-500">{t("plans", "noPosts")}</p>
                <Link href="/" className="mt-4 inline-block text-sm text-[#5CC8D6] hover:text-[#7AD4DF]">
                  {t("plans", "goPost")}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
                  >
                    {/* 招聘卡片 */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-base font-semibold text-white">{post.title}</h3>
                            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusColors[post.status] || "bg-neutral-500/15 text-neutral-400"}`}>
                              {statusLabel(post.status)}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {post.role_needed}
                            </span>
                            {post.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {post.location}
                              </span>
                            )}
                            {post.shoot_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {post.shoot_date}
                              </span>
                            )}
                            <span className="text-neutral-600">
                              {formatRelativeTime(post.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* 状态控制 + 展开 */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* 状态切换 */}
                          <select
                            value={post.status}
                            onChange={(e) => handleUpdateStatus(post.id, e.target.value)}
                            disabled={updatingId === post.id}
                            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-neutral-300 outline-none cursor-pointer"
                          >
                            {recruitmentStatuses.map((s) => (
                              <option key={s} value={s}>{statusLabel(s)}</option>
                            ))}
                          </select>

                          {/* 展开申请人列表 */}
                          <button
                            onClick={() => toggleExpand(post.id)}
                            className={`rounded-lg p-1.5 transition-all cursor-pointer ${
                              expandedPost === post.id
                                ? "bg-[#5CC8D6]/20 text-[#5CC8D6]"
                                : "bg-white/5 text-neutral-400 hover:text-white"
                            }`}
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedPost === post.id ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 申请人列表 */}
                    <AnimatePresence>
                      {expandedPost === post.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/10 overflow-hidden"
                        >
                          <div className="p-5 bg-white/[0.02]">
                            <h4 className="text-sm font-semibold text-neutral-300 mb-3">
                              {t("plans", "applicants")} ({applications.length})
                            </h4>
                            {loadingApps ? (
                              <div className="text-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-[#5CC8D6] mx-auto" />
                              </div>
                            ) : applications.length === 0 ? (
                              <p className="text-sm text-neutral-500 py-3">{t("plans", "noApplicants")}</p>
                            ) : (
                              <div className="space-y-3">
                                {applications.map((app) => (
                                  <div
                                    key={app.id}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <img
                                        src={app.applicant ? getAvatarUrl(app.applicant) : ""}
                                        alt=""
                                        className="h-8 w-8 rounded-full bg-neutral-800"
                                      />
                                      <div className="min-w-0">
                                        <Link
                                          href={`/find-crew/${app.applicant_id}`}
                                          className="text-sm font-medium text-white hover:text-[#5CC8D6] transition-colors"
                                        >
                                          {app.applicant ? getDisplayName(app.applicant) : t("common", "unknown")}
                                        </Link>
                                        <p className="text-xs text-neutral-500">
                                          {formatRelativeTime(app.created_at)}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {app.status === "待处理" ? (
                                        <>
                                          <button
                                            onClick={() => handleUpdateApp(app.id, "已接受")}
                                            disabled={updatingId === app.id}
                                            className="rounded-lg bg-green-500/10 border border-green-500/20 p-1.5 text-green-400 hover:bg-green-500/20 transition-all cursor-pointer"
                                          >
                                            <CheckCircle2 className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={() => handleUpdateApp(app.id, "已拒绝")}
                                            disabled={updatingId === app.id}
                                            className="rounded-lg bg-red-500/10 border border-red-500/20 p-1.5 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                                          >
                                            <XCircle className="h-4 w-4" />
                                          </button>
                                        </>
                                      ) : (
                                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusColors[app.status] || ""}`}>
                                          {statusLabel(app.status)}
                                        </span>
                                      )}

                                      {/* 评分按钮 - 项目已完成 + 已接受 */}
                                      {post.status === "已完成" && app.status === "已接受" && (
                                        reviewedPairs.has(`${post.id}:${app.applicant_id}`) ? (
                                          <span className="text-xs text-green-400 flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-green-400" />
                                            {t("plans", "rated")}
                                          </span>
                                        ) : (
                                          <button
                                            onClick={() => setShowReviewForm({
                                              recruitmentId: post.id,
                                              revieweeId: app.applicant_id,
                                              revieweeName: app.applicant ? getDisplayName(app.applicant) : t("common", "unknown"),
                                            })}
                                            className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
                                          >
                                            <Star className="h-3 w-3" />
                                            {t("plans", "rate")}
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            /* ========== 我申请的 ========== */
            myApplications.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-dashed border-white/10">
                <Send className="mx-auto h-10 w-10 text-neutral-600" />
                <p className="mt-3 text-neutral-500">{t("plans", "noApplications")}</p>
                <Link href="/" className="mt-4 inline-block text-sm text-[#5CC8D6] hover:text-[#7AD4DF]">
                  {t("plans", "goApply")}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myApplications.map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-base font-semibold text-white">
                            {app.recruitment?.title || t("plans", "deletedRecruitment")}
                          </h3>
                          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusColors[app.status] || ""}`}>
                            {statusLabel(app.status)}
                          </span>
                          {app.recruitment && (
                            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusColors[app.recruitment.status] || ""}`}>
                              {t("plans", "projectStatus")}{statusLabel(app.recruitment.status)}
                            </span>
                          )}
                        </div>

                        {app.recruitment && (
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {app.recruitment.role_needed}
                            </span>
                            {app.recruitment.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {app.recruitment.location}
                              </span>
                            )}
                          </div>
                        )}

                        {/* 发布者信息 */}
                        {app.recruitment?.poster && (
                          <div className="mt-3 flex items-center gap-2">
                            <img
                              src={getAvatarUrl(app.recruitment.poster)}
                              alt=""
                              className="h-5 w-5 rounded-full bg-neutral-800"
                            />
                            <span className="text-xs text-neutral-500">
                              {getDisplayName(app.recruitment.poster)}
                            </span>
                            <span className="text-xs text-neutral-600">·</span>
                            <span className="text-xs text-neutral-600">
                              {formatRelativeTime(app.created_at)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 操作区 */}
                      <div className="flex items-center gap-2 shrink-0">
                        {app.status === "已接受" && app.recruitment?.poster && (
                          <Link
                            href={`/find-crew/${app.recruitment.user_id}`}
                            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/10 transition-all flex items-center gap-1"
                          >
                            <User className="h-3 w-3" />
                            {t("common", "contact")}
                          </Link>
                        )}

                        {/* 评分入口 - 已完成 + 已接受 */}
                        {app.status === "已接受" &&
                          app.recruitment?.status === "已完成" &&
                          app.recruitment?.poster && (
                            reviewedPairs.has(`${app.recruitment_id}:${app.recruitment.user_id}`) ? (
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <Star className="h-3 w-3 fill-green-400" />
                                {t("plans", "rated")}
                              </span>
                            ) : (
                              <button
                                onClick={() => setShowReviewForm({
                                  recruitmentId: app.recruitment_id,
                                  revieweeId: app.recruitment!.user_id,
                                  revieweeName: getDisplayName(app.recruitment!.poster!),
                                })}
                                className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Star className="h-3 w-3" />
                                {t("plans", "rate")}
                              </button>
                            )
                          )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* ========== 评分弹窗 ========== */}
      {showReviewForm && (
        <RatingModal
          isOpen={!!showReviewForm}
          onClose={() => setShowReviewForm(null)}
          onSubmitted={handleReviewSubmitted}
          reviewerId={user!.id}
          revieweeId={showReviewForm.revieweeId}
          revieweeName={showReviewForm.revieweeName}
          recruitmentId={showReviewForm.recruitmentId}
        />
      )}
    </section>
  );
}
