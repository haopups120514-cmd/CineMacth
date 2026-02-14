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
} from "lucide-react";
import Link from "next/link";
import { AuthContext } from "@/contexts/AuthContext";
import {
  fetchRecruitments,
  createRecruitment,
  deleteRecruitment,
  getDisplayName,
  getAvatarUrl,
  formatRelativeTime,
  type DbRecruitment,
  type DbProfile,
} from "@/lib/database";

export default function Home() {
  const { user, session, userProfile } = useContext(AuthContext);
  const [recruitments, setRecruitments] = useState<(DbRecruitment & { poster?: DbProfile })[]>([]);
  const [loadingRecruitments, setLoadingRecruitments] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
    setLoadingRecruitments(false);
  }, []);

  useEffect(() => {
    loadRecruitments();
  }, [loadRecruitments]);

  const handlePost = async () => {
    if (!user || !postForm.title.trim() || !postForm.role_needed.trim()) {
      setPostError("请填写标题和招募职位");
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
        compensation: "可谈",
        shoot_date: "",
      });
      setShowPostForm(false);
      loadRecruitments();
    } else {
      setPostError("发布失败，请重试");
    }
    setPosting(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const ok = await deleteRecruitment(id);
    if (ok) loadRecruitments();
    setDeletingId(null);
  };

  return (
    <div>
      {/* Hero 区域 — 缩短高度让用户看到下方内容 */}
      <section className="relative flex min-h-[65vh] items-center justify-center overflow-hidden">
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

          {/* 滚动提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-10 flex flex-col items-center gap-1 text-neutral-500"
          >
            <span className="text-xs">下滑查看招聘信息</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 招聘信息模块 */}
      <section className="relative bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(92,200,214,0.06)_0%,transparent_60%)]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                  <Briefcase className="h-8 w-8 text-[#5CC8D6]" />
                  招聘信息
                </h2>
                <p className="mt-2 text-neutral-400">
                  发布你的拍摄计划，寻找合适的创作伙伴
                </p>
              </div>
              {session && (
                <button
                  onClick={() => setShowPostForm(!showPostForm)}
                  className="flex items-center gap-2 rounded-xl bg-[#5CC8D6] px-5 py-2.5 text-sm font-semibold text-[#050505] hover:bg-[#7AD4DF] transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  发布招聘
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
                    <h3 className="text-base font-semibold text-white">发布招聘信息</h3>
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
                      placeholder="项目标题 *（如：毕业短片《xxx》招募摄影师）"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={postForm.role_needed}
                        onChange={(e) => setPostForm((p) => ({ ...p, role_needed: e.target.value }))}
                        placeholder="招募职位 *（如：摄影师、灯光师）"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
                      />
                      <input
                        type="text"
                        value={postForm.location}
                        onChange={(e) => setPostForm((p) => ({ ...p, location: e.target.value }))}
                        placeholder="拍摄地点（如：东京・新宿）"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={postForm.compensation}
                        onChange={(e) => setPostForm((p) => ({ ...p, compensation: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#5CC8D6]/50"
                      >
                        <option value="可谈">可谈</option>
                        <option value="有薪">有薪</option>
                        <option value="包食宿">包食宿</option>
                        <option value="互免">互免</option>
                        <option value="志愿">志愿</option>
                      </select>
                      <input
                        type="text"
                        value={postForm.shoot_date}
                        onChange={(e) => setPostForm((p) => ({ ...p, shoot_date: e.target.value }))}
                        placeholder="拍摄日期（如：3月中旬）"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
                      />
                    </div>

                    <textarea
                      value={postForm.description}
                      onChange={(e) => setPostForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="项目描述（选填，拍摄内容、要求等）"
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
                          发布中...
                        </>
                      ) : (
                        <>
                          <Megaphone className="h-5 w-5" />
                          发布招聘信息
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
                <p className="mt-3 text-neutral-500 text-sm">加载中...</p>
              </div>
            ) : recruitments.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-dashed border-white/10">
                <Briefcase className="mx-auto h-10 w-10 text-neutral-600" />
                <p className="mt-3 text-neutral-500">暂无招聘信息</p>
                {session && (
                  <button
                    onClick={() => setShowPostForm(true)}
                    className="mt-4 text-sm text-[#5CC8D6] hover:text-[#7AD4DF] cursor-pointer"
                  >
                    发布第一条招聘 →
                  </button>
                )}
                {!session && (
                  <Link
                    href="/login"
                    className="mt-4 inline-block text-sm text-[#5CC8D6] hover:text-[#7AD4DF]"
                  >
                    登录后发布招聘 →
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {recruitments.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* 标题行 */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-base font-semibold text-white">
                            {item.title}
                          </h3>
                          <span className="rounded-md bg-[#5CC8D6]/15 px-2 py-0.5 text-xs font-medium text-[#5CC8D6]">
                            {item.status}
                          </span>
                        </div>

                        {/* 标签信息 */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {item.role_needed}
                          </span>
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.location}
                            </span>
                          )}
                          {item.shoot_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {item.shoot_date}
                            </span>
                          )}
                          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-400">
                            {item.compensation}
                          </span>
                        </div>

                        {/* 描述 */}
                        {item.description && (
                          <p className="mt-2 text-sm text-neutral-400 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {/* 发布者 */}
                        <div className="mt-3 flex items-center gap-2">
                          <img
                            src={item.poster ? getAvatarUrl(item.poster) : `https://api.dicebear.com/9.x/adventurer/svg?seed=${item.user_id}`}
                            alt=""
                            className="h-5 w-5 rounded-full bg-neutral-800"
                          />
                          <span className="text-xs text-neutral-500">
                            {item.poster ? getDisplayName(item.poster) : "未知用户"}
                          </span>
                          <span className="text-xs text-neutral-600">·</span>
                          <span className="text-xs text-neutral-600">
                            {formatRelativeTime(item.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* 操作区 */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* 联系按钮 */}
                        {session && user?.id !== item.user_id && (
                          <Link
                            href={`/find-crew/${item.user_id}`}
                            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/10 transition-all flex items-center gap-1"
                          >
                            <User className="h-3 w-3" />
                            联系
                          </Link>
                        )}
                        {/* 删除按钮（仅自己可见） */}
                        {user?.id === item.user_id && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="rounded-lg bg-red-500/10 border border-red-500/20 p-1.5 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
