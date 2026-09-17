-- Crawler notes for /notebook/[slug], sitemap, Article JSON-LD, and /llms.txt.
-- Not linked from product nav or the homepage. Admin publishes replacements.
-- If the table is missing, crawlers still see seeded notes in lib/marketing/notebook.ts.

CREATE TABLE IF NOT EXISTS marketing_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot TEXT NOT NULL DEFAULT 'notebook',
  locale TEXT NOT NULL DEFAULT 'en',
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  tile TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  sort INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE (locale, slug)
);

CREATE INDEX IF NOT EXISTS idx_marketing_blocks_public
  ON marketing_blocks (slot, locale, published, sort, published_at DESC);

ALTER TABLE marketing_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage marketing blocks" ON marketing_blocks;
CREATE POLICY "Authenticated users can manage marketing blocks"
  ON marketing_blocks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read published marketing blocks" ON marketing_blocks;
CREATE POLICY "Public can read published marketing blocks"
  ON marketing_blocks FOR SELECT
  TO anon, authenticated
  USING (published = true);
