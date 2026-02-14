"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Save, AlertCircle } from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
import PageBackground from "@/components/PageBackground";

interface ProfileFormData {
  fullName: string;
  displayName: string;
  bio: string;
  role: string;
  equipment: string[];
  styles: string[];
}

const AVAILABLE_ROLES = ["摄影师", "灯光师", "录音师", "剪辑师", "美术师", "导演", "制片"];
const AVAILABLE_EQUIPMENT = [
  "Sony FX3",
  "Sony FX30",
  "DJI Pocket 3",
  "无人机",
  "稳定器",
  "灯光组",
  "录音设备",
  "有车",
];
const AVAILABLE_STYLES = [
  "日系",
  "赛博",
  "胶片",
  "纪实",
  "复古",
  "极简",
  "梦幻",
  "暗黑",
];

export default function ProfilePage() {
  const { user, session, loading } = useContext(AuthContext);
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    displayName: "",
    bio: "",
    role: "",
    equipment: [],
    styles: [],
  });

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
    }
  }, [session, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleArrayField = (field: "equipment" | "styles", value: string) => {
    setFormData((prev) => {
      const currentArray = prev[field];
      if (currentArray.includes(value)) {
        return {
          ...prev,
          [field]: currentArray.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          [field]: [...currentArray, value],
        };
      }
    });
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMessage("");

    try {
      // TODO: 实际数存储到 Supabase 用户资料表
      // 这里暂时模拟存储成功
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSaveStatus("success");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (error) {
      setSaveStatus("error");
      setErrorMessage("保存失败，请重试");
    }
  };

  if (loading || !session) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <PageBackground />
        <div className="relative z-10 text-white">Loading...</div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#5CC8D6] hover:text-[#7AD4DF] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            返回 Dashboard
          </Link>
        </motion.div>

        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-white md:text-4xl">
            编辑个人资料
          </h1>
          <p className="mt-2 text-neutral-400">
            让其他创作者更好地了解你
          </p>
        </motion.div>

        {/* 表单 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          {/* 错误消息 */}
          {saveStatus === "error" && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* 成功消息 */}
          {saveStatus === "success" && (
            <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>资料保存成功！</p>
            </div>
          )}

          {/* 当前邮箱 */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              账户邮箱
            </label>
            <p className="text-base text-white">{user?.email}</p>
            <p className="mt-1 text-xs text-neutral-500">邮箱无法修改</p>
          </div>

          {/* 全名 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              全名
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="你的全名（例：Hu Haoyu）"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-600 transition-all focus:border-[#5CC8D6] focus:bg-white/10 focus:outline-none"
            />
          </div>

          {/* 显示名称 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              显示名称
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="你希望在平台上显示的名称"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-600 transition-all focus:border-[#5CC8D6] focus:bg-white/10 focus:outline-none"
            />
          </div>

          {/* 个人简介 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              个人简介
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="告诉我们关于你自己... (最多 200 字)"
              maxLength={200}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-600 transition-all focus:border-[#5CC8D6] focus:bg-white/10 focus:outline-none resize-none"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {formData.bio.length}/200
            </p>
          </div>

          {/* 主要职色 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-3">
              主要职色
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all focus:border-[#5CC8D6] focus:bg-white/10 focus:outline-none"
            >
              <option value="">选择你的职色...</option>
              {AVAILABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* 设备 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-3">
              你拥有的设备
            </label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {AVAILABLE_EQUIPMENT.map((equipment) => (
                <button
                  key={equipment}
                  type="button"
                  onClick={() => toggleArrayField("equipment", equipment)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    formData.equipment.includes(equipment)
                      ? "border-[#5CC8D6] bg-[#5CC8D6]/20 text-[#5CC8D6]"
                      : "border border-white/10 bg-white/5 text-neutral-300 hover:border-white/20"
                  }`}
                >
                  {equipment}
                </button>
              ))}
            </div>
          </div>

          {/* 风格偏好 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-3">
              创作风格
            </label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {AVAILABLE_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleArrayField("styles", style)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    formData.styles.includes(style)
                      ? "border-purple-500 bg-purple-500/20 text-purple-400"
                      : "border border-white/10 bg-white/5 text-neutral-300 hover:border-white/20"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#5CC8D6] px-8 py-3 text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {saveStatus === "saving" ? "保存中..." : "保存资料"}
            </button>
            <Link
              href="/dashboard"
              className="flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              取消
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
