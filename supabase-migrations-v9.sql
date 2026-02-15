-- ==================== V9: 评分系统（多维度） + 招聘申请表 ====================
-- 请在 Supabase SQL Editor 中执行此文件

-- 1. 创建招聘申请表（如果不存在）
CREATE TABLE IF NOT EXISTS public.recruitment_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recruitment_id UUID NOT NULL REFERENCES public.recruitments(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  status TEXT DEFAULT '待处理', -- 待处理 / 已接受 / 已拒绝
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(recruitment_id, applicant_id) -- 同一用户不能重复申请
);

-- 2. 创建评分表（多维度）
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recruitment_id UUID NOT NULL REFERENCES public.recruitments(id) ON DELETE CASCADE,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0, -- 总评分（各维度平均）
  punctuality SMALLINT NOT NULL DEFAULT 3 CHECK (punctuality >= 1 AND punctuality <= 5), -- 守时度
  professionalism SMALLINT NOT NULL DEFAULT 3 CHECK (professionalism >= 1 AND professionalism <= 5), -- 专业度
  skill SMALLINT NOT NULL DEFAULT 3 CHECK (skill >= 1 AND skill <= 5), -- 技能
  communication SMALLINT NOT NULL DEFAULT 3 CHECK (communication >= 1 AND communication <= 5), -- 沟通
  reliability SMALLINT NOT NULL DEFAULT 3 CHECK (reliability >= 1 AND reliability <= 5), -- 可靠性
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(reviewer_id, reviewee_id, recruitment_id) -- 同一项目中一人只能评一次
);

-- 3. RLS 策略 - recruitment_applications
ALTER TABLE public.recruitment_applications ENABLE ROW LEVEL SECURITY;

-- 所有人可读
CREATE POLICY "recruitment_applications_select" ON public.recruitment_applications
  FOR SELECT TO authenticated USING (true);

-- 只有申请人可创建
CREATE POLICY "recruitment_applications_insert" ON public.recruitment_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = applicant_id);

-- 只有招聘发布者可更新状态
CREATE POLICY "recruitment_applications_update" ON public.recruitment_applications
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.recruitments
      WHERE id = recruitment_applications.recruitment_id
      AND user_id = auth.uid()
    )
  );

-- 4. RLS 策略 - reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 所有人可读评分
CREATE POLICY "reviews_select" ON public.reviews
  FOR SELECT USING (true);

-- 登录用户可以写评分
CREATE POLICY "reviews_insert" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- 5. 索引
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_recruitment ON public.reviews(recruitment_id);
CREATE INDEX IF NOT EXISTS idx_applications_recruitment ON public.recruitment_applications(recruitment_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.recruitment_applications(applicant_id);
