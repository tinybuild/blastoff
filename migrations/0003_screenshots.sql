-- 0003_screenshots.sql
-- Add screenshots column to products (JSON array of public R2 URLs)

ALTER TABLE products ADD COLUMN screenshots TEXT DEFAULT '[]';
