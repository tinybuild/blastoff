-- 0005_collapse_to_three_variants.sql
-- Profile copy variants collapse from 5 directory-named fields to 3 semantic types:
--   tagline (60), tagline_80, tagline_140, description (260), long_description
--   →  title, one_sentence, description
-- The agent regenerates ad-hoc via /api/regenerate when a directory wants a tighter cap.

ALTER TABLE products DROP COLUMN tagline_80;
ALTER TABLE products DROP COLUMN description;
ALTER TABLE products RENAME COLUMN tagline TO title;
ALTER TABLE products RENAME COLUMN tagline_140 TO one_sentence;
ALTER TABLE products RENAME COLUMN long_description TO description;
