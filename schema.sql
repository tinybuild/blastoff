-- Directories we submit to
CREATE TABLE IF NOT EXISTS directories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  submit_url TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  auth_type TEXT DEFAULT 'none',
  has_captcha INTEGER DEFAULT 0,
  requires_email_verify INTEGER DEFAULT 0,
  approval_type TEXT DEFAULT 'manual',
  avg_approval_days INTEGER,
  is_free INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- What fields each directory needs
CREATE TABLE IF NOT EXISTS directory_fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  directory_id INTEGER NOT NULL REFERENCES directories(id),
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  is_required INTEGER DEFAULT 1,
  max_length INTEGER,
  notes TEXT
);

-- Products extracted from URLs
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  name TEXT,
  tagline TEXT,
  description TEXT,
  long_description TEXT,
  logo_url TEXT,
  screenshot_url TEXT,
  pricing TEXT,
  category TEXT,
  tags TEXT,
  founder_name TEXT,
  founder_email TEXT,
  twitter_url TEXT,
  github_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Track submissions per product per directory
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  directory_id INTEGER NOT NULL REFERENCES directories(id),
  status TEXT DEFAULT 'not_started',
  submitted_at DATETIME,
  approved_at DATETIME,
  listing_url TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed the directories
INSERT INTO directories (name, url, submit_url, description, category, auth_type, has_captcha, requires_email_verify, approval_type, avg_approval_days, is_free, priority) VALUES
  ('Product Hunt', 'https://producthunt.com', 'https://www.producthunt.com/posts/new', 'The gold standard for product launches. Massive audience, social proof.', 'launch', 'oauth', 1, 1, 'editorial', 1, 1, 100),
  ('Hacker News', 'https://news.ycombinator.com', 'https://news.ycombinator.com/submit', 'Show HN posts reach devs and founders. High engagement if it resonates.', 'community', 'account', 0, 1, 'community', 0, 1, 95),
  ('BetaList', 'https://betalist.com', 'https://betalist.com/submit', 'Early-stage startup discovery. Great for collecting beta signups.', 'launch', 'account', 0, 1, 'editorial', 60, 1, 90),
  ('Indie Hackers', 'https://indiehackers.com', 'https://www.indiehackers.com/products/new', 'Indie founder community. Product listings + community discussion.', 'community', 'account', 0, 1, 'auto', 0, 1, 88),
  ('AlternativeTo', 'https://alternativeto.net', 'https://alternativeto.net/submit/', 'People search for alternatives here. High SEO value.', 'directory', 'account', 0, 1, 'manual', 3, 1, 85),
  ('SaaSHub', 'https://saashub.com', 'https://www.saashub.com/submit', 'SaaS comparison directory with real traffic and SEO authority.', 'directory', 'account', 0, 1, 'manual', 2, 1, 82),
  ('DevHunt', 'https://devhunt.org', 'https://devhunt.org/submit', 'Developer tool launches via GitHub PRs. Dev-focused audience.', 'launch', 'github', 0, 0, 'manual', 2, 1, 80),
  ('There''s an AI for That', 'https://theresanaiforthat.com', 'https://theresanaiforthat.com/submit/', 'Biggest AI tool directory. Essential if your product uses AI.', 'ai', 'none', 0, 0, 'editorial', 7, 1, 78),
  ('Futurepedia', 'https://futurepedia.io', 'https://www.futurepedia.io/submit-tool', 'AI tool directory with editorial review. Paid fast-track available.', 'ai', 'none', 0, 0, 'editorial', 14, 1, 75),
  ('Uneed', 'https://uneed.best', 'https://uneed.best/submit', 'Curated product directory with daily features.', 'launch', 'account', 0, 1, 'editorial', 7, 1, 72),
  ('OpenAlternative', 'https://openalternative.co', 'https://openalternative.co/submit', 'Open-source alternative directory. Great if your tool is OSS.', 'directory', 'none', 0, 0, 'manual', 5, 1, 70),
  ('Peerlist', 'https://peerlist.io', 'https://peerlist.io/launch', 'Growing dev/founder community with product launch features.', 'community', 'account', 0, 1, 'auto', 0, 1, 68),
  ('Launching Next', 'https://launchingnext.com', 'https://www.launchingnext.com/submit/', 'Startup discovery. Free queue is slow, $49 fast-track.', 'launch', 'none', 0, 0, 'editorial', 60, 1, 65),
  ('Microlaunch', 'https://microlaunch.net', 'https://microlaunch.net/submit', 'Daily micro-launches for indie products.', 'launch', 'account', 0, 1, 'editorial', 3, 1, 62),
  ('Goodfirms', 'https://goodfirms.co', 'https://www.goodfirms.co/add-product', 'B2B review site with real authority and enterprise traffic.', 'review', 'account', 1, 1, 'manual', 5, 1, 60),
  ('Tekpon', 'https://tekpon.com', 'https://tekpon.com/get-listed/', 'Software review platform with detailed comparisons.', 'review', 'account', 0, 1, 'manual', 7, 1, 58),
  ('AppSumo', 'https://appsumo.com', 'https://sell.appsumo.com/', 'Lifetime deal marketplace. Real revenue channel, not just listing.', 'marketplace', 'account', 0, 1, 'editorial', 30, 1, 55),
  ('Stacker News', 'https://stacker.news', 'https://stacker.news/post', 'Bitcoin/tech community. Good for dev tools and crypto-adjacent.', 'community', 'account', 0, 0, 'community', 0, 1, 50),
  ('Software Advice', 'https://softwareadvice.com', 'https://www.softwareadvice.com/vendor/signup/', 'Gartner-backed B2B review site. Enterprise credibility.', 'review', 'account', 1, 1, 'manual', 14, 1, 48),
  ('Fazier', 'https://fazier.com', 'https://fazier.com/submit', 'Product launch platform for indie makers.', 'launch', 'account', 0, 1, 'editorial', 3, 1, 45);

-- Seed common fields per directory
-- Product Hunt
INSERT INTO directory_fields (directory_id, field_name, field_label, is_required, max_length, notes) VALUES
  (1, 'name', 'Product Name', 1, 60, NULL),
  (1, 'tagline', 'Tagline', 1, 60, 'Must be under 60 chars'),
  (1, 'description', 'Description', 1, 260, 'Short description for the card'),
  (1, 'logo_url', 'Thumbnail', 1, NULL, '240x240 recommended'),
  (1, 'screenshot_url', 'Gallery Images', 1, NULL, '3+ images, 1270x760'),
  (1, 'url', 'Website URL', 1, NULL, NULL),
  (1, 'category', 'Topics', 1, NULL, 'Pick up to 3'),
  (1, 'twitter_url', 'Twitter', 0, NULL, 'Maker profile');

-- Hacker News
INSERT INTO directory_fields (directory_id, field_name, field_label, is_required, max_length, notes) VALUES
  (2, 'name', 'Title', 1, 80, 'Show HN: [Product Name] – [Tagline]'),
  (2, 'url', 'URL', 1, NULL, NULL),
  (2, 'description', 'Text', 0, NULL, 'Optional body text for self-posts');

-- BetaList
INSERT INTO directory_fields (directory_id, field_name, field_label, is_required, max_length, notes) VALUES
  (3, 'name', 'Startup Name', 1, NULL, NULL),
  (3, 'url', 'URL', 1, NULL, 'Must have a signup/waitlist form'),
  (3, 'tagline', 'One-Sentence Pitch', 1, 140, 'Used on Twitter too'),
  (3, 'description', 'Description', 1, NULL, '2-3 sentences'),
  (3, 'logo_url', 'Logo', 1, NULL, NULL),
  (3, 'screenshot_url', 'Screenshot', 1, NULL, NULL),
  (3, 'founder_name', 'Founder Name', 1, NULL, NULL),
  (3, 'founder_email', 'Founder Email', 1, NULL, NULL);

-- AlternativeTo
INSERT INTO directory_fields (directory_id, field_name, field_label, is_required, max_length, notes) VALUES
  (5, 'name', 'Name', 1, NULL, NULL),
  (5, 'url', 'Website', 1, NULL, NULL),
  (5, 'description', 'Description', 1, NULL, NULL),
  (5, 'category', 'Tags', 1, NULL, 'Freeform tags'),
  (5, 'pricing', 'License', 1, NULL, 'Open Source, Free, Freemium, Paid');

-- SaaSHub
INSERT INTO directory_fields (directory_id, field_name, field_label, is_required, max_length, notes) VALUES
  (6, 'name', 'Product Name', 1, NULL, NULL),
  (6, 'url', 'Website', 1, NULL, NULL),
  (6, 'description', 'Description', 1, NULL, NULL),
  (6, 'pricing', 'Pricing', 1, NULL, NULL),
  (6, 'category', 'Category', 1, NULL, 'Pick from their list');
