"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Pin,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import PageBackground from "@/components/PageBackground";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  isAdmin,
  DbAnnouncement,
} from "@/lib/database";

const priorityConfig = {
  urgent: {
    icon: AlertTriangle,
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    badge: "bg-red-500/20 text-red-300",
  },
  important: {
    icon: AlertCircle,
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    badge: "bg-amber-500/20 text-amber-300",
  },
  normal: {
    icon: Info,
    color: "text-[#5CC8D6]",
    border: "border-white/10",
    bg: "bg-white/[0.03]",
    badge: "bg-[#5CC8D6]/20 text-[#5CC8D6]",
  },
};

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { locale: language } = useLanguage();
  const admin = isAdmin(user?.email);

  const [announcements, setAnnouncements] = useState<DbAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 表单状态
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPriority, setFormPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [formPinned, setFormPinned] = useState(false);

  const labels = {
    zh: {
      title: "公告栏",
      subtitle: "平台公告与重要通知",
      back: "返回首页",
      noAnnouncements: "暂无公告",
      newAnnouncement: "发布公告",
      editAnnouncement: "编辑公告",
      titleLabel: "标题",
      contentLabel: "内容",
      priorityLabel: "优先级",
      pinLabel: "置顶",
      normal: "普通",
      important: "重要",
      urgent: "紧急",
      publish: "发布",
      save: "保存",
      cancel: "取消",
      deleteConfirm: "确认删除此公告？",
      pinned: "置顶",
      posted: "发布于",
    },
    en: {
      title: "Announcements",
      subtitle: "Platform announcements and important notices",
      back: "Back to Home",
      noAnnouncements: "No announcements yet",
      newAnnouncement: "New Announcement",
      editAnnouncement: "Edit Announcement",
      titleLabel: "Title",
      contentLabel: "Content",
      priorityLabel: "Priority",
      pinLabel: "Pin to top",
      normal: "Normal",
      important: "Important",
      urgent: "Urgent",
      publish: "Publish",
      save: "Save",
      cancel: "Cancel",
      deleteConfirm: "Are you sure you want to delete this announcement?",
      pinned: "Pinned",
      posted: "Posted",
    },
    ja: {
      title: "お知らせ",
      subtitle: "プラットフォームからのお知らせと重要な通知",
      back: "ホームに戻る",
      noAnnouncements: "お知らせはまだありません",
      newAnnouncement: "お知らせを投稿",
      editAnnouncement: "お知らせを編集",
      titleLabel: "タイトル",
      contentLabel: "内容",
      priorityLabel: "優先度",
      pinLabel: "ピン留め",
      normal: "通常",
      important: "重要",
      urgent: "緊急",
      publish: "投稿",
      save: "保存",
      cancel: "キャンセル",
      deleteConfirm: "このお知らせを削除しますか？",
      pinned: "ピン留め",
      posted: "投稿日",
    },
  };

  const t = labels[language] || labels.ja;

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    const data = await fetchAnnouncements();
    setAnnouncements(data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
    setFormPriority("normal");
    setFormPinned(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (a: DbAnnouncement) => {
    setFormTitle(a.title);
    setFormContent(a.content);
    setFormPriority(a.priority);
    setFormPinned(a.is_pinned);
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!user || !formTitle.trim() || !formContent.trim()) return;
    setSubmitting(true);

    if (editingId) {
      const ok = await updateAnnouncement(editingId, {
        title: formTitle.trim(),
        content: formContent.trim(),
        priority: formPriority,
        is_pinned: formPinned,
      });
      if (ok) {
        resetForm();
        loadAnnouncements();
      }
    } else {
      const result = await createAnnouncement({
        author_id: user.id,
        title: formTitle.trim(),
        content: formContent.trim(),
        priority: formPriority,
        is_pinned: formPinned,
      });
      if (result) {
        resetForm();
        loadAnnouncements();
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    const ok = await deleteAnnouncement(id);
    if (ok) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === "ja" ? "ja-JP" : language === "en" ? "en-US" : "zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-[#5CC8D6] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>

        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Megaphone className="h-6 w-6 text-[#5CC8D6]" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{t.title}</h1>
            </div>
            <p className="text-neutral-400 text-sm">{t.subtitle}</p>
          </div>

          {admin && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#5CC8D6] px-4 py-2.5 text-sm font-semibold text-[#050505] hover:bg-[#7AD4DF] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t.newAnnouncement}</span>
            </button>
          )}
        </motion.div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#5CC8D6]" />
          </div>
        )}

        {/* 空状态 */}
        {!loading && announcements.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Megaphone className="h-12 w-12 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500">{t.noAnnouncements}</p>
          </motion.div>
        )}

        {/* 公告列表 */}
        <div className="space-y-4">
          {announcements.map((a, i) => {
            const pc = priorityConfig[a.priority] || priorityConfig.normal;
            const Icon = pc.icon;

            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`rounded-2xl border ${pc.border} ${pc.bg} p-5 sm:p-6`}
              >
                {/* 头部 */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${pc.color}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {a.title}
                        </h3>
                        {a.is_pinned && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#5CC8D6]/20 px-2 py-0.5 text-[10px] text-[#5CC8D6]">
                            <Pin className="h-2.5 w-2.5" />
                            {t.pinned}
                          </span>
                        )}
                        {a.priority !== "normal" && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${pc.badge}`}>
                            {a.priority === "urgent" ? t.urgent : t.important}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        {t.posted} {formatDate(a.created_at)}
                        {a.author?.display_name && ` · ${a.author.display_name}`}
                      </p>
                    </div>
                  </div>

                  {/* 管理员操作 */}
                  {admin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(a)}
                        className="p-2 rounded-lg text-neutral-500 hover:text-[#5CC8D6] hover:bg-white/5 transition-all cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 内容 */}
                <p className="mt-3 text-sm leading-relaxed text-neutral-300 whitespace-pre-line pl-8">
                  {a.content}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ========== 编辑/新建弹窗 ========== */}
      <AnimatePresence>
        {showForm && admin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111318] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                  {editingId ? t.editAnnouncement : t.newAnnouncement}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-1 text-neutral-500 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 标题输入 */}
              <label className="text-xs text-neutral-400 mb-1 block">{t.titleLabel}</label>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50 mb-4"
                placeholder={t.titleLabel}
              />

              {/* 内容输入 */}
              <label className="text-xs text-neutral-400 mb-1 block">{t.contentLabel}</label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50 resize-none mb-4"
                placeholder={t.contentLabel}
              />

              {/* 优先级 */}
              <label className="text-xs text-neutral-400 mb-2 block">{t.priorityLabel}</label>
              <div className="flex gap-2 mb-4">
                {(["normal", "important", "urgent"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFormPriority(p)}
                    className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all cursor-pointer border ${
                      formPriority === p
                        ? p === "urgent"
                          ? "border-red-500/50 bg-red-500/20 text-red-300"
                          : p === "important"
                          ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                          : "border-[#5CC8D6]/50 bg-[#5CC8D6]/20 text-[#5CC8D6]"
                        : "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                    }`}
                  >
                    {p === "normal" ? t.normal : p === "important" ? t.important : t.urgent}
                  </button>
                ))}
              </div>

              {/* 置顶 */}
              <label className="flex items-center gap-3 mb-6 cursor-pointer">
                <div
                  onClick={() => setFormPinned(!formPinned)}
                  className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${
                    formPinned ? "bg-[#5CC8D6]" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                      formPinned ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </div>
                <span className="text-sm text-neutral-300">{t.pinLabel}</span>
              </label>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-neutral-400 hover:bg-white/5 transition-all cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !formTitle.trim() || !formContent.trim()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#5CC8D6] py-2.5 text-sm font-semibold text-[#050505] hover:bg-[#7AD4DF] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Megaphone className="h-4 w-4" />
                      {editingId ? t.save : t.publish}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
