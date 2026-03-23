-- 1. 确保表存在
CREATE TABLE IF NOT EXISTS kv_store_a5bad527 (
  key TEXT PRIMARY KEY,
  value JSONB
);

-- 2. 强制重置表的所有权和权限
ALTER TABLE kv_store_a5bad527 OWNER TO postgres;
GRANT ALL ON TABLE kv_store_a5bad527 TO postgres;
GRANT ALL ON TABLE kv_store_a5bad527 TO anon;
GRANT ALL ON TABLE kv_store_a5bad527 TO authenticated;
GRANT ALL ON TABLE kv_store_a5bad527 TO service_role;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- 3. 彻底禁用并重新启用 RLS
ALTER TABLE kv_store_a5bad527 DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON kv_store_a5bad527;
DROP POLICY IF EXISTS "Allow public read access" ON kv_store_a5bad527;
DROP POLICY IF EXISTS "Allow public insert/update access" ON kv_store_a5bad527;
DROP POLICY IF EXISTS "Allow public update access" ON kv_store_a5bad527;
DROP POLICY IF EXISTS "Allow public delete access" ON kv_store_a5bad527;
DROP POLICY IF EXISTS "Public Access Policy" ON kv_store_a5bad527;

ALTER TABLE kv_store_a5bad527 ENABLE ROW LEVEL SECURITY;

-- 4. 创建唯一的全权策略（使用最宽的权限定义）
CREATE POLICY "Public Access Policy" 
ON kv_store_a5bad527 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- 显式为 Supabase 角色创建策略，避免某些环境下 public 不生效
DROP POLICY IF EXISTS "Anon Access Policy" ON kv_store_a5bad527;
DROP POLICY IF EXISTS "Authenticated Access Policy" ON kv_store_a5bad527;
CREATE POLICY "Anon Access Policy"
ON kv_store_a5bad527
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated Access Policy"
ON kv_store_a5bad527
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
