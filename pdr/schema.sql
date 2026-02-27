-- ============================================================
-- Fitova - Full Database Schema for Supabase
-- Run this entire file in: Supabase > SQL Editor > New query
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (Users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  phone       TEXT,
  is_admin    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. USER ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label          TEXT,
  full_name      TEXT NOT NULL,
  phone          TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city           TEXT NOT NULL,
  state          TEXT,
  postal_code    TEXT,
  country        TEXT NOT NULL DEFAULT 'SA',
  is_default     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  parent_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  discounted_price  NUMERIC(10,2) CHECK (discounted_price >= 0),
  brand             TEXT,
  piece_type        TEXT,
  season            TEXT,
  stock_status      TEXT NOT NULL DEFAULT 'In stock',
  affiliate_link    TEXT,
  commission        NUMERIC(5,2),
  affiliate_program TEXT,
  merchant_id       TEXT,
  quantity          INTEGER NOT NULL DEFAULT 0,
  tags              TEXT[],
  colors            TEXT[],
  styles            TEXT[],
  size              TEXT[],
  material          TEXT,
  category_id       UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  is_deal           BOOLEAN NOT NULL DEFAULT false,
  deal_tag          TEXT,
  views_count       INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. PRODUCT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('thumbnail', 'preview')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  alt_text    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. PRODUCT REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

-- ============================================================
-- 7. COLLECTIONS (Lookbook)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.collections (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  cover_image      TEXT,
  tag              TEXT,
  styles           TEXT[],
  colors           TEXT[],
  generated_by_ai  BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. COLLECTION <-> PRODUCTS (Join Table)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.collection_products (
  collection_id  UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  PRIMARY KEY (collection_id, product_id)
);

-- ============================================================
-- 9. OFFERS & COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.offers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT UNIQUE,
  description     TEXT NOT NULL,
  discount_type   TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  min_purchase    NUMERIC(10,2),
  max_uses        INTEGER,
  current_uses    INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  valid_from      TIMESTAMPTZ,
  valid_to        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 10. WISHLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- ============================================================
-- 11. BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  content       TEXT NOT NULL,
  excerpt       TEXT,
  cover_image   TEXT,
  author_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  views_count   INTEGER NOT NULL DEFAULT 0,
  is_published  BOOLEAN NOT NULL DEFAULT false,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 12. TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review       TEXT NOT NULL,
  author_name  TEXT NOT NULL,
  author_img   TEXT,
  author_role  TEXT,
  is_visible   BOOLEAN NOT NULL DEFAULT true,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. CONTACT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 14. NEWSLETTER SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT NOT NULL UNIQUE,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 15. SAVED STYLE WORLDS (StyleHub)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_style_worlds (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  filters     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_name          ON public.products (name);
CREATE INDEX IF NOT EXISTS idx_products_slug          ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id   ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand         ON public.products (brand);
CREATE INDEX IF NOT EXISTS idx_products_is_featured   ON public.products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_is_deal       ON public.products (is_deal) WHERE is_deal = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at    ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_images_pid     ON public.product_images (product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_pid    ON public.product_reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id       ON public.wishlist (user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug        ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published   ON public.blog_posts (is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_categories_slug        ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_user_addresses_uid     ON public.user_addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_style_worlds_uid       ON public.saved_style_worlds (user_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug       ON public.collections (slug);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_style_worlds    ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ---- PROFILES ----
CREATE POLICY "profiles: owner can read own"    ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles: owner can update own"  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles: admin can read all"    ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "profiles: admin can update all"  ON public.profiles FOR UPDATE USING (public.is_admin());

-- ---- USER ADDRESSES ----
CREATE POLICY "addresses: owner full access"  ON public.user_addresses USING (auth.uid() = user_id);

-- ---- CATEGORIES (public read, admin write) ----
CREATE POLICY "categories: public read"   ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories: admin write"   ON public.categories FOR ALL USING (public.is_admin());

-- ---- PRODUCTS (public read, admin write) ----
CREATE POLICY "products: public read"   ON public.products FOR SELECT USING (true);
CREATE POLICY "products: admin write"   ON public.products FOR ALL USING (public.is_admin());

-- ---- PRODUCT IMAGES (public read, admin write) ----
CREATE POLICY "product_images: public read"  ON public.product_images FOR SELECT USING (true);
CREATE POLICY "product_images: admin write"  ON public.product_images FOR ALL USING (public.is_admin());

-- ---- PRODUCT REVIEWS (public read, owner/admin write) ----
CREATE POLICY "reviews: public read"         ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "reviews: auth user can insert" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews: owner can update"    ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews: owner or admin delete" ON public.product_reviews FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- ---- COLLECTIONS (public read, admin write) ----
CREATE POLICY "collections: public read"  ON public.collections FOR SELECT USING (true);
CREATE POLICY "collections: admin write"  ON public.collections FOR ALL USING (public.is_admin());

-- ---- COLLECTION PRODUCTS (public read, admin write) ----
CREATE POLICY "collection_products: public read"  ON public.collection_products FOR SELECT USING (true);
CREATE POLICY "collection_products: admin write"  ON public.collection_products FOR ALL USING (public.is_admin());

-- ---- OFFERS (public read, admin write) ----
CREATE POLICY "offers: public read"   ON public.offers FOR SELECT USING (true);
CREATE POLICY "offers: admin write"   ON public.offers FOR ALL USING (public.is_admin());

-- ---- WISHLIST (owner full access) ----
CREATE POLICY "wishlist: owner full access"  ON public.wishlist USING (auth.uid() = user_id);

-- ---- BLOG POSTS (public read published, admin write all) ----
CREATE POLICY "blog: public read published"  ON public.blog_posts FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "blog: admin write"            ON public.blog_posts FOR ALL USING (public.is_admin());

-- ---- TESTIMONIALS (public read visible, admin write all) ----
CREATE POLICY "testimonials: public read"  ON public.testimonials FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "testimonials: admin write"  ON public.testimonials FOR ALL USING (public.is_admin());

-- ---- CONTACT MESSAGES (anyone can insert, admin can read/manage) ----
CREATE POLICY "contact: anyone can insert"   ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact: admin full access"   ON public.contact_messages FOR ALL USING (public.is_admin());

-- ---- NEWSLETTER (anyone can insert, admin can manage) ----
CREATE POLICY "newsletter: anyone can subscribe"  ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "newsletter: admin full access"     ON public.newsletter_subscribers FOR ALL USING (public.is_admin());

-- ---- SAVED STYLE WORLDS (owner full access) ----
CREATE POLICY "style_worlds: owner full access"  ON public.saved_style_worlds USING (auth.uid() = user_id);

-- ============================================================
-- Done! ✅
-- All tables, indexes, triggers, and RLS policies are created.
-- ============================================================
