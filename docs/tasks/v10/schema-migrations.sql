-- ============================================================
-- FITOVA v10 — Database Schema Migrations
-- Run these in Supabase SQL Editor in ORDER
-- ============================================================

-- ============================================================
-- MIGRATION 1: Lookbook Schema Overhaul
-- Required for: Issue #7, #8, #9, #10, #11, #12, #13
-- ============================================================

-- Step 1: Add missing columns to lookbooks table
ALTER TABLE lookbooks
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS is_copy boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS original_lookbook_id uuid REFERENCES lookbooks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS colors text[],
  ADD COLUMN IF NOT EXISTS mood text,
  ADD COLUMN IF NOT EXISTS occasion text,
  ADD COLUMN IF NOT EXISTS season text;

-- Step 2: Add category column to lookbook_products
-- (Identifies which outfit slot each product fills)
ALTER TABLE lookbook_products
  ADD COLUMN IF NOT EXISTS category text CHECK (
    category IN ('top', 'pants', 'shoes', 'accessories', 'perfumes')
  );

-- Step 3: Enable RLS on lookbooks (if not already)
ALTER TABLE lookbooks ENABLE ROW LEVEL SECURITY;

-- Step 4: RLS Policies for lookbooks
-- Drop first to avoid "already exists" errors on re-run
DROP POLICY IF EXISTS "lookbooks_select_all" ON lookbooks;
DROP POLICY IF EXISTS "lookbooks_insert_own" ON lookbooks;
DROP POLICY IF EXISTS "lookbooks_update_own" ON lookbooks;
DROP POLICY IF EXISTS "lookbooks_delete_own" ON lookbooks;

-- Allow anyone to read lookbooks
CREATE POLICY "lookbooks_select_all"
  ON lookbooks FOR SELECT USING (true);

-- Allow authenticated users to insert their own lookbooks
CREATE POLICY "lookbooks_insert_own"
  ON lookbooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own lookbooks
CREATE POLICY "lookbooks_update_own"
  ON lookbooks FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete only their own lookbooks
CREATE POLICY "lookbooks_delete_own"
  ON lookbooks FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lookbooks_user_id ON lookbooks(user_id);
CREATE INDEX IF NOT EXISTS idx_lookbooks_is_copy ON lookbooks(is_copy);
CREATE INDEX IF NOT EXISTS idx_lookbooks_original_id ON lookbooks(original_lookbook_id);

-- ============================================================
-- MIGRATION 2: User-Generated Coupons Table
-- Required for: Issue #17
-- ============================================================

CREATE TABLE IF NOT EXISTS user_coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  title text,
  discount_type text CHECK (discount_type IN ('percentage', 'fixed')) DEFAULT 'percentage',
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_order_value numeric,
  expiry_date timestamptz,
  usage_limit integer,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

-- Drop first to avoid "already exists" errors on re-run
DROP POLICY IF EXISTS "user_coupons_select_active" ON user_coupons;
DROP POLICY IF EXISTS "user_coupons_insert_own" ON user_coupons;
DROP POLICY IF EXISTS "user_coupons_update_own" ON user_coupons;
DROP POLICY IF EXISTS "user_coupons_delete_own" ON user_coupons;

-- Anyone can view active coupons (for discovery/sharing)
CREATE POLICY "user_coupons_select_active"
  ON user_coupons FOR SELECT
  USING (is_active = true);

-- Users can insert their own coupons
CREATE POLICY "user_coupons_insert_own"
  ON user_coupons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own coupons
CREATE POLICY "user_coupons_update_own"
  ON user_coupons FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own coupons
CREATE POLICY "user_coupons_delete_own"
  ON user_coupons FOR DELETE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_code ON user_coupons(code);

-- ============================================================
-- MIGRATION 3: Full-Text Search Support
-- Required for: Issue #1 (Multi-Entity Search)
-- ============================================================

-- Add GIN indexes for ilike search performance on products
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_lookbooks_title_trgm
  ON lookbooks USING gin (title gin_trgm_ops);

-- Note: requires pg_trgm extension (usually enabled in Supabase by default)
-- If not enabled: CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- VERIFICATION QUERIES
-- Run these after migrations to confirm success
-- ============================================================

-- Check lookbooks columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'lookbooks'
ORDER BY ordinal_position;

-- Check user_coupons table exists
SELECT COUNT(*) FROM user_coupons;

-- Check lookbook_products category column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'lookbook_products';
