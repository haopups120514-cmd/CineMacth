"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Smile, ImageIcon, Paperclip } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  sendMessage,
  fetchConversation,
  markMessagesRead,
  subscribeToConversation,
  type DbMessage,
} from "@/lib/database";

interface RealMessagePanelProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  recipientRole: string;
}

// 快捷消息模板
const quickMessages = [
  "你好！我正在筹备一个短片项目，想邀请你加入 🎬",
  "Hi！看了你的作品集很喜欢，方便聊聊合作吗？",
  "你好，我们有个周末拍摄计划，感兴趣吗？",
  "想了解一下你的档期和合作方式～",
];

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function RealMessagePanel({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  recipientAvatar,
  recipientRole,
}: RealMessagePanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [input, setInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 打开时加载历史记录
  useEffect(() => {
    if (!isOpen || !user) return;

    const loadHistory = async () => {
      setLoadingHistory(true);
      const history = await fetchConversation(user.id, recipientId);
      setMessages(history);
      setShowQuickReplies(history.length === 0);
      setLoadingHistory(false);

      // 标记消息为已读
      await markMessagesRead(user.id, recipientId);
    };

    loadHistory();
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen, user, recipientId]);

  // 订阅实时消息
  useEffect(() => {
    if (!isOpen || !user) return;

    const unsubscribe = subscribeToConversation(
      user.id,
      recipientId,
      (newMsg) => {
        setMessages((prev) => {
          // 防止重复（自己发的消息已经在本地添加了）
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        // 如果是别人发的，标记为已读
        if (newMsg.sender_id === recipientId) {
          markMessagesRead(user.id, recipientId);
        }
      }
    );

    return unsubscribe;
  }, [isOpen, user, recipientId]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !user || sending) return;

    setSending(true);
    setInput("");
    setShowQuickReplies(false);

    // 乐观更新：先在本地显示
    const optimisticMsg: DbMessage = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: recipientId,
      content: text.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    // 发送到服务器
    const sentMsg = await sendMessage(user.id, recipientId, text.trim());

    if (sentMsg) {
      // 用服务器返回的消息替换临时消息
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? sentMsg : m))
      );
    }

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* 聊天面板 */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0d0d0d]"
          >
            {/* 头部 */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-5 py-4">
              <img
                src={recipientAvatar}
                alt={recipientName}
                className="h-10 w-10 rounded-full bg-neutral-800"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">
                  {recipientName}
                </h3>
                <p className="text-xs text-[#5CC8D6]">{recipientRole}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">在线</span>
              </div>
              <button
                onClick={onClose}
                className="ml-2 rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 消息区域 */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* 加载中 */}
              {loadingHistory && (
                <div className="text-center py-8">
                  <div className="inline-block h-6 w-6 rounded-full border-2 border-[#5CC8D6] border-t-transparent animate-spin" />
                  <p className="mt-2 text-xs text-neutral-500">加载聊天记录...</p>
                </div>
              )}

              {/* 系统提示 */}
              {!loadingHistory && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <img
                    src={recipientAvatar}
                    alt=""
                    className="mx-auto h-16 w-16 rounded-full bg-neutral-800"
                  />
                  <p className="mt-3 text-sm text-white font-medium">
                    {recipientName}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {recipientRole}
                  </p>
                  <div className="mt-4 mx-auto max-w-[280px] rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      👋 向 {recipientName} 发送第一条消息，开始你们的合作之旅！
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 消息列表 */}
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        isMe
                          ? "bg-[#5CC8D6] text-[#050505]"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div
                        className={`mt-1 flex items-center gap-1 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span
                          className={`text-[10px] ${
                            isMe ? "text-[#050505]/50" : "text-neutral-500"
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </span>
                        {isMe && (
                          <span className="text-[10px] text-[#050505]/50">
                            {msg.is_read ? "✓✓ 已读" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* 快捷回复 */}
            <AnimatePresence>
              {showQuickReplies && messages.length === 0 && !loadingHistory && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="border-t border-white/5 px-5 py-3"
                >
                  <p className="text-xs text-neutral-500 mb-2">快捷消息</p>
                  <div className="space-y-2">
                    {quickMessages.map((msg) => (
                      <button
                        key={msg}
                        onClick={() => handleSendMessage(msg)}
                        className="block w-full text-left rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-300 hover:bg-white/10 hover:border-[#5CC8D6]/30 transition-all cursor-pointer"
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 输入区域 */}
            <div className="border-t border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <button className="rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                  <Smile className="h-4 w-4" />
                </button>
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`给 ${recipientName} 发消息...`}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50 transition-colors"
                  />
                </div>
                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim() || sending}
                  className={`rounded-xl p-2.5 transition-all cursor-pointer ${
                    input.trim() && !sending
                      ? "bg-[#5CC8D6] text-[#050505] hover:bg-[#7AD4DF]"
                      : "bg-white/5 text-neutral-600"
                  }`}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
