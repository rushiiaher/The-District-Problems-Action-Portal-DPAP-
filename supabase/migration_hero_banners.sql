-- Hero Banners table for dynamic homepage carousel management
CREATE TABLE IF NOT EXISTS hero_banners (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  alt_text     TEXT        NOT NULL DEFAULT 'Hero Banner',
  image_url    TEXT        NOT NULL,
  storage_path TEXT        NOT NULL DEFAULT '',
  link_url     TEXT        NULL,          -- optional redirect URL when banner is clicked
  sort_order   INT         NOT NULL DEFAULT 0,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add link_url to existing table if migration was already run
ALTER TABLE hero_banners ADD COLUMN IF NOT EXISTS link_url TEXT NULL;

-- Index for ordered fetching
CREATE INDEX IF NOT EXISTS hero_banners_sort_order_idx ON hero_banners (sort_order ASC);

-- Storage bucket (REQUIRED — run this too)
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-banners', 'hero-banners', true)
ON CONFLICT (id) DO NOTHING;
