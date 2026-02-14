-- ============================================================
-- CineMatch V2 数据库迁移
-- 新增：私信系统、作品集、信用分、人才库自动注册
-- 请在 Supabase SQL Editor 中执行此脚本
-- ============================================================

-- 1. 为 profiles 表添加新列
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credit_score INTEGER DEFAULT 80;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS university TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 2. 创建私信表
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. 创建作品集表
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  year INTEGER,
  role_in_project TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. 为私信表创建索引
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(sender_id, receiver_id, created_at);

-- 5. 为作品集表创建索引
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON public.portfolios(user_id);

-- 6. 启用 RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- 7. 私信 RLS 策略
-- 用户只能查看自己发送或接收的消息
CREATE POLICY "Users can view own messages"
  ON public.messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 用户只能发送自己的消息
CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- 用户可以标记自己收到的消息为已读
CREATE POLICY "Users can mark received messages as read"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = receiver_id);

-- 8. 作品集 RLS 策略
-- 所有人可以查看作品集
CREATE POLICY "Everyone can view portfolios"
  ON public.portfolios
  FOR SELECT
  USING (true);

-- 用户可以管理自己的作品集
CREATE POLICY "Users can insert own portfolios"
  ON public.portfolios
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios"
  ON public.portfolios
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios"
  ON public.portfolios
  FOR DELETE
  USING (auth.uid() = user_id);

-- 9. 为 portfolios 表创建 updated_at 触发器
DROP TRIGGER IF EXISTS update_portfolios_updated_at ON public.portfolios;
CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 10. 启用 Realtime 用于私信
-- 注意：如果出现错误 "relation already exists"，可以忽略
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================
-- 存储桶设置（需要在 Supabase Dashboard 中手动创建）
-- ============================================================
-- 1. 进入 Storage > Buckets
-- 2. 创建新桶 "portfolio-files"，设置为 Public
-- 3. 添加 RLS 策略：
--    - SELECT: 允许所有人读取 (true)
--    - INSERT: auth.uid()::text = (storage.foldername(name))[1]
--    - UPDATE: auth.uid()::text = (storage.foldername(name))[1]
--    - DELETE: auth.uid()::text = (storage.foldername(name))[1]
