CREATE OR REPLACE FUNCTION increment_affiliate_click(p_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET affiliate_link_clicks = COALESCE(affiliate_link_clicks, 0) + 1
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
