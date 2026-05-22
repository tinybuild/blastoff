-- 0006_rollback_three_variants.sql
-- TEMPORARY rollback of 0005 because Cloudflare's assets-upload-session API is down
-- and we can't deploy the new Worker code that matches the new schema. Restoring the
-- old column names so the currently-deployed Worker keeps working.
-- Re-apply 0005 + deploy new code once CF recovers.

ALTER TABLE products RENAME COLUMN description TO long_description;
ALTER TABLE products RENAME COLUMN one_sentence TO tagline_140;
ALTER TABLE products RENAME COLUMN title TO tagline;
ALTER TABLE products ADD COLUMN tagline_80 TEXT;
ALTER TABLE products ADD COLUMN description TEXT;
