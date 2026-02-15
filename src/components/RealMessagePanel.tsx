"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Smile, ImageIcon, Plus, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  sendMessage,
  fetchConversation,
  markMessagesRead,
  subscribeToConversation,
  checkMessageRateLimit,
  uploadToCloudinary,
  fetchUserStickers,
  uploadSticker,
  deleteSticker,
  type DbMessage,
  type DbSticker,
} from "@/lib/database";

interface RealMessagePanelProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  recipientRole: string;
}



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
  const { t } = useLanguage();

  const quickMessages = [
    t("messagePanel", "quick1"),
    t("messagePanel", "quick2"),
    t("messagePanel", "quick3"),
    t("messagePanel", "quick4"),
  ];

  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [input, setInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [rateLimitError, setRateLimitError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);

  // 图片上传
  const [uploadingImage, setUploadingImage] = useState(false);

  // 表情包面板
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [stickers, setStickers] = useState<DbSticker[]>([]);
  const [loadingStickers, setLoadingStickers] = useState(false);
  const [uploadingSticker, setUploadingSticker] = useState(false);

  // 图片预览弹窗
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        if (newMsg.sender_id === recipientId) {
          markMessagesRead(user.id, recipientId);
        }
      }
    );

    return unsubscribe;
  }, [isOpen, user, recipientId]);

  // 加载表情包
  const loadStickers = useCallback(async () => {
    if (!user) return;
    setLoadingStickers(true);
    const data = await fetchUserStickers(user.id);
    setStickers(data);
    setLoadingStickers(false);
  }, [user]);

  useEffect(() => {
    if (showStickerPanel && user) {
      loadStickers();
    }
  }, [showStickerPanel, user, loadStickers]);

  // 发送文本消息
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !user || sending) return;

    setRateLimitError("");
    const rateCheck = await checkMessageRateLimit(user.id, recipientId);
    if (!rateCheck.allowed) {
      setRateLimitError(rateCheck.reason || t("messagePanel", "rateLimited"));
      return;
    }

    setSending(true);
    setInput("");
    setShowQuickReplies(false);

    const optimisticMsg: DbMessage = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: recipientId,
      content: text.trim(),
      content_type: "text",
      media_url: "",
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const sentMsg = await sendMessage(user.id, recipientId, text.trim(), "text", "");

    if (sentMsg) {
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? sentMsg : m))
      );
    }

    setSending(false);
  };

  // 发送图片
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      setRateLimitError(t("messagePanel", "imageSizeError"));
      return;
    }

    setUploadingImage(true);
    setShowQuickReplies(false);

    const previewUrl = URL.createObjectURL(file);
    const optimisticMsg: DbMessage = {
      id: `temp-img-${Date.now()}`,
      sender_id: user.id,
      receiver_id: recipientId,
      content: t("messagePanel", "imageLabel"),
      content_type: "image",
      media_url: previewUrl,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const cloudUrl = await uploadToCloudinary(file);

    if (cloudUrl) {
      const sentMsg = await sendMessage(user.id, recipientId, t("messagePanel", "imageLabel"), "image", cloudUrl);
      if (sentMsg) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? sentMsg : m))
        );
      }
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setRateLimitError(t("messagePanel", "imageUploadFailed"));
    }

    URL.revokeObjectURL(previewUrl);
    setUploadingImage(false);
    e.target.value = "";
  };

  // 发送表情包
  const handleSendSticker = async (sticker: DbSticker) => {
    if (!user || sending) return;

    setShowStickerPanel(false);
    setShowQuickReplies(false);

    const optimisticMsg: DbMessage = {
      id: `temp-stk-${Date.now()}`,
      sender_id: user.id,
      receiver_id: recipientId,
      content: sticker.name || t("messagePanel", "stickerLabel"),
      content_type: "sticker",
      media_url: sticker.image_url,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const sentMsg = await sendMessage(
      user.id,
      recipientId,
      sticker.name || t("messagePanel", "stickerLabel"),
      "sticker",
      sticker.image_url
    );

    if (sentMsg) {
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? sentMsg : m))
      );
    }
  };

  // 上传新表情包
  const handleStickerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      setRateLimitError(t("messagePanel", "stickerSizeError"));
      return;
    }

    setUploadingSticker(true);
    const cloudUrl = await uploadToCloudinary(file);

    if (cloudUrl) {
      const name = file.name.replace(/\.[^/.]+$/, "");
      const sticker = await uploadSticker(user.id, cloudUrl, name);
      if (sticker) {
        setStickers((prev) => [sticker, ...prev]);
      }
    }

    setUploadingSticker(false);
    e.target.value = "";
  };

  // 删除表情包
  const handleDeleteSticker = async (id: string) => {
    const ok = await deleteSticker(id);
    if (ok) {
      setStickers((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  // 渲染消息内容
  const renderMessageContent = (msg: DbMessage) => {
    const type = msg.content_type || "text";

    if (type === "image" && msg.media_url) {
      return (
        <div className="cursor-pointer" onClick={() => setPreviewImage(msg.media_url)}>
          <img
            src={msg.media_url}
            alt={t("messagePanel", "imageAlt")}
            className="max-w-[240px] max-h-[200px] rounded-lg object-cover"
          />
        </div>
      );
    }

    if (type === "sticker" && msg.media_url) {
      return (
        <img
          src={msg.media_url}
          alt={msg.content || t("messagePanel", "stickerAlt")}
          className="w-24 h-24 object-contain"
        />
      );
    }

    return <p className="text-sm leading-relaxed">{msg.content}</p>;
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

          {/* 图片预览弹窗 */}
          {previewImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md"
              onClick={() => setPreviewImage(null)}
            >
              <img
                src={previewImage}
                alt={t("messagePanel", "previewAlt")}
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-6 right-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </motion.div>
          )}

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
                <span className="text-xs text-emerald-400">{t("common", "online")}</span>
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
              {loadingHistory && (
                <div className="text-center py-8">
                  <div className="inline-block h-6 w-6 rounded-full border-2 border-[#5CC8D6] border-t-transparent animate-spin" />
                  <p className="mt-2 text-xs text-neutral-500">{t("messagePanel", "loadingHistory")}</p>
                </div>
              )}

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
                      {t("messagePanel", "emptyChat").replace("{name}", recipientName)}
                    </p>
                  </div>
                </motion.div>
              )}

              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                const msgType = msg.content_type || "text";
                const isBubbleless = msgType === "sticker";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        isBubbleless
                          ? ""
                          : `rounded-2xl px-4 py-2.5 ${
                              isMe
                                ? "bg-[#5CC8D6] text-[#050505]"
                                : "bg-white/10 text-white"
                            }`
                      }`}
                    >
                      {renderMessageContent(msg)}
                      <div
                        className={`mt-1 flex items-center gap-1 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span
                          className={`text-[10px] ${
                            isMe && !isBubbleless
                              ? "text-[#050505]/50"
                              : "text-neutral-500"
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </span>
                        {isMe && (
                          <span
                            className={`text-[10px] ${
                              isBubbleless
                                ? "text-neutral-500"
                                : "text-[#050505]/50"
                            }`}
                          >
                            {msg.is_read ? t("messagePanel", "read") : t("messagePanel", "sent")}
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
                  <p className="text-xs text-neutral-500 mb-2">{t("messagePanel", "quickMessages")}</p>
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

            {/* 表情包面板 */}
            <AnimatePresence>
              {showStickerPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="border-t border-white/10 bg-[#111] px-4 py-3 max-h-[220px] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-neutral-500">{t("messagePanel", "myStickers")}</p>
                    <div className="flex items-center gap-2">
                      <input
                        ref={stickerInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleStickerUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => stickerInputRef.current?.click()}
                        disabled={uploadingSticker}
                        className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-[10px] text-neutral-400 hover:bg-white/10 cursor-pointer disabled:opacity-50"
                      >
                        {uploadingSticker ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                        {t("messagePanel", "addSticker")}
                      </button>
                    </div>
                  </div>

                  {loadingStickers ? (
                    <div className="text-center py-4">
                      <div className="inline-block h-5 w-5 rounded-full border-2 border-[#5CC8D6] border-t-transparent animate-spin" />
                    </div>
                  ) : stickers.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-neutral-600">{t("messagePanel", "noStickers")}</p>
                      <button
                        onClick={() => stickerInputRef.current?.click()}
                        className="mt-2 text-xs text-[#5CC8D6] hover:text-[#7AD4DF] cursor-pointer"
                      >
                        {t("messagePanel", "uploadFirst")}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {stickers.map((s) => (
                        <div key={s.id} className="relative group">
                          <button
                            onClick={() => handleSendSticker(s)}
                            className="w-full aspect-square rounded-lg bg-white/5 border border-white/10 hover:border-[#5CC8D6]/30 overflow-hidden flex items-center justify-center cursor-pointer transition-all"
                          >
                            <img
                              src={s.image_url}
                              alt={s.name || t("messagePanel", "stickerAlt")}
                              className="w-full h-full object-contain p-1"
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSticker(s.id);
                            }}
                            className="absolute -top-1 -right-1 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white cursor-pointer"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 输入区域 */}
            <div className="border-t border-white/10 bg-white/5 px-4 py-3">
              {rateLimitError && (
                <div className="mb-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-400">
                  ⚠️ {rateLimitError}
                </div>
              )}
              <div className="flex items-center gap-2">
                {/* 图片按钮 */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  title={t("messagePanel", "sendImage")}
                >
                  {uploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#5CC8D6]" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                </button>

                {/* 表情包按钮 */}
                <button
                  onClick={() => setShowStickerPanel(!showStickerPanel)}
                  className={`rounded-lg p-2 transition-colors cursor-pointer ${
                    showStickerPanel
                      ? "bg-[#5CC8D6]/15 text-[#5CC8D6]"
                      : "text-neutral-400 hover:bg-white/10 hover:text-white"
                  }`}
                  title={t("messagePanel", "stickersTitle")}
                >
                  <Smile className="h-4 w-4" />
                </button>

                {/* 文本输入 */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowStickerPanel(false)}
                    placeholder={t("messagePanel", "inputPlaceholder").replace("{name}", recipientName)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50 transition-colors"
                  />
                </div>

                {/* 发送按钮 */}
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
