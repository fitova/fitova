-- SQL Migration: Mirror Style results table
-- Run this in your Supabase SQL Editor

-- 1. Create the mirror_style_results table
CREATE TABLE IF NOT EXISTS mirror_style_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    original_image_url TEXT NOT NULL DEFAULT '',
    ai_image_url TEXT NOT NULL DEFAULT '',
    analysis_json JSONB NOT NULL DEFAULT '{}',
    styles TEXT[] NOT NULL DEFAULT '{}',
    colors TEXT[] NOT NULL DEFAULT '{}',
    clothing_suggestions JSONB NOT NULL DEFAULT '{}',
    summary TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    share_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text
);

-- 2. Enable Row Level Security
ALTER TABLE mirror_style_results ENABLE ROW LEVEL SECURITY;

-- 3. Public read (for share links)
CREATE POLICY "mirror_style_public_read"
    ON mirror_style_results FOR SELECT USING (true);

-- 4. Public insert (anonymous users can save)
CREATE POLICY "mirror_style_public_insert"
    ON mirror_style_results FOR INSERT WITH CHECK (true);

-- 5. Index for fast share_token lookup
CREATE INDEX IF NOT EXISTS idx_mirror_style_share_token
    ON mirror_style_results (share_token);

-- ─────────────────────────────────────────────────
-- Supabase Storage: Create bucket "mirror-style"
-- ─────────────────────────────────────────────────
-- Go to: Supabase Dashboard → Storage → New Bucket
-- Name: mirror-style   |   Make it PUBLIC
-- Folders auto-created on first upload:
--   mirror-style/user-uploads/
--   mirror-style/ai-generated/

-- 5. Index for fast share_token lookup
CREATE INDEX IF NOT EXISTS idx_mirror_style_share_token
    ON mirror_style_results (share_token);

-- ────────────────────────────────────────────────
-- Supabase Storage: Create bucket "mirror-style"
-- ────────────────────────────────────────────────
-- Create bucket (run if not already created via Dashboard):
INSERT INTO storage.buckets (id, name, public)
    VALUES ('mirror-style', 'mirror-style', true)
    ON CONFLICT (id) DO NOTHING;

-- Storage RLS: allow public reads from mirror-style bucket
CREATE POLICY "mirror_style_storage_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'mirror-style');

-- Storage RLS: allow public inserts into mirror-style bucket
CREATE POLICY "mirror_style_storage_public_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'mirror-style');
