-- ============================================================
-- Fitova V3 — Additional Migration
-- Run this AFTER the "subabsae" SQL file
-- Safe to run multiple times (uses IF NOT EXISTS guards)
-- ============================================================

-- ============================================================
-- 1. Add gender column to products
-- ============================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('men', 'women', 'kids', 'unisex'));

CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);

-- ============================================================
-- 2. Add gender array to categories
-- Allows multi-gender categories e.g. "Accessories" → {men, women, kids}
-- ============================================================
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS gender TEXT[] DEFAULT '{}';

-- ============================================================
-- 3. Seed top-level gender categories (Men / Women / Kids)
-- ============================================================
INSERT INTO public.categories (name, slug, sort_order, gender)
VALUES
  ('Men',   'men',   1, '{men}'),
  ('Women', 'women', 2, '{women}'),
  ('Kids',  'kids',  3, '{kids}')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 4. Seed subcategories (linked to gender parents)
-- ============================================================

-- Get men/women/kids IDs dynamically
DO $$
DECLARE
  men_id   UUID;
  women_id UUID;
  kids_id  UUID;
  jackets_id UUID;
  pants_id UUID;
  shoes_id UUID;
  accessories_id UUID;
BEGIN
  SELECT id INTO men_id   FROM public.categories WHERE slug = 'men'   LIMIT 1;
  SELECT id INTO women_id FROM public.categories WHERE slug = 'women' LIMIT 1;
  SELECT id INTO kids_id  FROM public.categories WHERE slug = 'kids'  LIMIT 1;

  -- Men subcategories
  INSERT INTO public.categories (name, slug, parent_id, sort_order, gender)
  VALUES
    ('Jackets',      'men-jackets',      men_id, 1, '{men}'),
    ('Pants',        'men-pants',        men_id, 2, '{men}'),
    ('Shirts',       'men-shirts',       men_id, 3, '{men}'),
    ('T-Shirts',     'men-tshirts',      men_id, 4, '{men}'),
    ('Shoes',        'men-shoes',        men_id, 5, '{men}'),
    ('Accessories',  'men-accessories',  men_id, 6, '{men}'),
    ('Activewear',   'men-activewear',   men_id, 7, '{men}')
  ON CONFLICT (slug) DO NOTHING;

  -- Women subcategories
  INSERT INTO public.categories (name, slug, parent_id, sort_order, gender)
  VALUES
    ('Jackets',      'women-jackets',    women_id, 1, '{women}'),
    ('Pants',        'women-pants',      women_id, 2, '{women}'),
    ('Dresses',      'women-dresses',    women_id, 3, '{women}'),
    ('Tops',         'women-tops',       women_id, 4, '{women}'),
    ('Shoes',        'women-shoes',      women_id, 5, '{women}'),
    ('Accessories',  'women-accessories',women_id, 6, '{women}'),
    ('Activewear',   'women-activewear', women_id, 7, '{women}')
  ON CONFLICT (slug) DO NOTHING;

  -- Kids subcategories
  INSERT INTO public.categories (name, slug, parent_id, sort_order, gender)
  VALUES
    ('Pants',        'kids-pants',       kids_id, 1, '{kids}'),
    ('T-Shirts',     'kids-tshirts',     kids_id, 2, '{kids}'),
    ('Shoes',        'kids-shoes',       kids_id, 3, '{kids}'),
    ('Accessories',  'kids-accessories', kids_id, 4, '{kids}')
  ON CONFLICT (slug) DO NOTHING;

END $$;

-- ============================================================
-- 5. Add is_featured + display_order to collections (Lookbook)
-- ============================================================
ALTER TABLE public.collections
  ADD COLUMN IF NOT EXISTS is_featured   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_collections_featured ON public.collections(is_featured)
  WHERE is_featured = true;

-- ============================================================
-- 6. Create affiliate_click_events table
-- Provides per-click affiliate tracking (more granular than just incrementing a counter)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.affiliate_click_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id  TEXT,
  referrer    TEXT,
  clicked_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON public.affiliate_click_events(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date    ON public.affiliate_click_events(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user    ON public.affiliate_click_events(user_id);

-- Enable RLS
ALTER TABLE public.affiliate_click_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_clicks: anyone can insert"
  ON public.affiliate_click_events FOR INSERT WITH CHECK (true);

CREATE POLICY "affiliate_clicks: admin read"
  ON public.affiliate_click_events FOR SELECT USING (public.is_admin());

-- ============================================================
-- 6. RPC: increment_affiliate_click
-- Called by frontend when user clicks "Shop This Look"
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_affiliate_click(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.affiliate_click_events (product_id)
  VALUES (p_id);
END;
$$;

-- ============================================================
-- Done! ✅
-- Run order: subabsae → v3_migration_additional.sql
-- ============================================================
