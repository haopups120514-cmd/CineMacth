"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageBackground from "@/components/PageBackground";
import RealMessagePanel from "@/components/RealMessagePanel";
import {
  fetchUserConversations,
  subscribeToMessages,
  formatRelativeTime,
  type ConversationPreview,
} from "@/lib/database";

export default function MessagesPage() {
  const { user, session, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [selectedConv, setSelectedConv] = useState<ConversationPreview | null>(null);

  // 加载对话列表
  const loadConversations = useCallback(async () => {
    if (!user) return;
    const convs = await fetchUserConversations(user.id);
    setConversations(convs);
    setLoadingConv(false);
  }, [user]);

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
      return;
    }
    if (user) {
      loadConversations();
    }
  }, [user, session, loading, router, loadConversations]);

  // 订阅新消息
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToMessages(user.id, () => {
      // 有新消息时刷新对话列表
      loadConversations();
    });

    return unsubscribe;
  }, [user, loadConversations]);

  if (loading || !session) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <PageBackground />
        <div className="relative z-10 text-white">{t("common", "loadingAlt")}</div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-12">
        {/* 返回 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("messages", "back")}
          </Link>
        </motion.div>

        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-white">{t("messages", "title")}</h1>
          <p className="mt-2 text-neutral-400">{t("messages", "subtitle")}</p>
        </motion.div>

        {/* 对话列表 */}
        {loadingConv ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 rounded-full border-2 border-[#5CC8D6] border-t-transparent animate-spin" />
            <p className="mt-3 text-neutral-500">{t("common", "loading")}</p>
          </div>
        ) : conversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="mx-auto h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-neutral-600" />
            </div>
            <p className="mt-4 text-neutral-400">{t("messages", "noMessages")}</p>
            <p className="mt-1 text-sm text-neutral-600">
              {t("messages", "emptyHint")}
            </p>
            <Link
              href="/find-crew"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#5CC8D6] px-6 py-3 text-sm font-semibold text-[#050505] hover:bg-[#7AD4DF] transition-all"
            >
              {t("messages", "browseTalent")}
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="divide-y divide-white/5 rounded-xl border border-white/10 bg-white/5 overflow-hidden"
          >
            {conversations.map((conv) => (
              <button
                key={conv.partnerId}
                onClick={() => setSelectedConv(conv)}
                className="flex w-full items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left cursor-pointer"
              >
                {/* 头像 */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conv.partnerAvatar}
                    alt={conv.partnerName}
                    className="h-12 w-12 rounded-full bg-neutral-800"
                  />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#5CC8D6] text-[10px] font-bold text-[#050505]">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold truncate ${conv.unreadCount > 0 ? "text-white" : "text-neutral-300"}`}>
                      {conv.partnerName}
                    </h3>
                    <span className="text-xs text-neutral-500 flex-shrink-0 ml-2">
                      {formatRelativeTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#5CC8D6]">{conv.partnerRole}</span>
                  </div>
                  <p className={`mt-1 text-sm truncate ${conv.unreadCount > 0 ? "text-neutral-300" : "text-neutral-500"}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* 聊天面板 */}
      {selectedConv && (
        <RealMessagePanel
          isOpen={!!selectedConv}
          onClose={() => {
            setSelectedConv(null);
            loadConversations(); // 关闭后刷新列表
          }}
          recipientId={selectedConv.partnerId}
          recipientName={selectedConv.partnerName}
          recipientAvatar={selectedConv.partnerAvatar}
          recipientRole={selectedConv.partnerRole}
        />
      )}
    </section>
  );
}
