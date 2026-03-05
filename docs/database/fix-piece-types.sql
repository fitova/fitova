-- ====================================================
-- FIX: Update all NULL piece_type values in categories
-- Run this in Supabase SQL Editor
-- ====================================================

-- ─── MEN ──────────────────────────────────────────────────────────────────────
-- CLOTHING
UPDATE categories SET piece_type = 'jacket'  WHERE slug = 'men-jackets'    AND (piece_type IS NULL OR piece_type = 'null');
UPDATE categories SET piece_type = 'pants'   WHERE slug = 'men-pants'      AND (piece_type IS NULL OR piece_type = 'null');
UPDATE categories SET piece_type = 'shirt'   WHERE slug = 'men-shirts'     AND (piece_type IS NULL OR piece_type = 'null');
UPDATE categories SET piece_type = 'tshirt'  WHERE slug = 'men-tshirts'    AND (piece_type IS NULL OR piece_type = 'null');
UPDATE categories SET piece_type = 'tshirt'  WHERE slug = 'men-activewear' AND (piece_type IS NULL OR piece_type = 'null');
-- FOOTWEAR
UPDATE categories SET piece_type = 'shoes'   WHERE slug = 'men-shoes'      AND (piece_type IS NULL OR piece_type = 'null');
UPDATE categories SET piece_type = 'sneakers' WHERE slug = 'men-sneakers';
-- Fix jeans: should be its own type, not 'pants'
UPDATE categories SET piece_type = 'jeans'   WHERE slug = 'men-jeans';

-- ─── WOMEN ────────────────────────────────────────────────────────────────────
-- CLOTHING
UPDATE categories SET piece_type = 'jacket'  WHERE slug = 'women-jackets'    AND (piece_type IS NULL OR piece_type = 'null');
UPDATE categories SET piece_type = 'pants'   WHERE slug = 'women-pants'      AND (piece_type IS NULL OR piece_type = 'null');
UPDATE categories SET piece_type = 'dress'   WHERE slug = 'women-dresses'    AND (piece_type IS NULL OR piece_type = 'null');
UPDATE categories SET piece_type = 'top'     WHERE slug = 'women-tops'       AND (piece_type IS NULL OR piece_type = 'null');
UPDATE categories SET piece_type = 'tshirt'  WHERE slug = 'women-activewear' AND (piece_type IS NULL OR piece_type = 'null');
-- FOOTWEAR
UPDATE categories SET piece_type = 'shoes'   WHERE slug = 'women-shoes'      AND (piece_type IS NULL OR piece_type = 'null');
UPDATE categories SET piece_type = 'heels'   WHERE slug = 'women-heels';
UPDATE categories SET piece_type = 'sneakers' WHERE slug = 'women-sneakers';

-- ─── KIDS ─────────────────────────────────────────────────────────────────────
-- CLOTHING
UPDATE categories SET piece_type = 'pants'   WHERE slug = 'kids-pants'      AND (piece_type IS NULL OR piece_type = 'null');
UPDATE categories SET piece_type = 'tshirt'  WHERE slug = 'kids-tshirts'    AND (piece_type IS NULL OR piece_type = 'null');
-- FOOTWEAR
UPDATE categories SET piece_type = 'shoes'   WHERE slug = 'kids-shoes'      AND (piece_type IS NULL OR piece_type = 'null');
UPDATE categories SET piece_type = 'sneakers' WHERE slug = 'kids-sneakers';

-- ─── Verify ───────────────────────────────────────────────────────────────────
SELECT 
  CASE WHEN parent_id IS NULL THEN '▶ ' ELSE '  └─ ' END || name AS "Category",
  slug,
  piece_type,
  sort_order
FROM categories
ORDER BY sort_order, name;
