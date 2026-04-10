-- Hero Banners table for dynamic homepage carousel management
CREATE TABLE IF NOT EXISTS hero_banners (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  alt_text    TEXT        NOT NULL DEFAULT 'Hero Banner',
  image_url   TEXT        NOT NULL,
  storage_path TEXT       NOT NULL DEFAULT '',
  sort_order  INT         NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for ordered fetching
CREATE INDEX IF NOT EXISTS hero_banners_sort_order_idx ON hero_banners (sort_order ASC);

-- Storage bucket (REQUIRED — run this too)
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-banners', 'hero-banners', true)
ON CONFLICT (id) DO NOTHING;
