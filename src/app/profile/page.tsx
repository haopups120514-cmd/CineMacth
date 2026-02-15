"use client";

import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Save, AlertCircle, Upload, Edit2 } from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageBackground from "@/components/PageBackground";
import PortfolioUpload from "@/components/PortfolioUpload";
import { supabase } from "@/lib/supabase";
import { fetchUserPortfolios, uploadToCloudinary, type DbPortfolio } from "@/lib/database";
import {
  generateRandomUsername,
  isValidUsername,
  canChangeUsername,
  getNextChangeDate,
} from "@/lib/username-generator";

interface ProfileFormData {
  username: string;
  fullName: string;
  displayName: string;
  bio: string;
  role: string;
  equipment: string;
  styles: string[];
  avatar_url?: string;
  location: string;
  university: string;
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
  const { user, session, loading, userProfile } = useContext(AuthContext);
  const { t } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [canChangeUsernameFlag, setCanChangeUsernameFlag] = useState(true);
  const [nextChangeDate, setNextChangeDate] = useState<Date | null>(null);
  const [portfolios, setPortfolios] = useState<DbPortfolio[]>([]);

  const loadPortfolios = useCallback(async () => {
    if (!user) return;
    const items = await fetchUserPortfolios(user.id);
    setPortfolios(items);
  }, [user]);

  useEffect(() => {
    if (user) loadPortfolios();
  }, [user, loadPortfolios]);

  const [formData, setFormData] = useState<ProfileFormData>({
    username: "",
    fullName: "",
    displayName: "",
    bio: "",
    role: "",
    equipment: "",
    styles: [],
    avatar_url: "",
    location: "",
    university: "",
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
        throw error;
      }

      if (data) {
        setFormData({
          username: data.username || "",
          fullName: data.full_name || "",
          displayName: data.display_name || "",
          bio: data.bio || "",
          role: data.role || "",
          equipment: data.equipment || "",
          styles: data.styles || [],
          avatar_url: data.avatar_url || "",
          location: data.location || "",
          university: data.university || "",
        });
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url);
        }
        // 检查用户名修改权限
        if (data.username_changed_at) {
          const canChange = canChangeUsername(data.username_changed_at);
          setCanChangeUsernameFlag(canChange);
          if (!canChange) {
            setNextChangeDate(getNextChangeDate(data.username_changed_at));
          }
        }
      } else {
        // 新用户：生成随机用户名
        const randomUsername = generateRandomUsername();
        setFormData((prev) => ({
          ...prev,
          username: randomUsername,
        }));
      }
    } catch (error: any) {
      console.error("加载资料失败:", error);
      if (error?.code !== "PGRST116") {
        console.error("完整错误信息:", {
          message: error?.message,
          code: error?.code,
          status: error?.status,
          hint: error?.hint,
        });
      }
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

  const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError("");

    // 文件类型检查
    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError(t("profile", "avatarFormatError"));
      return;
    }

    // 文件大小检查
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError(`文件过大（${(file.size / 1024 / 1024).toFixed(1)}MB），最大 5MB`);
      return;
    }

    // 预览
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 立即上传到 Cloudinary
    setAvatarUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      if (url) {
        setAvatarFile(null); // 清除文件，使用 Cloudinary URL
        setFormData((prev) => ({ ...prev, avatar_url: url }));
      } else {
        setAvatarError(t("profile", "avatarUploadFailed"));
        setAvatarPreview(""); // 清除预览
      }
    } catch {
      setAvatarError(t("profile", "avatarUploadError"));
      setAvatarPreview(""); // 清除预览
    } finally {
      setAvatarUploading(false);
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

    // 如果编辑用户名，验证
    if (isEditingUsername) {
      const usernameError = isValidUsername(formData.username);
      if (usernameError) {
        setUsernameError(usernameError);
        setSaveStatus("error");
        setErrorMessage(usernameError);
        return;
      }
      if (!canChangeUsernameFlag) {
        setSaveStatus("error");
        setErrorMessage(t("profile", "usernameLimit"));
        return;
      }
    }

    try {
      const avatar_url = formData.avatar_url;

      // 特殊处理：如果用户名被修改，记录修改时间
      const updateData: any = {
        id: user?.id,
        email: user?.email,
        full_name: formData.fullName,
        display_name: formData.displayName,
        bio: formData.bio,
        role: formData.role,
        equipment: formData.equipment,
        styles: formData.styles,
        avatar_url: avatar_url || null,
        location: formData.location,
        university: formData.university,
        updated_at: new Date().toISOString(),
      };

      if (isEditingUsername) {
        updateData.username = formData.username;
        updateData.username_changed_at = new Date().toISOString();
      } else if (formData.username) {
        updateData.username = formData.username;
      }

      const { error: saveError } = await supabase
        .from("profiles")
        .upsert(updateData);

      if (saveError) throw saveError;

      setSaveStatus("success");
      setIsEditingUsername(false);
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (error: any) {
      setSaveStatus("error");
      // 获取更详细的错误信息
      const errorMsg = error?.message || error?.hint || error?.details || t("profile", "saveFailed");
      setErrorMessage(errorMsg);
      console.error("完整错误信息:", {
        message: error?.message,
        hint: error?.hint,
        details: error?.details,
        code: error?.code,
        status: error?.status,
        fullError: error,
      });
    }
  };

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
            {t("profile", "backToDashboard")}
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
            {t("profile", "title")}
          </h1>
          <p className="mt-2 text-neutral-400">
            {t("profile", "subtitle")}
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
              <p>{t("profile", "saveSuccess")}</p>
            </div>
          )}

          {/* 头像上传 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-3">
              {t("profile", "avatar")}
            </label>
            <div className="flex gap-4 items-start">
              {/* 头像预览 */}
              <div className="relative">
                <div className="w-24 h-24 rounded-xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center relative">
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full border-2 border-[#5CC8D6] border-t-transparent animate-spin" />
                    </div>
                  )}
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={t("profile", "avatarPreview")}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.id}`;
                      }}
                    />
                  ) : formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt={t("profile", "currentAvatar")}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.id}`;
                      }}
                    />
                  ) : (
                    <img
                      src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.id}`}
                      alt={t("profile", "defaultAvatar")}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* 上传按钮 */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base font-semibold text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {avatarUploading ? (
                    <>
                      <div className="h-5 w-5 rounded-full border-2 border-[#5CC8D6] border-t-transparent animate-spin" />
                      {t("profile", "uploading")}
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      {t("profile", "chooseAvatar")}
                    </>
                  )}
                </button>
                {avatarError ? (
                  <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    {avatarError}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-neutral-500">
                    {t("profile", "avatarHint")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 用户名 */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-neutral-300">
                {t("profile", "personalLink")}
              </label>
              {!isEditingUsername && (
                <button
                  onClick={() => {
                    if (canChangeUsernameFlag) {
                      setIsEditingUsername(true);
                      setUsernameError("");
                    }
                  }}
                  disabled={!canChangeUsernameFlag}
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition-all ${
                    canChangeUsernameFlag
                      ? "text-[#5CC8D6] hover:bg-[#5CC8D6]/10 cursor-pointer"
                      : "text-neutral-600 cursor-not-allowed"
                  }`}
                >
                  <Edit2 className="h-3 w-3" />
                  {t("profile", "editLink")}
                </button>
              )}
            </div>

            {isEditingUsername ? (
              <div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <div className="text-xs text-neutral-400 mb-2">
                      cinematch.com/user/
                    </div>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase();
                        setFormData((prev) => ({ ...prev, username: val }));
                        setUsernameError("");
                      }}
                      placeholder={t("profile", "linkPlaceholder")}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-neutral-600 focus:border-[#5CC8D6] focus:bg-white/10 focus:outline-none"
                    />
                    {usernameError && (
                      <p className="mt-1 text-xs text-red-400">{usernameError}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditingUsername(false)}
                    className="px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                  >
                    {t("common", "cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-base text-white font-mono">
                  cinematch.com/user/{formData.username}
                </p>
                {!canChangeUsernameFlag && nextChangeDate && (
                  <p className="mt-2 text-xs text-neutral-500">
                    {t("profile", "nextEditTime")}{nextChangeDate.toLocaleDateString("zh-CN")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 当前邮箱 */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              {t("profile", "email")}
            </label>
            <p className="text-base text-white">{user?.email}</p>
            <p className="mt-1 text-xs text-neutral-500">{t("profile", "emailReadonly")}</p>
          </div>

          {/* 全名 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              {t("profile", "fullName")}
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder={t("profile", "fullNamePlaceholder")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-600 transition-all focus:border-[#5CC8D6] focus:bg-white/10 focus:outline-none"
            />
          </div>

          {/* 显示名称 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              {t("profile", "displayName")}
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder={t("profile", "displayNamePlaceholder")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-600 transition-all focus:border-[#5CC8D6] focus:bg-white/10 focus:outline-none"
            />
          </div>

          {/* 个人简介 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              {t("profile", "bio")}
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder={t("profile", "bioPlaceholder")}
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
              {t("profile", "role")}
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all focus:border-[#5CC8D6] focus:bg-white/10 focus:outline-none"
            >
              <option value="">{t("profile", "rolePlaceholder")}</option>
              {AVAILABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* 所在地区 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              {t("profile", "location")}
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder={t("profile", "locationPlaceholder")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-600 transition-all focus:border-[#5CC8D6] focus:bg-white/10 focus:outline-none"
            />
          </div>

          {/* 学校 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              {t("profile", "school")}
            </label>
            <input
              type="text"
              name="university"
              value={formData.university}
              onChange={handleInputChange}
              placeholder={t("profile", "schoolPlaceholder")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-600 transition-all focus:border-[#5CC8D6] focus:bg-white/10 focus:outline-none"
            />
          </div>

          {/* 设备 - 自定义输入 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              {t("profile", "equipment")}
            </label>
            <input
              type="text"
              name="equipment"
              value={formData.equipment}
              onChange={handleInputChange}
              placeholder={t("profile", "equipmentPlaceholder")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-600 transition-all focus:border-[#5CC8D6] focus:bg-white/10 focus:outline-none"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {t("profile", "equipmentHint")}
            </p>
          </div>

          {/* 风格偏好 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-3">
              {t("profile", "styles")}
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
              {saveStatus === "saving" ? t("profile", "saving") : t("profile", "saveProfile")}
            </button>
            <Link
              href="/dashboard"
              className="flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              {t("common", "cancel")}
            </Link>
          </div>
        </motion.div>

        {/* 作品集管理 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white">{t("profile", "portfolioTitle")}</h2>
              <p className="mt-1 text-sm text-neutral-400">
                {t("profile", "portfolioDesc")}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
              <Upload className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-400">{portfolios.length} {t("profile", "worksCount")}</span>
            </div>
          </div>

          <PortfolioUpload
            portfolios={portfolios}
            onUpdate={loadPortfolios}
          />
        </motion.div>
      </div>
    </section>
  );
}
