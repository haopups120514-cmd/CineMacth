"use client";

import { useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Save, AlertCircle, Upload } from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
import PageBackground from "@/components/PageBackground";
import { supabase } from "@/lib/supabase";

interface ProfileFormData {
  fullName: string;
  displayName: string;
  bio: string;
  role: string;
  equipment: string;
  styles: string[];
  avatar_url?: string;
}

const AVAILABLE_ROLES = ["摄影师", "灯光师", "录音师", "剪辑师", "美术师", "导演", "制片"];
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    displayName: "",
    bio: "",
    role: "",
    equipment: "",
    styles: [],
    avatar_url: "",
  });

  // 加载用户资料
  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
    } else if (user) {
      loadProfile();
    }
  }, [session, loading, router, user]);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 是 "no rows found" 错误，这是正常的
        throw error;
      }

      if (data) {
        setFormData({
          fullName: data.full_name || "",
          displayName: data.display_name || "",
          bio: data.bio || "",
          role: data.role || "",
          equipment: data.equipment || "",
          styles: data.styles || [],
          avatar_url: data.avatar_url || "",
        });
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url);
        }
      }
    } catch (error) {
      console.error("加载资料失败:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStyle = (style: string) => {
    setFormData((prev) => {
      const styles = prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style];
      return { ...prev, styles };
    });
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMessage("");

    try {
      let avatar_url = formData.avatar_url;

      // 上传头像如果有新文件
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user?.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        avatar_url = publicUrlData.publicUrl;
      }

      // 保存到 profiles 表
      const { error: saveError } = await supabase.from("profiles").upsert({
        id: user?.id,
        email: user?.email,
        full_name: formData.fullName,
        display_name: formData.displayName,
        bio: formData.bio,
        role: formData.role,
        equipment: formData.equipment,
        styles: formData.styles,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString(),
      });

      if (saveError) throw saveError;

      setSaveStatus("success");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (error: any) {
      setSaveStatus("error");
      setErrorMessage(error.message || "保存失败，请重试");
      console.error("保存失败:", error);
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

          {/* 头像上传 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-3">
              个人头像
            </label>
            <div className="flex gap-4 items-start">
              {/* 头像预览 */}
              <div className="relative">
                <div className="w-24 h-24 rounded-xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="头像预览"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white/30 text-3xl">无</div>
                  )}
                </div>
              </div>

              {/* 上传按钮 */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base font-semibold text-white hover:bg-white/10 transition-all"
                >
                  <Upload className="h-5 w-5" />
                  选择头像
                </button>
                <p className="mt-2 text-xs text-neutral-500">
                  支持 JPG、PNG 格式，大小不超过 10MB
                </p>
              </div>
            </div>
          </div>

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

          {/* 设备 - 自定义输入 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              你拥有的设备
            </label>
            <input
              type="text"
              name="equipment"
              value={formData.equipment}
              onChange={handleInputChange}
              placeholder="例如：Sony FX3, DJI Pocket 3, 稳定器（用逗号分隔）"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-600 transition-all focus:border-[#5CC8D6] focus:bg-white/10 focus:outline-none"
            />
            <p className="mt-1 text-xs text-neutral-500">
              可自由输入，多个设备用逗号分隔
            </p>
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
                  onClick={() => toggleStyle(style)}
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
              disabled={saveStatus === "saving" || isLoadingProfile}
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
