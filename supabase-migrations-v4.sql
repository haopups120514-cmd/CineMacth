-- ============================================================
-- CineMatch V4 数据库迁移
-- 新增：招聘申请 + 评分系统
-- 请在 Supabase SQL Editor 中执行此脚本
-- ============================================================

-- 1. 招聘申请表
CREATE TABLE IF NOT EXISTS public.recruitment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id UUID NOT NULL REFERENCES public.recruitments(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  status TEXT DEFAULT '待处理', -- 待处理 / 已接受 / 已拒绝
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(recruitment_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_recruitment ON public.recruitment_applications(recruitment_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.recruitment_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.recruitment_applications(status);

ALTER TABLE public.recruitment_applications ENABLE ROW LEVEL SECURITY;

-- 所有已登录用户可以查看申请
CREATE POLICY "Authenticated users can view applications"
  ON public.recruitment_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- 用户可以创建自己的申请
CREATE POLICY "Users can insert own applications"
  ON public.recruitment_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = applicant_id);

-- 招聘发布者可以更新申请状态
CREATE POLICY "Recruitment owners can update applications"
  ON public.recruitment_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.recruitments
      WHERE id = recruitment_id AND user_id = auth.uid()
    )
    OR auth.uid() = applicant_id
  );

-- 用户可以删除自己的申请
CREATE POLICY "Users can delete own applications"
  ON public.recruitment_applications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = applicant_id);

-- 2. 评分表
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recruitment_id UUID NOT NULL REFERENCES public.recruitments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(reviewer_id, reviewee_id, recruitment_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_recruitment ON public.reviews(recruitment_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看评分
CREATE POLICY "Everyone can view reviews"
  ON public.reviews
  FOR SELECT
  USING (true);

-- 已登录用户可以创建评分
CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- 用户可以更新自己的评分
CREATE POLICY "Users can update own reviews"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id);

-- ============================================================
-- 完成！执行后请刷新页面确认新表已创建
-- ============================================================
