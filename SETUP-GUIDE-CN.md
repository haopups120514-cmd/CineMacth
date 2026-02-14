# CineMatch 用户资料系统设置指南

## 📋 概述

为了让用户资料可以永久保存，需要在 Supabase 中创建数据库表和存储桶。

## 🔧 设置步骤

### 第1步：创建 profiles 表

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 打开文件 `supabase-migrations.sql`
5. 复制全部内容
6. 粘贴到 SQL Editor 中
7. 点击 **Run** 执行

### 第2步：创建 avatars 存储桶

1. 在 Supabase Dashboard 中进入 **Storage**
2. 点击 **Create a new bucket**
3. 输入名称：`avatars`
4. **勾选** "Public bucket" 让用户可以访问 URL
5. 点击 **Create bucket**

### 第3步：验证功能

1. 登录到 CineMatch
2. 进入 Profile 页面（右上角头像）
3. 上传头像 + 填写资料
4. 点击"保存资料"
5. 重新打开页面 → 资料应该被保留

## 📝 支持的功能

✅ **头像上传** - 上传 JPG/PNG，自动保存到 Supabase Storage
✅ **自定义设备** - "你拥有的设备"字段现在支持自由输入
✅ **数据持久化** - 所有信息保存到 Supabase
✅ **首页保留** - 登录后仍可浏览首页
✅ **头像显示** - Navbar 和 Dashboard 展示用户头像

## 🆘 常见问题

**Q: 为什么看不到我上传的头像？**
A: 确保 avatars 存储桶是 Public 的，并且等待几秒刷新页面。

**Q: 保存报错说 table不存在？**
A: 确认已经在 SQL Editor 中执行了 supabase-migrations.sql 文件。

**Q: 设备字段可以输入什么？**
A: 任何内容！例如：
  - Sony FX3, DJI Pocket 3, 稳定器
  - 有车, 录音棚, 灯光组
  - 自由自在的想象！

**Q: 我想用自己上传的头像替代虚拟头像？**
A: 上传一张照片作为头像后保存，系统会自动使用你上传的头像。

## 🚀 下一步优化

以下功能可以后续添加：
- [ ] 用户个人作品集页面
- [ ] 用户搜索和筛选
- [ ] 保存其他创作者为"收藏夹"
- [ ] 项目协作邀请系统
- [ ] 用户评分和反馈系统
