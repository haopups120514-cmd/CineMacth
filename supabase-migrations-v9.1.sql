-- ============================================
-- CineMatch V9.1: 公告系统 (Announcements)
-- 请在 Supabase SQL Editor 中执行
-- ============================================

-- 1. 创建 announcements 表
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 索引
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(is_pinned DESC, created_at DESC);

-- 3. RLS 策略
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看公告
CREATE POLICY "Anyone can view announcements"
  ON announcements FOR SELECT
  USING (true);

-- 只有作者可以插入
CREATE POLICY "Author can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- 只有作者可以更新
CREATE POLICY "Author can update own announcements"
  ON announcements FOR UPDATE
  USING (auth.uid() = author_id);

-- 只有作者可以删除
CREATE POLICY "Author can delete own announcements"
  ON announcements FOR DELETE
  USING (auth.uid() = author_id);
