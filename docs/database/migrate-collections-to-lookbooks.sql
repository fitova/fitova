-- Migration Script: Update `lookbooks` table to include columns from the deprecated `collections` table.

-- 1. Add missing columns to the `lookbooks` table
ALTER TABLE public.lookbooks 
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS generated_by_ai boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_draft boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS styles text[],
ADD COLUMN IF NOT EXISTS tag text;

-- 2. Ensure RLS policies are up to date if necessary (Assuming existing policies apply correctly to new columns)

-- Note: Data migration from `collections` to `lookbooks` is not included in this script automatically 
-- because it requires moving data explicitly if there are existing rows in `collections` that need to be preserved.
-- If you need to copy data over, you can run a query like:
-- INSERT INTO public.lookbooks (id, title, slug, cover_image, description, is_featured, created_at)
-- SELECT id, name, slug, thumbnail_url, description, true, created_at FROM public.collections;

-- 3. (Optional - Run later after confirming everything works) Drop the collections table.
-- DROP TABLE public.collections;
