-- Seed Data for Lookbook Collections
-- Run in Supabase SQL Editor to preview how cards look

INSERT INTO collections (name, slug, description, tag, generated_by_ai, styles, colors) VALUES
(
  'Summer Minimalist',
  'summer-minimalist',
  'A clean, effortless look for warm days. Light fabrics meet neutral tones for a timeless summer aesthetic.',
  'AI',
  true,
  ARRAY['Minimal', 'Casual'],
  ARRAY['White Linen Shirt', 'Beige Wide-Leg Trousers', 'Leather Sandals', 'Woven Tote Bag']
),
(
  'Street Edge',
  'street-edge',
  'Urban streetwear with attitude. Bold silhouettes and monochrome palette for maximum impact.',
  'Trending',
  false,
  ARRAY['Street', 'Bold'],
  ARRAY['Oversized Black Hoodie', 'Cargo Joggers', 'High-Top Sneakers', 'Crossbody Pouch']
),
(
  'Office Power',
  'office-power',
  'Sophisticated office looks that mean business. Structured pieces with a modern feminine twist.',
  'AI',
  true,
  ARRAY['Formal', 'Elegant'],
  ARRAY['Tailored Blazer', 'High-Waist Pencil Skirt', 'Pointed-Toe Heels', 'Structured Handbag']
),
(
  'Weekend Casual',
  'weekend-casual',
  'Relaxed weekend vibes with effortless styling. Comfort meets cool for days off.',
  'Trending',
  false,
  ARRAY['Casual', 'Sporty'],
  ARRAY['Vintage Denim Jacket', 'White Graphic Tee', 'Straight Jeans', 'Clean White Sneakers']
),
(
  'Night Out',
  'night-out',
  'Statement looks for evenings that deserve to be remembered. Drama, elegance, and confidence.',
  'AI',
  true,
  ARRAY['Elegant', 'Bold'],
  ARRAY['Satin Slip Dress', 'Strappy Heeled Mules', 'Mini Clutch Bag', 'Gold Chain Necklace']
),
(
  'Travel Ready',
  'travel-ready',
  'Stylish yet practical outfits for the modern traveler. Pack light, look great.',
  'Trending',
  false,
  ARRAY['Casual', 'Minimal'],
  ARRAY['Oversized Trench Coat', 'Comfortable Loafers', 'Travel Backpack', 'Neutral Knit Set']
);
