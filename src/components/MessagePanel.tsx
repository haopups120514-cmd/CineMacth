"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Smile, ImageIcon } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
  status?: "sent" | "delivered" | "read";
}

interface MessagePanelProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientAvatar: string;
  recipientRole: string;
}

// 快捷回复模板
const quickMessages = [
  "你好！我正在筹备一个短片项目，想邀请你加入 🎬",
  "Hi！看了你的作品集很喜欢，方便聊聊合作吗？",
  "你好，我们有个周末拍摄计划，感兴趣吗？",
  "想了解一下你的档期和合作方式～",
];

export default function MessagePanel({
  isOpen,
  onClose,
  recipientName,
  recipientAvatar,
  recipientRole,
}: MessagePanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const now = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const myMsg: Message = {
      id: `msg-${Date.now()}`,
      text: text.trim(),
      sender: "me",
      time: now(),
      status: "sent",
    };

    setMessages((prev) => [...prev, myMsg]);
    setInput("");
    setShowQuickReplies(false);

    // 模拟对方已读 + 自动回复
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === myMsg.id ? { ...m, status: "read" } : m))
      );
    }, 1500);

    setTimeout(() => {
      const replies = [
        `谢谢你的邀请！可以先聊聊项目的具体情况吗？`,
        `听起来很有趣！我最近刚好有空，可以详聊。`,
        `你好！麻烦发一下项目的详细信息，我看看时间。`,
        `太好了！我一直想参与这类项目，什么时候方便见面聊？`,
      ];
      const reply: Message = {
        id: `msg-${Date.now() + 1}`,
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: "them",
        time: now(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 2500 + Math.random() * 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
              {/* 系统提示 */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={recipientAvatar}
                    alt=""
                    className="mx-auto h-16 w-16 rounded-full bg-neutral-800"
                  />
                  <p className="mt-3 text-sm text-white font-medium">
                    {recipientName}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {recipientRole} · 通常在 5 分钟内回复
                  </p>
                  <div className="mt-4 mx-auto max-w-[280px] rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      👋 向 {recipientName} 发送第一条消息，开始你们的合作之旅！
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 消息列表 */}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === "me"
                        ? "bg-[#5CC8D6] text-[#050505]"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div
                      className={`mt-1 flex items-center gap-1 ${
                        msg.sender === "me" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span
                        className={`text-[10px] ${
                          msg.sender === "me" ? "text-[#050505]/50" : "text-neutral-500"
                        }`}
                      >
                        {msg.time}
                      </span>
                      {msg.sender === "me" && msg.status && (
                        <span className="text-[10px] text-[#050505]/50">
                          {msg.status === "sent" && "✓"}
                          {msg.status === "delivered" && "✓✓"}
                          {msg.status === "read" && "✓✓ 已读"}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* 快捷回复 */}
            <AnimatePresence>
              {showQuickReplies && messages.length === 0 && (
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
                        onClick={() => sendMessage(msg)}
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
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className={`rounded-xl p-2.5 transition-all cursor-pointer ${
                    input.trim()
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
