-- CineMatch 用户信息表
-- 在 Supabase SQL Editor 中执行这个脚本

-- 1. 创建 profiles 表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  display_name TEXT,
  bio TEXT,
  role TEXT,
  equipment TEXT,
  styles TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. 启用 RLS（行级安全）
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. 创建 RLS 策略 - 用户只能读取和更新自己的数据，但所有人可以查看公开资料
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 创建头像存储桶之后，在 Supabase 仪表板中：
-- 1. 进入 Storage > Buckets
-- 2. 创建一个新桶，名称为 "avatars"
-- 3. 设置公开访问（Public）
-- 4. 在 RLS 政策中添加：
--    - 允许认证用户上传：storage.objects.owner_id = auth.uid()
--    - 允许公开阅读：storage.objects.bucket_id = 'avatars'
