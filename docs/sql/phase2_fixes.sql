-- SQL Migration — Phase 2 Fixes
-- Run these statements in Supabase SQL Editor

-- =============================================
-- 1. ADD user_id TO collections (if missing)
-- =============================================
ALTER TABLE collections ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- =============================================
-- 2. RLS POLICIES FOR collections
-- =============================================
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Drop existing if any to avoid conflicts
DROP POLICY IF EXISTS "Allow public read" ON collections;
DROP POLICY IF EXISTS "Allow users to insert their own" ON collections;
DROP POLICY IF EXISTS "Allow users to update their own" ON collections;
DROP POLICY IF EXISTS "Allow users to delete their own" ON collections;
DROP POLICY IF EXISTS "Allow admins full access" ON collections;

-- Public can read all collections
CREATE POLICY "Allow public read" ON collections
  FOR SELECT USING (true);

-- Users can insert their own collections
CREATE POLICY "Allow users to insert their own" ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own collections
CREATE POLICY "Allow users to update their own" ON collections
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own collections
CREATE POLICY "Allow users to delete their own" ON collections
  FOR DELETE USING (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "Allow admins full access" ON collections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- =============================================
-- 3. ADD image_url TO saved_style_worlds (for StyleHub world cover image)
-- =============================================
ALTER TABLE saved_style_worlds ADD COLUMN IF NOT EXISTS image_url TEXT;

-- =============================================
-- 4. Supabase Storage Bucket for World Images
-- =============================================
-- Run this manually in Supabase Dashboard > Storage > Create Bucket
-- Bucket name: world-images
-- Make it PUBLIC

-- =============================================
-- 5. VERIFY collections table structure
-- =============================================
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'collections'
ORDER BY ordinal_position;
