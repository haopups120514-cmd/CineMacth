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
  is_read: boolean;
  created_at: string;
  // 关联数据
  sender?: DbProfile;
  receiver?: DbProfile;
}

export interface DbPortfolio {
  id: string;
  user_id: string;
  title: string;
  description: string;
  media_url: string;
  media_type: string;
  year: number | null;
  role_in_project: string;
  created_at: string;
  updated_at: string;
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
  content: string
): Promise<DbMessage | null> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
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
