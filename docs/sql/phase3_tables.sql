-- Phase 3 Admin Dashboard SQL Migrations
-- This file contains the necessary database updates for Phase 3 features

-- 1. Split Offers and Coupons
-- We add a 'type' column to the 'offers' table to easily separate coupons (code required) from offers (auto-applied discounts).
ALTER TABLE offers ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'offer' CHECK (type IN ('offer', 'coupon'));

-- Create an index for faster querying by type
CREATE INDEX IF NOT EXISTS idx_offers_type ON offers(type);

-- Since we now enforce 'type', we should ensure 'coupon' rows have a code.
-- Optionally, you can run a one-time update if all current rows with codes are coupons
UPDATE offers SET type = 'coupon' WHERE code IS NOT NULL AND code != '';
