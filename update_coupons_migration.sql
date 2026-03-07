-- Update the existing 'coupons' table to support user-generated coupons

ALTER TABLE coupons
  -- 1. Link to the creator (if null, it's a system/admin coupon)
  ADD COLUMN user_id uuid REFERENCES profiles(id),
  
  -- 2. Add an internal title for the user to identify their coupon
  ADD COLUMN title text,
  
  -- 3. The current table uses 'discount_percent'. We'll keep it but add discount_type and generic value
  -- so users can choose between fixed and percentage.
  ADD COLUMN discount_type text CHECK (discount_type IN ('percentage','fixed')) DEFAULT 'percentage',
  ADD COLUMN discount_value numeric,
  
  -- 4. Rules & Limits
  ADD COLUMN min_order_value numeric,
  ADD COLUMN max_discount_value numeric, -- Caps the percentage discount (e.g., 20% off up to $50)
  ADD COLUMN usage_limit integer,
  ADD COLUMN current_uses integer DEFAULT 0;

-- Optional: Enable RLS so users can only manage their own coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Note: We drop existing policies if any, to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Users can view their own and system coupons" ON coupons;
DROP POLICY IF EXISTS "Users can create their own coupons" ON coupons;
DROP POLICY IF EXISTS "Users can update their own coupons" ON coupons;
DROP POLICY IF EXISTS "Users can delete their own coupons" ON coupons;

CREATE POLICY "Users can view their own and system coupons"
  ON coupons FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own coupons"
  ON coupons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coupons"
  ON coupons FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coupons"
  ON coupons FOR DELETE
  USING (auth.uid() = user_id);
