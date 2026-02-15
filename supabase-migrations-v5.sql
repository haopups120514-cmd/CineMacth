-- ============================================================
-- CineMatch V5 数据库迁移
-- 新增：消息支持图片和表情包
-- 请在 Supabase SQL Editor 中执行此脚本
-- ============================================================

-- 1. 给 messages 表添加消息类型和媒体字段
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text';
-- content_type: 'text' | 'image' | 'sticker'

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT DEFAULT '';

-- 2. 创建自定义表情包表
CREATE TABLE IF NOT EXISTS public.stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  name TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_stickers_user ON public.stickers(user_id);

ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;

-- 用户可以查看所有表情包（方便接收方显示）
CREATE POLICY "Everyone can view stickers"
  ON public.stickers
  FOR SELECT
  USING (true);

-- 用户只能上传自己的表情包
CREATE POLICY "Users can insert own stickers"
  ON public.stickers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的表情包
CREATE POLICY "Users can delete own stickers"
  ON public.stickers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 完成！执行后刷新页面确认字段和表已创建
-- ============================================================
