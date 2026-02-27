-- Fix get_trending_products to always return products even if no views exist
CREATE OR REPLACE FUNCTION get_trending_products(p_limit INT DEFAULT 10)
RETURNS TABLE(product_id UUID, score NUMERIC) AS $$
  SELECT
    p.id as product_id,
    (COUNT(DISTINCT pv.id) * 0.4
     + COUNT(DISTINCT w.id) * 0.3
     + COUNT(DISTINCT ce.id) * 0.2
     + COALESCE(p.affiliate_link_clicks, 0) * 0.1
    ) AS score
  FROM products p
  LEFT JOIN product_views pv ON p.id = pv.product_id AND pv.viewed_at > NOW() - INTERVAL '7 days'
  LEFT JOIN wishlist w ON w.product_id = p.id AND w.created_at > NOW() - INTERVAL '7 days'
  LEFT JOIN cart_events ce ON ce.product_id = p.id AND ce.created_at > NOW() - INTERVAL '7 days'
  GROUP BY p.id, p.affiliate_link_clicks, p.created_at
  ORDER BY score DESC, p.created_at DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;

-- Fix get_best_sellers to have a deterministic tie-breaker
CREATE OR REPLACE FUNCTION get_best_sellers(p_limit INT DEFAULT 10)
RETURNS TABLE(product_id UUID, score NUMERIC) AS $$
  SELECT
    p.id as product_id,
    COALESCE(p.affiliate_link_clicks, 0)::NUMERIC / NULLIF((SELECT count(*) FROM product_views WHERE product_views.product_id = p.id), 0)::NUMERIC AS score
  FROM products p
  ORDER BY 
    p.is_best_seller_pinned DESC,
    score DESC NULLS LAST,
    p.created_at DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;
