-- 1. Create product_views table
CREATE TABLE product_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL = anonymous
  session_id  TEXT,           -- browser session fingerprint (optional)
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_product_views_product_id ON product_views(product_id);
CREATE INDEX idx_product_views_user_id ON product_views(user_id);
CREATE INDEX idx_product_views_viewed_at ON product_views(viewed_at DESC);
CREATE INDEX idx_product_views_trending ON product_views(product_id, viewed_at DESC);
-- Composite for debounce check
CREATE INDEX idx_product_views_debounce ON product_views(user_id, product_id, viewed_at DESC);

-- Enable RLS for product_views
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
-- Anyone can insert views (anonymous or authenticated)
CREATE POLICY "Anyone can insert views" ON product_views FOR INSERT WITH CHECK (true);
-- Users can read their own views
CREATE POLICY "Users can read own views" ON product_views FOR SELECT USING (auth.uid() = user_id);

-- 2. Create cart_events table
CREATE TABLE cart_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL DEFAULT 'add', -- 'add' | 'remove'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance on cart_events
CREATE INDEX idx_cart_events_product_id ON cart_events(product_id);
CREATE INDEX idx_cart_events_created_at ON cart_events(created_at DESC);

-- Enable RLS for cart_events
ALTER TABLE cart_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert cart events" ON cart_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read own cart events" ON cart_events FOR SELECT USING (auth.uid() = user_id);


-- 3. Add columns to products table
ALTER TABLE products 
  ADD COLUMN is_best_seller_pinned BOOLEAN DEFAULT false,
  ADD COLUMN affiliate_link_clicks INTEGER DEFAULT 0;


-- 4. Create get_trending_products RPC
CREATE OR REPLACE FUNCTION get_trending_products(p_limit INT DEFAULT 10)
RETURNS TABLE(product_id UUID, score NUMERIC) AS $$
  SELECT
    pv.product_id,
    (COUNT(DISTINCT pv.id) * 0.4
     + COUNT(DISTINCT w.id) * 0.3
     + COUNT(DISTINCT ce.id) * 0.2
     + COALESCE(p.affiliate_link_clicks, 0) * 0.1
    ) AS score
  FROM product_views pv
  JOIN products p ON p.id = pv.product_id
  LEFT JOIN wishlist w ON w.product_id = pv.product_id
    AND w.created_at > NOW() - INTERVAL '7 days'
  LEFT JOIN cart_events ce ON ce.product_id = pv.product_id
    AND ce.created_at > NOW() - INTERVAL '7 days'
  WHERE pv.viewed_at > NOW() - INTERVAL '7 days'
  GROUP BY pv.product_id, p.affiliate_link_clicks
  ORDER BY score DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;


-- 5. Create get_best_sellers RPC
CREATE OR REPLACE FUNCTION get_best_sellers(p_limit INT DEFAULT 10)
RETURNS TABLE(product_id UUID, score NUMERIC) AS $$
  SELECT
    p.id as product_id,
    COALESCE(p.affiliate_link_clicks, 0)::NUMERIC / NULLIF((SELECT count(*) FROM product_views WHERE product_views.product_id = p.id), 0)::NUMERIC AS score
  FROM products p
  ORDER BY 
    p.is_best_seller_pinned DESC,
    score DESC NULLS LAST
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;
