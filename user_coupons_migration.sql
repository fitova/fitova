-- Run this in your Supabase SQL Editor to create the user_coupons table

CREATE TABLE user_coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id),
  code text NOT NULL UNIQUE,
  title text,
  discount_type text CHECK (discount_type IN ('percentage','fixed')) DEFAULT 'percentage',
  discount_value numeric NOT NULL,
  min_order_value numeric,
  expiry_date timestamptz,
  usage_limit integer,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own coupons"
  ON user_coupons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coupons"
  ON user_coupons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coupons"
  ON user_coupons FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coupons"
  ON user_coupons FOR DELETE
  USING (auth.uid() = user_id);
