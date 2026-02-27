-- SQL Migration — StyleHub Filter Admin Control
-- Run in Supabase SQL Editor

-- =============================================
-- style_hub_filters table
-- Allows admins to control filter options shown in StyleHub
-- =============================================
CREATE TABLE IF NOT EXISTS style_hub_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,        -- e.g. 'style', 'mood', 'occasion', 'season', 'material', 'brand'
    label TEXT NOT NULL,           -- Display name
    value TEXT NOT NULL,           -- Filter value (same as label for text, hex for colors)
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE style_hub_filters ENABLE ROW LEVEL SECURITY;

-- Everyone can read active filters
CREATE POLICY "Public can read filters" ON style_hub_filters
  FOR SELECT USING (is_active = true);

-- Admins have full control
CREATE POLICY "Admins control filters" ON style_hub_filters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- =============================================
-- Seed default data
-- =============================================
INSERT INTO style_hub_filters (category, label, value, sort_order) VALUES
-- Styles
('style', 'Casual',   'Casual',   1),
('style', 'Formal',   'Formal',   2),
('style', 'Street',   'Street',   3),
('style', 'Sporty',   'Sporty',   4),
('style', 'Minimal',  'Minimal',  5),
('style', 'Elegant',  'Elegant',  6),
-- Moods
('mood', 'Confident', 'Confident', 1),
('mood', 'Chill',     'Chill',     2),
('mood', 'Bold',      'Bold',      3),
('mood', 'Minimal',   'Minimal',   4),
('mood', 'Elegant',   'Elegant',   5),
-- Occasions
('occasion', 'Date',    'Date',    1),
('occasion', 'Work',    'Work',    2),
('occasion', 'Wedding', 'Wedding', 3),
('occasion', 'Travel',  'Travel',  4),
('occasion', 'Gym',     'Gym',     5),
-- Seasons
('season', 'Summer', 'Summer', 1),
('season', 'Winter', 'Winter', 2),
('season', 'Spring', 'Spring', 3),
('season', 'Autumn', 'Autumn', 4),
-- Materials
('material', 'Cotton',  'Cotton',  1),
('material', 'Silk',    'Silk',    2),
('material', 'Leather', 'Leather', 3),
('material', 'Denim',   'Denim',   4),
('material', 'Wool',    'Wool',    5),
('material', 'Linen',   'Linen',   6),
-- Brands
('brand', 'Nike',   'Nike',   1),
('brand', 'Zara',   'Zara',   2),
('brand', 'H&M',    'H&M',    3),
('brand', 'Gucci',  'Gucci',  4),
('brand', 'Adidas', 'Adidas', 5),
('brand', 'Uniqlo', 'Uniqlo', 6),
-- Colors (value = hex code used as filter key)
('color', 'Black', '#000000', 1),
('color', 'White', '#FFFFFF', 2),
('color', 'Navy',  '#1E3A5F', 3),
('color', 'Red',   '#C0392B', 4),
('color', 'Green', '#27AE60', 5),
('color', 'Beige', '#F5E6D3', 6),
('color', 'Grey',  '#718096', 7),
('color', 'Brown', '#6B4423', 8);
