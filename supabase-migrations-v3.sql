-- ============================================================
-- CineMatch V3 数据库迁移
-- 新增：招聘信息发布模块
-- 请在 Supabase SQL Editor 中执行此脚本
-- ============================================================

-- 1. 创建招聘信息表
CREATE TABLE IF NOT EXISTS public.recruitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  role_needed TEXT NOT NULL,
  location TEXT DEFAULT '',
  compensation TEXT DEFAULT '可谈',
  shoot_date TEXT DEFAULT '',
  status TEXT DEFAULT '招募中',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_recruitments_user ON public.recruitments(user_id);
CREATE INDEX IF NOT EXISTS idx_recruitments_status ON public.recruitments(status);
CREATE INDEX IF NOT EXISTS idx_recruitments_created ON public.recruitments(created_at DESC);

-- 3. 启用 RLS
ALTER TABLE public.recruitments ENABLE ROW LEVEL SECURITY;

-- 4. RLS 策略
-- 所有人可以查看招聘信息
CREATE POLICY "Everyone can view recruitments"
  ON public.recruitments
  FOR SELECT
  USING (true);

-- 用户可以发布自己的招聘信息
CREATE POLICY "Users can insert own recruitments"
  ON public.recruitments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的招聘信息
CREATE POLICY "Users can update own recruitments"
  ON public.recruitments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户可以删除自己的招聘信息
CREATE POLICY "Users can delete own recruitments"
  ON public.recruitments
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. updated_at 触发器
DROP TRIGGER IF EXISTS update_recruitments_updated_at ON public.recruitments;
CREATE TRIGGER update_recruitments_updated_at
  BEFORE UPDATE ON public.recruitments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
