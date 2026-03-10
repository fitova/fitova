-- SQL Migration: AI Style Results table for shareable style links
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ai_style_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    styles TEXT[] NOT NULL DEFAULT '{}',
    recommended_colors TEXT[] NOT NULL DEFAULT '{}',
    summary TEXT NOT NULL DEFAULT '',
    analysis JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE ai_style_results ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read shared results (for public share links)
CREATE POLICY "Allow public read"
    ON ai_style_results
    FOR SELECT
    USING (true);

-- Policy: Anyone can create results (no auth required for sharing)
CREATE POLICY "Allow public insert"
    ON ai_style_results
    FOR INSERT
    WITH CHECK (true);

-- Index for fast lookup by id (UUID primary key already indexed)
-- Optional: auto-cleanup old results after 30 days
-- CREATE OR REPLACE FUNCTION delete_old_style_results() RETURNS void AS $$
--     DELETE FROM ai_style_results WHERE created_at < NOW() - INTERVAL '30 days';
-- $$ LANGUAGE sql;
