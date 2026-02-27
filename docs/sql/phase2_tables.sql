-- SQL for Phase 2 Supabase Tables

-- 1. homepage_slides
CREATE TABLE IF NOT EXISTS homepage_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subtitle TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    button_text TEXT NOT NULL,
    button_link TEXT NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE homepage_slides ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON homepage_slides FOR SELECT USING (true);
CREATE POLICY "Enable all access for admins" ON homepage_slides FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- Insert dummy data based on previous hardcoded slides
INSERT INTO homepage_slides (subtitle, title, description, button_text, button_link, image_url, sort_order)
VALUES 
('AI-Powered', 'Redefine Your\nSignature Look', 'Experience the future of fashion. Upload, match, and discover looks curated exclusively for you.', 'Explore Collection', '#', '/images/media/gemini-3-pro-image-preview_a_Replace_the_human_fa.png', 1),
('New Arrivals', 'Sculptural\nSilhouettes', 'Discover the new season essentials. Minimal design meeting maximum impact.', 'Shop Now', '#', '/images/media/gemini-3-pro-image-preview-2k_b_Replace_the_human_fa (2).png', 2);

-- 2. saved_style_worlds
CREATE TABLE IF NOT EXISTS saved_style_worlds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filters JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE saved_style_worlds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read/write access for owners" ON saved_style_worlds FOR ALL USING (auth.uid() = user_id);

-- 3. user_lookbooks (Pivot missing from DB plan but mentioned in Task 14, wait, collections handles Lookbook)
-- Actually, the database plan mentions 'collections' for Lookbook. 
-- For Task 13 (Create Lookbook user creation flow), users can create collections, so we need a boolean or 'user_id' in collections table.
-- Let's update collections to have 'user_id'
ALTER TABLE collections ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
