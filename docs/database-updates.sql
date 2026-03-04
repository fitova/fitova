-- ============================================================
-- FITOVA v5 — Database Updates
-- Date: 2026-03-03
-- Run in: Supabase SQL Editor (psql compatible)
-- IMPORTANT: Run in order. Each section is idempotent.
-- ============================================================


-- ============================================================
-- SECTION 1: CATEGORIES TABLE — Hierarchy Restructure
-- ============================================================

-- NOTE: categories.gender already exists as TEXT[] in the schema.
-- We do NOT add it again. We only add new columns: piece_type and icon_url.

-- 1.1 Add piece_type column (maps to product piece_type for filter logic)
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS piece_type TEXT DEFAULT NULL;

-- 1.2 Add icon_url for navbar display
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT NULL;

-- 1.3 parent_id already exists in schema — no change needed.

-- 1.4 Insert root-level parent categories (Men, Women, Kids)
-- gender is TEXT[] in this table → use array literal syntax: '{men}'
-- ON CONFLICT (slug) DO NOTHING keeps existing rows intact.
INSERT INTO categories (name, slug, sort_order, gender, parent_id)
VALUES
  ('Men',   'men',   1, '{men}',   NULL),
  ('Women', 'women', 2, '{women}', NULL),
  ('Kids',  'kids',  3, '{kids}',  NULL)
ON CONFLICT (slug) DO NOTHING;

-- 1.5 Insert subcategories for Men
-- parent_id resolved via subquery — works regardless of which UUID was assigned to 'men'
INSERT INTO categories (name, slug, sort_order, gender, piece_type, parent_id)
SELECT name, slug, sort_order, gender::TEXT[], piece_type,
       (SELECT id FROM categories WHERE slug = 'men')
FROM (VALUES
  ('T-Shirts',    'men-tshirts',     1, '{men}', 'tshirt'),
  ('Shirts',      'men-shirts',      2, '{men}', 'shirt'),
  ('Jackets',     'men-jackets',     3, '{men}', 'jacket'),
  ('Pants',       'men-pants',       4, '{men}', 'pants'),
  ('Shoes',       'men-shoes',       5, '{men}', 'shoes'),
  ('Accessories', 'men-accessories', 6, '{men}', 'accessories'),
  ('Perfumes',    'men-perfumes',    7, '{men}', 'perfume')
) AS v(name, slug, sort_order, gender, piece_type)
ON CONFLICT (slug) DO NOTHING;

-- 1.6 Insert subcategories for Women
INSERT INTO categories (name, slug, sort_order, gender, piece_type, parent_id)
SELECT name, slug, sort_order, gender::TEXT[], piece_type,
       (SELECT id FROM categories WHERE slug = 'women')
FROM (VALUES
  ('Dresses',     'women-dresses',     1, '{women}', 'dress'),
  ('Tops',        'women-tops',        2, '{women}', 'top'),
  ('Skirts',      'women-skirts',      3, '{women}', 'skirt'),
  ('Jackets',     'women-jackets',     4, '{women}', 'jacket'),
  ('Pants',       'women-pants',       5, '{women}', 'pants'),
  ('Shoes',       'women-shoes',       6, '{women}', 'shoes'),
  ('Accessories', 'women-accessories', 7, '{women}', 'accessories'),
  ('Perfumes',    'women-perfumes',    8, '{women}', 'perfume')
) AS v(name, slug, sort_order, gender, piece_type)
ON CONFLICT (slug) DO NOTHING;

-- 1.7 Insert subcategories for Kids
INSERT INTO categories (name, slug, sort_order, gender, piece_type, parent_id)
SELECT name, slug, sort_order, gender::TEXT[], piece_type,
       (SELECT id FROM categories WHERE slug = 'kids')
FROM (VALUES
  ('Tops',        'kids-tops',        1, '{kids}', 'top'),
  ('Pants',       'kids-pants',       2, '{kids}', 'pants'),
  ('Shoes',       'kids-shoes',       3, '{kids}', 'shoes'),
  ('Accessories', 'kids-accessories', 4, '{kids}', 'accessories')
) AS v(name, slug, sort_order, gender, piece_type)
ON CONFLICT (slug) DO NOTHING;

-- 1.8 Index on parent_id for hierarchy lookups
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories (parent_id);

-- 1.9 Index on gender (GIN for TEXT[] array column)
CREATE INDEX IF NOT EXISTS idx_categories_gender ON categories USING GIN (gender);






-- ============================================================
-- SECTION 2: PRODUCTS TABLE — Rating Cache + Tag Support
-- ============================================================

-- 2.1 Add avg_rating cache column
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0.00;

-- 2.2 Add review_count cache column
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 2.3 Composite index for "Complete Your Look" logic
CREATE INDEX IF NOT EXISTS idx_products_gender_piece_type
  ON products (gender, piece_type)
  WHERE is_hidden = false;

-- 2.4 Index for New Arrivals + Trending queries
CREATE INDEX IF NOT EXISTS idx_products_flags
  ON products (is_new_arrival, is_trending, is_bestseller, is_hidden)
  WHERE is_hidden = false;

-- 2.5 Index for category-filtered shop page
CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON products (category_id)
  WHERE is_hidden = false;


-- ============================================================
-- SECTION 3: PRODUCT REVIEWS — Enhancements
-- ============================================================

-- 3.1 Add is_verified flag (admin-approves review)
ALTER TABLE product_reviews
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 3.2 Add review_images array for optional photo attachments
ALTER TABLE product_reviews
  ADD COLUMN IF NOT EXISTS review_images TEXT[] DEFAULT '{}';

-- 3.3 Add helpful_count (users can mark a review as helpful)
ALTER TABLE product_reviews
  ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

-- 3.4 Enforce one review per user per product
ALTER TABLE product_reviews
  DROP CONSTRAINT IF EXISTS unique_review_per_user_product;
ALTER TABLE product_reviews
  ADD CONSTRAINT unique_review_per_user_product UNIQUE (product_id, user_id);

-- 3.5 Index for fetching reviews by product
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id
  ON product_reviews (product_id, created_at DESC);

-- 3.6 Trigger function: refresh product rating cache after review change
CREATE OR REPLACE FUNCTION refresh_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    avg_rating   = COALESCE((
      SELECT AVG(rating)::NUMERIC(3,2)
      FROM product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ), 0.00),
    review_count = (
      SELECT COUNT(*)
      FROM product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3.7 Attach trigger to product_reviews
DROP TRIGGER IF EXISTS trg_refresh_product_rating ON product_reviews;
CREATE TRIGGER trg_refresh_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION refresh_product_rating();

-- 3.8 Backfill existing avg_rating and review_count
UPDATE products p
SET
  avg_rating   = COALESCE((
    SELECT AVG(r.rating)::NUMERIC(3,2)
    FROM product_reviews r
    WHERE r.product_id = p.id
  ), 0.00),
  review_count = COALESCE((
    SELECT COUNT(*)
    FROM product_reviews r
    WHERE r.product_id = p.id
  ), 0);


-- ============================================================
-- SECTION 4: REVIEW HELPFUL VOTES TABLE
-- ============================================================

-- Allows users to mark reviews as helpful (one vote per user per review)
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_helpful_vote UNIQUE (review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id
  ON review_helpful_votes (review_id);


-- ============================================================
-- SECTION 5: CART TABLE
-- ============================================================

-- Persistent cart (server-side) for authenticated users
-- Guest cart is handled purely client-side via localStorage
CREATE TABLE IF NOT EXISTS cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  size        TEXT,
  color       TEXT,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_cart_item UNIQUE (user_id, product_id, size, color)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id
  ON cart_items (user_id);

-- RLS: users can only see/modify their own cart
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY cart_items_select ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY cart_items_insert ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY cart_items_update ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY cart_items_delete ON cart_items
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- SECTION 6: USER SAVED OFFERS TABLE (Coupons & Deals)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_saved_offers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  offer_id   UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  saved_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_saved_offer UNIQUE (user_id, offer_id)
);

CREATE INDEX IF NOT EXISTS idx_user_saved_offers_user_id
  ON user_saved_offers (user_id);

ALTER TABLE user_saved_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_offers_select ON user_saved_offers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY saved_offers_insert ON user_saved_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY saved_offers_delete ON user_saved_offers
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- SECTION 7: LOOKBOOK COMMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS lookbook_comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment       TEXT NOT NULL CHECK (char_length(comment) BETWEEN 1 AND 1000),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lookbook_comments_collection_id
  ON lookbook_comments (collection_id, created_at DESC);

ALTER TABLE lookbook_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY lookbook_comments_select ON lookbook_comments
  FOR SELECT USING (true);  -- public read

CREATE POLICY lookbook_comments_insert ON lookbook_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY lookbook_comments_update ON lookbook_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY lookbook_comments_delete ON lookbook_comments
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- SECTION 8: COLLECTIONS TABLE — Enhancements
-- ============================================================

-- 8.1 Add gender to collections for filtering
ALTER TABLE collections
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('men', 'women', 'kids', 'unisex')) DEFAULT 'unisex';

-- 8.2 Add is_draft flag (for creation flow — save before publish)
ALTER TABLE collections
  ADD COLUMN IF NOT EXISTS is_draft BOOLEAN NOT NULL DEFAULT false;

-- 8.3 Add likes_count cache
ALTER TABLE collections
  ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;

-- 8.4 Index for user's own lookbooks
CREATE INDEX IF NOT EXISTS idx_collections_user_id
  ON collections (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- 8.5 Index for featured lookbooks
CREATE INDEX IF NOT EXISTS idx_collections_featured
  ON collections (is_featured, display_order)
  WHERE is_featured = true;


-- ============================================================
-- SECTION 9: WISHLIST TABLE — RLS Enforcement
-- ============================================================

-- Ensure RLS is active on wishlist (may not have been enabled)
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- NOTE: PostgreSQL does NOT support CREATE POLICY IF NOT EXISTS.
-- Use DROP ... IF EXISTS before each policy for idempotency.

DROP POLICY IF EXISTS wishlist_select ON wishlist;
CREATE POLICY wishlist_select ON wishlist
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS wishlist_insert ON wishlist;
CREATE POLICY wishlist_insert ON wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS wishlist_delete ON wishlist;
CREATE POLICY wishlist_delete ON wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- Index for fast user wishlist lookup
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id
  ON wishlist (user_id, created_at DESC);

-- Unique constraint: no duplicate wishlist items
ALTER TABLE wishlist
  DROP CONSTRAINT IF EXISTS unique_wishlist_item;
ALTER TABLE wishlist
  ADD CONSTRAINT unique_wishlist_item UNIQUE (user_id, item_id, item_type);



-- ============================================================
-- SECTION 10: PROFILES TABLE — Enhancements
-- ============================================================

-- 10.1 Add bio field for profile page
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;

-- 10.2 Add gender preference for default catalog filtering  
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS gender_preference TEXT
    CHECK (gender_preference IN ('men', 'women', 'kids', 'all'))
    DEFAULT 'all';

-- 10.3 Index on email for admin check
CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON profiles (email);


-- ============================================================
-- SECTION 11: PRODUCT VIEWS TABLE — Session Deduplication
-- ============================================================

-- NOTE: date_trunc('hour', timestamptz) is NOT IMMUTABLE (timezone-dependent),
-- so it cannot be used in an index expression.
-- Use two simple indexes instead for lookup performance:

-- Index for authenticated user view deduplication
CREATE INDEX IF NOT EXISTS idx_product_views_user
  ON product_views (product_id, user_id, viewed_at)
  WHERE user_id IS NOT NULL;

-- Index for anonymous session view deduplication
CREATE INDEX IF NOT EXISTS idx_product_views_session
  ON product_views (product_id, session_id, viewed_at)
  WHERE session_id IS NOT NULL AND user_id IS NULL;




-- ============================================================
-- SECTION 12: FUNCTIONS — Complete Your Look RPC
-- ============================================================

-- Returns products for "Complete Your Look" section
-- based on current product's piece_type and gender
CREATE OR REPLACE FUNCTION get_complete_the_look(
  p_product_id   UUID,
  p_piece_type   TEXT,
  p_gender       TEXT,
  p_limit        INTEGER DEFAULT 8
)
RETURNS TABLE (
  id              UUID,
  name            TEXT,
  slug            TEXT,
  price           NUMERIC,
  discounted_price NUMERIC,
  avg_rating      NUMERIC,
  piece_type      TEXT,
  gender          TEXT
) AS $$
DECLARE
  v_suggest_types TEXT[];
BEGIN
  -- Define what to suggest based on the current product type
  v_suggest_types := CASE p_piece_type
    WHEN 'tshirt'      THEN ARRAY['pants', 'shoes', 'accessories']
    WHEN 'top'         THEN ARRAY['pants', 'skirt', 'shoes', 'accessories']
    WHEN 'shirt'       THEN ARRAY['pants', 'shoes', 'accessories']
    WHEN 'dress'       THEN ARRAY['shoes', 'accessories']
    WHEN 'pants'       THEN ARRAY['tshirt', 'top', 'shirt', 'shoes']
    WHEN 'skirt'       THEN ARRAY['top', 'shirt', 'shoes', 'accessories']
    WHEN 'shoes'       THEN ARRAY['tshirt', 'top', 'pants', 'accessories']
    WHEN 'jacket'      THEN ARRAY['tshirt', 'pants', 'shoes']
    WHEN 'accessories' THEN ARRAY['tshirt', 'top', 'pants', 'dress']
    WHEN 'perfume'     THEN ARRAY['tshirt', 'top', 'dress']
    ELSE ARRAY['tshirt', 'pants', 'shoes']
  END;

  RETURN QUERY
  SELECT
    p.id, p.name, p.slug, p.price, p.discounted_price,
    p.avg_rating, p.piece_type, p.gender
  FROM products p
  WHERE
    p.id          <> p_product_id
    AND p.is_hidden = false
    AND p.piece_type = ANY(v_suggest_types)
    AND (p.gender = p_gender OR p.gender = 'unisex' OR p_gender IS NULL)
  ORDER BY p.avg_rating DESC, p.views_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;


-- ============================================================
-- SECTION 13: FUNCTIONS — Trending Score Update
-- ============================================================

-- Already exists: get_trending_products, get_best_sellers
-- Add: get_new_arrivals (for This Week/Navbar section)
CREATE OR REPLACE FUNCTION get_new_arrivals_for_nav(p_limit INTEGER DEFAULT 6)
RETURNS TABLE (
  id              UUID,
  name            TEXT,
  slug            TEXT,
  price           NUMERIC,
  discounted_price NUMERIC,
  avg_rating      NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.slug, p.price, p.discounted_price, p.avg_rating
  FROM products p
  WHERE p.is_new_arrival = true
    AND p.is_hidden = false
  ORDER BY p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;


-- ============================================================
-- SECTION 14: FULL TEXT SEARCH — Product Name Index
-- ============================================================

-- Enable pg_trgm for ILIKE performance (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index for fast ILIKE search on product names
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING GIN (name gin_trgm_ops);

-- GIN index for tag-based filtering
CREATE INDEX IF NOT EXISTS idx_products_tags_gin
  ON products USING GIN (tags);

-- GIN index for style-based filtering
CREATE INDEX IF NOT EXISTS idx_products_styles_gin
  ON products USING GIN (styles);

-- GIN index for color-based filtering
CREATE INDEX IF NOT EXISTS idx_products_colors_gin
  ON products USING GIN (colors);


-- ============================================================
-- END OF MIGRATION
-- ============================================================
-- Verify by running:
--   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
--   SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products';
-- ============================================================
