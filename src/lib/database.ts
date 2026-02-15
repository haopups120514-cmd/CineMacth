import { supabase } from "./supabase";

// ==================== 类型定义 ====================

export interface DbProfile {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  display_name: string | null;
  bio: string | null;
  role: string | null;
  equipment: string | null;
  styles: string[];
  avatar_url: string | null;
  credit_score: number;
  location: string | null;
  university: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  content_type: string; // 'text' | 'image' | 'sticker'
  media_url: string;
  is_read: boolean;
  created_at: string;
  // 关联数据
  sender?: DbProfile;
  receiver?: DbProfile;
}

export interface DbSticker {
  id: string;
  user_id: string;
  image_url: string;
  name: string;
  created_at: string;
}

export interface DbPortfolio {
  id: string;
  user_id: string;
  title: string;
  description: string;
  media_url: string;
  media_type: string; // "image" | "youtube"
  year: number | null;
  role_in_project: string;
  created_at: string;
  updated_at: string;
}

export interface DbRecruitment {
  id: string;
  user_id: string;
  title: string;
  description: string;
  role_needed: string;
  location: string;
  compensation: string;
  shoot_date: string;
  status: string; // 招募中 / 已招到 / 拍摄中 / 已完成
  created_at: string;
  updated_at: string;
  // 关联
  poster?: DbProfile;
}

export interface DbApplication {
  id: string;
  recruitment_id: string;
  applicant_id: string;
  message: string;
  status: string; // 待处理 / 已接受 / 已拒绝
  created_at: string;
  updated_at: string;
  // 关联
  applicant?: DbProfile;
  recruitment?: DbRecruitment;
}

export interface DbReview {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  recruitment_id: string;
  rating: number;
  comment: string;
  created_at: string;
  // 关联
  reviewer?: DbProfile;
  recruitment?: DbRecruitment;
}

export interface ConversationPreview {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// ==================== 用户资料 ====================

/**
 * 确保用户资料存在（登录时自动调用）
 * 如果用户资料不存在，创建一个默认的
 */
export async function ensureProfile(userId: string, email: string): Promise<DbProfile | null> {
  // 先尝试获取现有资料
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (existing) return existing;

  // 创建新资料（信用分默认80）
  const username = email.split("@")[0].replace(/[^a-z0-9]/gi, "") + Math.floor(Math.random() * 1000);
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email,
      username,
      display_name: email.split("@")[0],
      credit_score: 80,
      is_visible: true,
      styles: [],
    })
    .select()
    .single();

  if (error) {
    console.error("创建用户资料失败:", error);
    return null;
  }

  return data;
}

/**
 * 获取所有可见的用户资料（人才库）
 */
export async function fetchAllProfiles(): Promise<DbProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("获取用户列表失败:", error);
    return [];
  }

  return data || [];
}

/**
 * 根据 ID 获取用户资料
 */
export async function fetchProfileById(userId: string): Promise<DbProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("获取用户资料失败:", error);
    return null;
  }

  return data;
}

// ==================== 私信系统 ====================

/**
 * 发送私信
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  contentType: string = "text",
  mediaUrl: string = ""
): Promise<DbMessage | null> {
  // 文本消息检查频率限制
  if (contentType === "text") {
    const rateCheck = await checkMessageRateLimit(senderId, receiverId);
    if (!rateCheck.allowed) {
      console.warn("私信频率限制:", rateCheck.reason);
      return null;
    }
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      content_type: contentType,
      media_url: mediaUrl,
    })
    .select()
    .single();

  if (error) {
    console.error("发送消息失败:", error);
    return null;
  }

  return data;
}

/**
 * 检查消息发送频率限制
 * 规则：对方未回复前，每天只能发送一条消息
 */
export async function checkMessageRateLimit(
  senderId: string,
  receiverId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 查询今天发给对方的消息
  const { data: todaySent } = await supabase
    .from("messages")
    .select("created_at")
    .eq("sender_id", senderId)
    .eq("receiver_id", receiverId)
    .gte("created_at", todayStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  // 今天没发过，允许
  if (!todaySent || todaySent.length === 0) {
    return { allowed: true };
  }

  // 今天发过了，检查对方是否回复过
  const { data: replyAfter } = await supabase
    .from("messages")
    .select("created_at")
    .eq("sender_id", receiverId)
    .eq("receiver_id", senderId)
    .gt("created_at", todaySent[0].created_at)
    .limit(1);

  if (replyAfter && replyAfter.length > 0) {
    return { allowed: true }; // 对方已回复，允许继续发送
  }

  return { allowed: false, reason: "对方未回复前，每天只能发送一条消息" };
}

/**
 * 获取两个用户之间的聊天记录
 */
export async function fetchConversation(
  userId: string,
  partnerId: string,
  limit = 50
): Promise<DbMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("获取聊天记录失败:", error);
    return [];
  }

  return data || [];
}

/**
 * 标记消息为已读
 */
export async function markMessagesRead(
  receiverId: string,
  senderId: string
): Promise<void> {
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", receiverId)
    .eq("sender_id", senderId)
    .eq("is_read", false);
}

/**
 * 获取用户的所有对话列表
 */
export async function fetchUserConversations(
  userId: string
): Promise<ConversationPreview[]> {
  // 获取与该用户相关的所有消息
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error || !messages) {
    console.error("获取对话列表失败:", error);
    return [];
  }

  // 按对话伙伴分组
  const conversationMap = new Map<string, { lastMsg: DbMessage; unread: number }>();

  for (const msg of messages) {
    const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        lastMsg: msg,
        unread: 0,
      });
    }

    // 统计未读
    if (msg.receiver_id === userId && !msg.is_read) {
      const conv = conversationMap.get(partnerId)!;
      conv.unread++;
    }
  }

  // 获取对话伙伴的资料
  const partnerIds = Array.from(conversationMap.keys());
  if (partnerIds.length === 0) return [];

  const { data: partners } = await supabase
    .from("profiles")
    .select("id, display_name, full_name, username, avatar_url, role")
    .in("id", partnerIds);

  const partnerMap = new Map<string, DbProfile>();
  (partners || []).forEach((p: any) => partnerMap.set(p.id, p));

  // 构建结果
  const previews: ConversationPreview[] = [];
  for (const [partnerId, conv] of conversationMap) {
    const partner = partnerMap.get(partnerId);
    previews.push({
      partnerId,
      partnerName: partner?.display_name || partner?.full_name || partner?.username || "未知用户",
      partnerAvatar: partner?.avatar_url || `https://api.dicebear.com/9.x/adventurer/svg?seed=${partnerId}`,
      partnerRole: partner?.role || "创作者",
      lastMessage: conv.lastMsg.content,
      lastMessageTime: conv.lastMsg.created_at,
      unreadCount: conv.unread,
    });
  }

  // 按最后消息时间排序
  previews.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

  return previews;
}

/**
 * 获取未读消息总数
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .eq("is_read", false);

  if (error) return 0;
  return count || 0;
}

/**
 * 订阅新消息（Supabase Realtime）
 */
export function subscribeToMessages(
  userId: string,
  onNewMessage: (message: DbMessage) => void
) {
  const channel = supabase
    .channel(`messages:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        onNewMessage(payload.new as DbMessage);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * 订阅特定对话的新消息
 */
export function subscribeToConversation(
  userId: string,
  partnerId: string,
  onNewMessage: (message: DbMessage) => void
) {
  const channel = supabase
    .channel(`conv:${userId}:${partnerId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        const msg = payload.new as DbMessage;
        // 只接收这个对话的消息
        if (
          (msg.sender_id === userId && msg.receiver_id === partnerId) ||
          (msg.sender_id === partnerId && msg.receiver_id === userId)
        ) {
          onNewMessage(msg);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ==================== 作品集 ====================

/**
 * 上传作品集文件到 Storage
 */
export async function uploadPortfolioFile(
  userId: string,
  file: File
): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("portfolio-files")
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    console.error("上传文件失败:", uploadError);
    return null;
  }

  const { data } = supabase.storage.from("portfolio-files").getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * 创建作品集条目
 */
export async function createPortfolioItem(item: {
  user_id: string;
  title: string;
  description?: string;
  media_url: string;
  media_type?: string;
  year?: number;
  role_in_project?: string;
}): Promise<DbPortfolio | null> {
  const { data, error } = await supabase
    .from("portfolios")
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error("创建作品记录失败:", error);
    return null;
  }

  return data;
}

/**
 * 获取用户的作品集
 */
export async function fetchUserPortfolios(userId: string): Promise<DbPortfolio[]> {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("获取作品集失败:", error);
    return [];
  }

  return data || [];
}

/**
 * 删除作品集条目
 */
export async function deletePortfolioItem(portfolioId: string): Promise<boolean> {
  const { error } = await supabase
    .from("portfolios")
    .delete()
    .eq("id", portfolioId);

  if (error) {
    console.error("删除作品失败:", error);
    return false;
  }

  return true;
}

// ==================== 辅助函数 ====================

/**
 * 获取用户的显示名称
 */
export function getDisplayName(profile: DbProfile | null): string {
  if (!profile) return "未知用户";
  return profile.display_name || profile.full_name || profile.username || "未知用户";
}

/**
 * 获取用户头像URL
 */
export function getAvatarUrl(profile: DbProfile | null): string {
  if (profile?.avatar_url) return profile.avatar_url;
  const seed = profile?.id || profile?.username || "default";
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;
}

/**
 * 格式化时间为相对时间
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString("zh-CN");
}

// ==================== Cloudinary 图片压缩 ====================

/**
 * 上传图片到 Cloudinary 并自动压缩
 * @param file 文件
 * @param folder 存储文件夹 (默认 cinematch-portfolios)
 * @param maxWidth 最大宽度 (默认 1200)
 */
export async function uploadToCloudinary(
  file: File,
  folder = "cinematch-portfolios",
  maxWidth = 1200
): Promise<string | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error("Cloudinary 配置缺失，请设置环境变量");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Cloudinary 上传失败:", res.status, errorText);
      return null;
    }

    const data = await res.json();
    // 返回自动压缩 + 质量优化的 URL
    const optimizedUrl = data.secure_url.replace(
      "/upload/",
      `/upload/q_auto,f_auto,w_${maxWidth}/`
    );
    return optimizedUrl;
  } catch (err) {
    console.error("Cloudinary 上传异常:", err);
    return null;
  }
}

// ==================== YouTube 工具 ====================

/**
 * 从 YouTube URL 提取视频 ID
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * 获取 YouTube 缩略图
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// ==================== 招聘信息 ====================

/**
 * 发布招聘信息
 */
export async function createRecruitment(item: {
  user_id: string;
  title: string;
  description?: string;
  role_needed: string;
  location?: string;
  compensation?: string;
  shoot_date?: string;
}): Promise<DbRecruitment | null> {
  const { data, error } = await supabase
    .from("recruitments")
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error("发布招聘信息失败:", error);
    return null;
  }

  return data;
}

/**
 * 获取所有招聘信息（含发布者信息）
 */
export async function fetchRecruitments(): Promise<(DbRecruitment & { poster?: DbProfile })[]> {
  const { data, error } = await supabase
    .from("recruitments")
    .select("*")
    .eq("status", "招募中")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("获取招聘信息失败:", error);
    return [];
  }

  // 获取发布者信息
  const userIds = [...new Set(data.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);

  const profileMap = new Map<string, DbProfile>();
  (profiles || []).forEach((p: DbProfile) => profileMap.set(p.id, p));

  return data.map((r) => ({
    ...r,
    poster: profileMap.get(r.user_id) || undefined,
  }));
}

/**
 * 获取用户发布的招聘信息
 */
export async function fetchUserRecruitments(userId: string): Promise<DbRecruitment[]> {
  const { data, error } = await supabase
    .from("recruitments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("获取用户招聘信息失败:", error);
    return [];
  }

  return data || [];
}

/**
 * 删除招聘信息
 */
export async function deleteRecruitment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("recruitments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("删除招聘信息失败:", error);
    return false;
  }

  return true;
}

/**
 * 更新招聘状态
 */
export async function updateRecruitmentStatus(id: string, status: string): Promise<boolean> {
  const { error } = await supabase
    .from("recruitments")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("更新招聘状态失败:", error);
    return false;
  }

  return true;
}

/**
 * 获取所有招聘信息（包含所有状态，用于计划页）
 */
export async function fetchAllRecruitments(): Promise<(DbRecruitment & { poster?: DbProfile })[]> {
  const { data, error } = await supabase
    .from("recruitments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("获取全部招聘信息失败:", error);
    return [];
  }

  const userIds = [...new Set(data.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);

  const profileMap = new Map<string, DbProfile>();
  (profiles || []).forEach((p: DbProfile) => profileMap.set(p.id, p));

  return data.map((r) => ({
    ...r,
    poster: profileMap.get(r.user_id) || undefined,
  }));
}

// ==================== 招聘申请 ====================

/**
 * 发送通知邮件（异步，不阻塞主流程）
 */
async function sendNotification(type: string, data: Record<string, string>) {
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });
  } catch {
    // 邮件发送失败不影响主流程
    console.warn("通知邮件发送失败，不影响申请");
  }
}

/**
 * 申请招聘（含邮件通知）
 */
export async function applyToRecruitment(
  recruitmentId: string,
  applicantId: string,
  message: string = ""
): Promise<DbApplication | null> {
  const { data, error } = await supabase
    .from("recruitment_applications")
    .insert({
      recruitment_id: recruitmentId,
      applicant_id: applicantId,
      message,
    })
    .select()
    .single();

  if (error) {
    console.error("申请招聘失败:", error);
    return null;
  }

  // 异步发送邮件通知（不阻塞返回）
  (async () => {
    try {
      // 获取招聘信息
      const { data: recruitment } = await supabase
        .from("recruitments")
        .select("*")
        .eq("id", recruitmentId)
        .single();

      if (!recruitment) return;

      // 获取发布者和申请者资料
      const [posterResult, applicantResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", recruitment.user_id).single(),
        supabase.from("profiles").select("*").eq("id", applicantId).single(),
      ]);

      const poster = posterResult.data;
      const applicant = applicantResult.data;

      if (poster?.email) {
        sendNotification("recruitment_application", {
          posterEmail: poster.email,
          posterName: getDisplayName(poster),
          applicantName: applicant ? getDisplayName(applicant) : "Someone",
          recruitmentTitle: recruitment.title,
          applicationMessage: message,
        });
      }
    } catch {
      // 忽略通知错误
    }
  })();

  return data;
}

/**
 * 获取某条招聘的所有申请
 */
export async function fetchApplicationsByRecruitment(
  recruitmentId: string
): Promise<(DbApplication & { applicant?: DbProfile })[]> {
  const { data, error } = await supabase
    .from("recruitment_applications")
    .select("*")
    .eq("recruitment_id", recruitmentId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("获取申请列表失败:", error);
    return [];
  }

  const applicantIds = [...new Set(data.map((a) => a.applicant_id))];
  if (applicantIds.length === 0) return data;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", applicantIds);

  const profileMap = new Map<string, DbProfile>();
  (profiles || []).forEach((p: DbProfile) => profileMap.set(p.id, p));

  return data.map((a) => ({
    ...a,
    applicant: profileMap.get(a.applicant_id) || undefined,
  }));
}

/**
 * 获取用户的所有申请（我申请的）
 */
export async function fetchMyApplications(
  userId: string
): Promise<(DbApplication & { recruitment?: DbRecruitment & { poster?: DbProfile } })[]> {
  const { data, error } = await supabase
    .from("recruitment_applications")
    .select("*")
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("获取我的申请失败:", error);
    return [];
  }

  // 获取对应的招聘信息
  const recruitmentIds = [...new Set(data.map((a) => a.recruitment_id))];
  if (recruitmentIds.length === 0) return data;

  const { data: recruitments } = await supabase
    .from("recruitments")
    .select("*")
    .in("id", recruitmentIds);

  const recruitmentMap = new Map<string, DbRecruitment>();
  const posterIds = new Set<string>();
  (recruitments || []).forEach((r: DbRecruitment) => {
    recruitmentMap.set(r.id, r);
    posterIds.add(r.user_id);
  });

  // 获取发布者信息
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", Array.from(posterIds));

  const profileMap = new Map<string, DbProfile>();
  (profiles || []).forEach((p: DbProfile) => profileMap.set(p.id, p));

  return data.map((a) => {
    const rec = recruitmentMap.get(a.recruitment_id);
    return {
      ...a,
      recruitment: rec
        ? { ...rec, poster: profileMap.get(rec.user_id) || undefined }
        : undefined,
    };
  });
}

/**
 * 更新申请状态（接受/拒绝）
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: string
): Promise<boolean> {
  const { error } = await supabase
    .from("recruitment_applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) {
    console.error("更新申请状态失败:", error);
    return false;
  }

  return true;
}

/**
 * 检查用户是否已申请某招聘
 */
export async function checkIfApplied(
  recruitmentId: string,
  applicantId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("recruitment_applications")
    .select("id")
    .eq("recruitment_id", recruitmentId)
    .eq("applicant_id", applicantId)
    .limit(1);

  return (data && data.length > 0) || false;
}

// ==================== 评分系统 ====================

/**
 * 提交评分
 */
export async function submitReview(item: {
  reviewer_id: string;
  reviewee_id: string;
  recruitment_id: string;
  rating: number;
  comment?: string;
}): Promise<DbReview | null> {
  const { data, error } = await supabase
    .from("reviews")
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error("提交评分失败:", error);
    return null;
  }

  // 更新被评分者的信用分（根据评分调整）
  await updateCreditScore(item.reviewee_id);

  return data;
}

/**
 * 获取用户收到的评分
 */
export async function fetchUserReviews(
  userId: string
): Promise<(DbReview & { reviewer?: DbProfile; recruitment?: DbRecruitment })[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("获取评分失败:", error);
    return [];
  }

  // 获取评分者信息和招聘信息
  const reviewerIds = [...new Set(data.map((r) => r.reviewer_id))];
  const recruitmentIds = [...new Set(data.map((r) => r.recruitment_id))];

  const [profilesRes, recruitmentsRes] = await Promise.all([
    supabase.from("profiles").select("*").in("id", reviewerIds),
    supabase.from("recruitments").select("*").in("id", recruitmentIds),
  ]);

  const profileMap = new Map<string, DbProfile>();
  (profilesRes.data || []).forEach((p: DbProfile) => profileMap.set(p.id, p));

  const recruitmentMap = new Map<string, DbRecruitment>();
  (recruitmentsRes.data || []).forEach((r: DbRecruitment) => recruitmentMap.set(r.id, r));

  return data.map((r) => ({
    ...r,
    reviewer: profileMap.get(r.reviewer_id) || undefined,
    recruitment: recruitmentMap.get(r.recruitment_id) || undefined,
  }));
}

/**
 * 检查是否已评分
 */
export async function checkIfReviewed(
  reviewerId: string,
  revieweeId: string,
  recruitmentId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("reviews")
    .select("id")
    .eq("reviewer_id", reviewerId)
    .eq("reviewee_id", revieweeId)
    .eq("recruitment_id", recruitmentId)
    .limit(1);

  return (data && data.length > 0) || false;
}

/**
 * 检查用户是否有资格评分（必须是已完成招聘的参与者）
 */
export async function canReview(
  reviewerId: string,
  revieweeId: string,
  recruitmentId: string
): Promise<boolean> {
  // 获取招聘信息
  const { data: recruitment } = await supabase
    .from("recruitments")
    .select("user_id, status")
    .eq("id", recruitmentId)
    .single();

  if (!recruitment || recruitment.status !== "已完成") return false;

  const isOwner = recruitment.user_id === reviewerId;
  const isRevieweeOwner = recruitment.user_id === revieweeId;

  if (isOwner) {
    // 招聘发布者评价已接受的申请人
    const { data } = await supabase
      .from("recruitment_applications")
      .select("id")
      .eq("recruitment_id", recruitmentId)
      .eq("applicant_id", revieweeId)
      .eq("status", "已接受")
      .limit(1);
    return (data && data.length > 0) || false;
  } else if (isRevieweeOwner) {
    // 申请人评价招聘发布者
    const { data } = await supabase
      .from("recruitment_applications")
      .select("id")
      .eq("recruitment_id", recruitmentId)
      .eq("applicant_id", reviewerId)
      .eq("status", "已接受")
      .limit(1);
    return (data && data.length > 0) || false;
  }

  return false;
}

/**
 * 更新用户信用分（基于收到的评分平均值）
 */
async function updateCreditScore(userId: string): Promise<void> {
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", userId);

  if (!reviews || reviews.length === 0) return;

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  // 信用分 = 基础60 + 评分均值 * 8 (最高100)
  const creditScore = Math.min(100, Math.round(60 + avg * 8));

  await supabase
    .from("profiles")
    .update({ credit_score: creditScore })
    .eq("id", userId);
}

// ==================== 表情包 ====================

/**
 * 获取用户的自定义表情包
 */
export async function fetchUserStickers(userId: string): Promise<DbSticker[]> {
  const { data, error } = await supabase
    .from("stickers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("获取表情包失败:", error);
    return [];
  }

  return data || [];
}

/**
 * 上传自定义表情包
 */
export async function uploadSticker(
  userId: string,
  imageUrl: string,
  name: string = ""
): Promise<DbSticker | null> {
  const { data, error } = await supabase
    .from("stickers")
    .insert({ user_id: userId, image_url: imageUrl, name })
    .select()
    .single();

  if (error) {
    console.error("上传表情包失败:", error);
    return null;
  }

  return data;
}

/**
 * 删除表情包
 */
export async function deleteSticker(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("stickers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("删除表情包失败:", error);
    return false;
  }

  return true;
}
