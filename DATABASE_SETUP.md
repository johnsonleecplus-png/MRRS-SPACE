# 数据库配置指南

由于原来的 Supabase 项目已失效，您需要重新创建一个项目并配置数据库。

## 1. 创建 Supabase 项目
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard) 并登录。
2. 点击 **"New Project"** 创建一个新项目。
3. 等待数据库初始化完成（通常需要几分钟）。

## 2. 获取配置信息
1. 进入项目设置 (Project Settings) -> **API**。
2. 找到 **Project URL** 和 **Project API keys**。
3. 复制 `Project URL` 中的 ID 部分（例如 `https://xyz.supabase.co` 中的 `xyz`）或者直接复制整个 URL 提取 ID。
4. 复制 `anon` / `public` key。

## 3. 配置本地环境
1. 在本项目根目录找到 `.env` 文件。
2. 填入您的信息：
   ```env
   VITE_SUPABASE_PROJECT_ID=您的项目ID
   VITE_SUPABASE_ANON_KEY=您的anon_key
   ```
   *注意：不需要加引号。*

## 4. 初始化数据库表
1. 在 Supabase Dashboard 左侧菜单点击 **SQL Editor**。
2. 点击 **"New Query"**。
3. 复制本项目中 `supabase/schema.sql` 文件的全部内容。
4. 粘贴到 SQL 编辑器中并点击 **Run**。

## 5. 验证
1. 重启本地开发服务器：`npm run dev`。
2. 刷新页面，右上角的“离线保存”应该会变为“云端同步开启”。
