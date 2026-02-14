"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Play, MapPin, GraduationCap, Wrench, MessageCircle, LogIn, Shield } from "lucide-react";
import PageBackground from "@/components/PageBackground";
import TagBadge from "@/components/TagBadge";
import CreditScoreCard from "@/components/CreditScoreCard";
import MessagePanel from "@/components/MessagePanel";
import RealMessagePanel from "@/components/RealMessagePanel";
import { useAuth } from "@/contexts/AuthContext";
import { mockCrew } from "@/data/mock-crew";
import {
  fetchProfileById,
  fetchUserPortfolios,
  getDisplayName,
  getAvatarUrl,
  type DbProfile,
  type DbPortfolio,
} from "@/lib/database";
import type { CreditScore } from "@/types";

export default function CrewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const id = params.id as string;

  // 检查是否为 mock crew
  const mockCrewMember = mockCrew.find((c) => c.id === id);

  // 真实用户状态
  const [realProfile, setRealProfile] = useState<DbProfile | null>(null);
  const [portfolios, setPortfolios] = useState<DbPortfolio[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(!mockCrewMember);
  const [notFound, setNotFound] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // 如果不是 mock 用户，从 Supabase 加载
  useEffect(() => {
    if (mockCrewMember) return;

    const loadProfile = async () => {
      setLoadingProfile(true);
      const profile = await fetchProfileById(id);
      if (profile) {
        setRealProfile(profile);
        const works = await fetchUserPortfolios(id);
        setPortfolios(works);
      } else {
        setNotFound(true);
      }
      setLoadingProfile(false);
    };

    loadProfile();
  }, [id, mockCrewMember]);

  // 加载中
  if (loadingProfile) {
    return (
      <section className="relative min-h-screen">
        <PageBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 rounded-full border-2 border-[#5CC8D6] border-t-transparent animate-spin" />
            <p className="mt-3 text-neutral-400">加载中...</p>
          </div>
        </div>
      </section>
    );
  }

  // 未找到
  if (notFound || (!mockCrewMember && !realProfile)) {
    return (
      <section className="relative min-h-screen">
        <PageBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-neutral-400">未找到该创作者</p>
            <Link href="/find-crew" className="mt-4 inline-block text-[#5CC8D6] hover:text-[#7AD4DF]">
              返回人才库
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // 判断是真实用户还是 mock
  const isRealUser = !!realProfile;

  // 统一数据
  const displayName = isRealUser ? getDisplayName(realProfile!) : mockCrewMember!.name;
  const avatarUrl = isRealUser ? getAvatarUrl(realProfile!) : mockCrewMember!.avatarUrl;
  const role = isRealUser ? (realProfile!.role || "创作者") : mockCrewMember!.role;
  const university = isRealUser ? (realProfile!.university || "未设置") : mockCrewMember!.university;
  const location = isRealUser ? (realProfile!.location || "未设置") : mockCrewMember!.location;
  const bio = isRealUser ? (realProfile!.bio || "这个人很懒，什么都没写") : mockCrewMember!.bio;
  const styles = isRealUser ? (realProfile!.styles || []) : mockCrewMember!.styles;
  const equipment = isRealUser
    ? (realProfile!.equipment ? realProfile!.equipment.split(",").map(s => s.trim()) : [])
    : mockCrewMember!.equipment;
  const tags = isRealUser
    ? [location !== "未设置" ? `#${location}` : "", university !== "未设置" ? `#${university}` : ""].filter(Boolean)
    : mockCrewMember!.tags;
  const creditScore: CreditScore = isRealUser
    ? {
        overall: realProfile!.credit_score ?? 80,
        punctuality: 80,
        professionalism: 80,
        skill: 80,
        communication: 80,
        reliability: 80,
        totalProjects: portfolios.length,
        totalReviews: 0,
        reviews: [],
      }
    : mockCrewMember!.creditScore;
  const coverImage = isRealUser ? "" : mockCrewMember!.coverImage;
  const works = isRealUser ? [] : mockCrewMember!.works;

  const handleInvite = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    // 不能给自己发消息
    if (isRealUser && user.id === realProfile?.id) return;
    setShowChat(true);
  };

  const isSelf = isRealUser && user?.id === realProfile?.id;

  return (
    <section className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        {/* 返回 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/find-crew"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回人才库
          </Link>
        </motion.div>

        {/* 真实用户标记 */}
        {isRealUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400">注册用户</span>
          </motion.div>
        )}

        {/* 主布局 */}
        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          {/* 左栏 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1"
          >
            {/* Showreel / 头像区域 */}
            {isRealUser ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8">
                <div className="flex items-center gap-6">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-24 w-24 rounded-full bg-neutral-800"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                    <p className="mt-1 text-neutral-400">{role}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-amber-400">信用分 {creditScore.overall}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                <div className="relative aspect-video">
                  <img
                    src={coverImage}
                    alt={`${displayName} showreel`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Play className="h-7 w-7 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="text-sm font-medium text-neutral-400">Showreel</h2>
                </div>
              </div>
            )}

            {/* 作品集 - 真实用户从 DB 加载 */}
            {isRealUser && portfolios.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-white">作品集</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {portfolios.map((item) => (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                    >
                      <div className="relative aspect-video">
                        {item.media_type === "image" ? (
                          <img
                            src={item.media_url}
                            alt={item.title}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <video
                            src={item.media_url}
                            className="absolute inset-0 h-full w-full object-cover"
                            muted
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-white">{item.title}</h3>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {item.year && `${item.year}`}
                          {item.role_in_project && ` · ${item.role_in_project}`}
                        </p>
                        {item.description && (
                          <p className="mt-1 text-xs text-neutral-400 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 作品集 - Mock 用户 */}
            {!isRealUser && works.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-white">作品集</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {works.map((work) => (
                    <div
                      key={work.title}
                      className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                    >
                      <div className="relative aspect-video">
                        <img
                          src={work.coverImage}
                          alt={work.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-white">{work.title}</h3>
                        <p className="mt-0.5 text-xs text-neutral-500">{work.year} · {work.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 信用分系统 */}
            <div className="mt-8">
              <CreditScoreCard score={creditScore} name={displayName} />
            </div>
          </motion.div>

          {/* 右栏：个人信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="w-full lg:w-80 shrink-0"
          >
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              {/* 名字 */}
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              {!isRealUser && mockCrewMember && (
                <p className="mt-1 text-xs text-neutral-500">{mockCrewMember.nameReading}</p>
              )}

              {/* 职业 */}
              <div className="mt-4">
                <TagBadge text={role} variant="accent" />
              </div>

              {/* 学校 */}
              <div className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
                <GraduationCap className="h-4 w-4 text-neutral-500" />
                {university}
              </div>

              {/* 地点 */}
              <div className="mt-2 flex items-center gap-2 text-sm text-neutral-400">
                <MapPin className="h-4 w-4 text-neutral-500" />
                {location}
              </div>

              {/* Bio */}
              <p className="mt-4 text-sm text-neutral-300">{bio}</p>

              {/* 风格 */}
              {styles.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-neutral-500 mb-2">风格</p>
                  <div className="flex flex-wrap gap-1.5">
                    {styles.map((s) => (
                      <TagBadge key={s} text={s} variant="accent" />
                    ))}
                  </div>
                </div>
              )}

              {/* 设备 */}
              {equipment.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-neutral-500 mb-2">设备</p>
                  <div className="flex flex-wrap gap-1.5">
                    {equipment.map((e) => (
                      <span
                        key={e}
                        className="flex items-center gap-1 text-xs text-neutral-400"
                      >
                        <Wrench className="h-3 w-3" />
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 标签 */}
              {tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <TagBadge key={tag} text={tag} variant="muted" />
                    ))}
                  </div>
                </div>
              )}

              {/* 邀请合作按钮 */}
              {isSelf ? (
                <Link
                  href="/profile"
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  编辑个人资料
                </Link>
              ) : (
                <button
                  onClick={handleInvite}
                  disabled={loading}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-[#5CC8D6] py-3 text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF] cursor-pointer disabled:opacity-50"
                >
                  {user ? (
                    <>
                      <MessageCircle className="h-4 w-4" />
                      邀请合作
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      登录后邀请合作
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 私信面板 - 真实用户使用实时聊天 */}
      {isRealUser ? (
        <RealMessagePanel
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          recipientId={realProfile!.id}
          recipientName={displayName}
          recipientAvatar={avatarUrl}
          recipientRole={role}
        />
      ) : (
        <MessagePanel
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          recipientName={displayName}
          recipientAvatar={avatarUrl}
          recipientRole={role}
        />
      )}
    </section>
  );
}
