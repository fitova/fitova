-- ====================================================
-- FITOVA — Full Product Seed Data
-- Includes: products, product_images, collection_products
-- Run AFTER lookbook_seed.sql
-- Uses picsum.photos for placeholder images
-- ====================================================

-- ====================================================
-- 1. PRODUCTS
-- ====================================================
INSERT INTO products (name, slug, description, price, discounted_price, brand, piece_type, season, stock_status, affiliate_link, styles, colors, tags, material, is_featured, is_deal, deal_tag, quantity)
VALUES

-- ── Summer Minimalist Products ─────────────────────
(
  'White Linen Relaxed Shirt', 'white-linen-relaxed-shirt',
  'A breathable, effortlessly loose fit shirt crafted from 100% natural linen. Perfect for warm summer days.',
  89.00, 64.00, 'COS', 'Shirt', 'Summer', 'In stock',
  'https://www.cos.com', ARRAY['Minimal','Casual'], ARRAY['White'], ARRAY['linen','summer','minimal'], 'Linen', true, false, null, 50
),
(
  'Beige Wide-Leg Trousers', 'beige-wide-leg-trousers',
  'Fluid wide-leg trousers in soft beige. Combines comfort and elegance for an effortless minimal look.',
  120.00, 85.00, 'Zara', 'Trousers', 'Summer', 'In stock',
  'https://www.zara.com', ARRAY['Minimal','Casual'], ARRAY['Beige'], ARRAY['wide-leg','summer','trousers'], 'Linen', true, true, 'Hot Deal', 30
),
(
  'Tan Leather Strappy Sandals', 'tan-leather-strappy-sandals',
  'Handcrafted leather sandals with adjustable straps. A summer staple for the minimal wardrobe.',
  145.00, null, 'Mango', 'Shoes', 'Summer', 'In stock',
  'https://www.mango.com', ARRAY['Minimal'], ARRAY['Brown'], ARRAY['sandals','leather','summer'], 'Leather', false, false, null, 25
),
(
  'Natural Woven Tote Bag', 'natural-woven-tote-bag',
  'A structured tote in natural woven material. Carries everything you need in style.',
  75.00, null, 'H&M', 'Bag', 'Summer', 'In stock',
  'https://www.hm.com', ARRAY['Minimal','Casual'], ARRAY['Beige'], ARRAY['bag','tote','summer'], 'Cotton', false, false, null, 40
),

-- ── Street Edge Products ────────────────────────────
(
  'Oversized Black Tech Hoodie', 'oversized-black-tech-hoodie',
  'A heavyweight oversized hoodie with a clean monochrome look. Built for the streets.',
  130.00, 99.00, 'Nike', 'Hoodie', 'Autumn', 'In stock',
  'https://www.nike.com', ARRAY['Street','Bold'], ARRAY['Black'], ARRAY['hoodie','streetwear','oversize'], 'Cotton', true, true, 'Flash Sale', 60
),
(
  'Slim Cargo Joggers', 'slim-cargo-joggers',
  'Technical slim cargo pants with utility pockets. The ultimate street-to-gym essential.',
  95.00, null, 'Adidas', 'Trousers', 'Autumn', 'In stock',
  'https://www.adidas.com', ARRAY['Street','Sporty'], ARRAY['Black'], ARRAY['cargo','joggers','street'], 'Cotton', false, false, null, 45
),
(
  'High-Top Leather Sneakers', 'high-top-leather-sneakers',
  'Premium leather high-tops designed for maximum street cred and all-day comfort.',
  160.00, 129.00, 'Nike', 'Shoes', 'Autumn', 'In stock',
  'https://www.nike.com', ARRAY['Street'], ARRAY['Black','White'], ARRAY['sneakers','high-top','street'], 'Leather', true, false, null, 35
),

-- ── Office Power Products ───────────────────────────
(
  'Structured Double-Breasted Blazer', 'structured-double-breasted-blazer',
  'A sharp, tailored blazer that commands attention in any boardroom.',
  220.00, 175.00, 'Massimo Dutti', 'Blazer', 'Autumn', 'In stock',
  'https://www.massimodutti.com', ARRAY['Formal','Elegant'], ARRAY['Black'], ARRAY['blazer','office','formal'], 'Wool', true, false, null, 20
),
(
  'High-Waist Pencil Skirt', 'high-waist-pencil-skirt',
  'A classic high-waist pencil skirt in stretch fabric. Moves with you, stays polished.',
  110.00, null, 'Zara', 'Skirt', 'Summer', 'In stock',
  'https://www.zara.com', ARRAY['Formal','Elegant'], ARRAY['Black'], ARRAY['pencil-skirt','office','formal'], 'Silk', false, false, null, 30
),
(
  'Pointed-Toe Block Heel Pumps', 'pointed-toe-block-heel-pumps',
  'Timeless pointed-toe pumps on a comfortable block heel. Office-ready elegance.',
  190.00, 149.00, 'Mango', 'Shoes', 'Autumn', 'In stock',
  'https://www.mango.com', ARRAY['Formal','Elegant'], ARRAY['Black'], ARRAY['heels','office','formal'], 'Leather', false, true, 'Limited Time', 15
),
(
  'Structured Leather Handbag', 'structured-leather-handbag',
  'A top-handle structured bag in smooth leather. The perfect office companion.',
  280.00, null, 'Massimo Dutti', 'Bag', 'Autumn', 'In stock',
  'https://www.massimodutti.com', ARRAY['Formal','Elegant'], ARRAY['Black'], ARRAY['handbag','office','leather'], 'Leather', true, false, null, 10
),

-- ── Night Out Products ──────────────────────────────
(
  'Champagne Satin Slip Dress', 'champagne-satin-slip-dress',
  'A liquid-smooth satin slip dress that catches every light. Effortlessly elegant for any evening.',
  175.00, 139.00, 'Cos', 'Dress', 'Summer', 'In stock',
  'https://www.cos.com', ARRAY['Elegant','Bold'], ARRAY['Beige'], ARRAY['dress','satin','night-out'], 'Silk', true, true, 'Hot Deal', 20
),
(
  'Gold Strappy Heeled Mules', 'gold-strappy-heeled-mules',
  'Open-toe heeled mules with delicate gold straps. Made for evenings that matter.',
  165.00, null, 'Mango', 'Shoes', 'Summer', 'In stock',
  'https://www.mango.com', ARRAY['Elegant'], ARRAY['Beige'], ARRAY['mules','heels','night-out'], 'Leather', false, false, null, 18
),
(
  'Gold Twisted Chain Necklace', 'gold-twisted-chain-necklace',
  'A bold twisted chain necklace in 18k gold plating. The finishing touch to any evening look.',
  85.00, 65.00, 'Zara', 'Jewelry', 'Summer', 'In stock',
  'https://www.zara.com', ARRAY['Elegant','Bold'], ARRAY['White'], ARRAY['necklace','gold','jewelry'], 'Metal', false, false, null, 50
);


-- ====================================================
-- 2. PRODUCT IMAGES (using picsum.photos)
-- Each product gets 2 images: thumbnail + preview
-- ====================================================

-- White Linen Shirt
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/linen-shirt-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'white-linen-relaxed-shirt';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/linen-shirt-2/600/800', 'preview', 1 FROM products WHERE slug = 'white-linen-relaxed-shirt';

-- Beige Trousers
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/beige-trousers-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'beige-wide-leg-trousers';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/beige-trousers-2/600/800', 'preview', 1 FROM products WHERE slug = 'beige-wide-leg-trousers';

-- Leather Sandals
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/sandals-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'tan-leather-strappy-sandals';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/sandals-2/600/800', 'preview', 1 FROM products WHERE slug = 'tan-leather-strappy-sandals';

-- Tote Bag
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/tote-bag-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'natural-woven-tote-bag';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/tote-bag-2/600/800', 'preview', 1 FROM products WHERE slug = 'natural-woven-tote-bag';

-- Black Hoodie
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/hoodie-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'oversized-black-tech-hoodie';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/hoodie-2/600/800', 'preview', 1 FROM products WHERE slug = 'oversized-black-tech-hoodie';

-- Cargo Joggers
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/cargo-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'slim-cargo-joggers';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/cargo-2/600/800', 'preview', 1 FROM products WHERE slug = 'slim-cargo-joggers';

-- Sneakers
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/sneakers-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'high-top-leather-sneakers';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/sneakers-2/600/800', 'preview', 1 FROM products WHERE slug = 'high-top-leather-sneakers';

-- Blazer
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/blazer-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'structured-double-breasted-blazer';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/blazer-2/600/800', 'preview', 1 FROM products WHERE slug = 'structured-double-breasted-blazer';

-- Pencil Skirt
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/pencil-skirt-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'high-waist-pencil-skirt';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/pencil-skirt-2/600/800', 'preview', 1 FROM products WHERE slug = 'high-waist-pencil-skirt';

-- Block Heel Pumps
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/pumps-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'pointed-toe-block-heel-pumps';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/pumps-2/600/800', 'preview', 1 FROM products WHERE slug = 'pointed-toe-block-heel-pumps';

-- Leather Handbag
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/handbag-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'structured-leather-handbag';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/handbag-2/600/800', 'preview', 1 FROM products WHERE slug = 'structured-leather-handbag';

-- Satin Slip Dress
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/dress-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'champagne-satin-slip-dress';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/dress-2/600/800', 'preview', 1 FROM products WHERE slug = 'champagne-satin-slip-dress';

-- Gold Mules
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/mules-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'gold-strappy-heeled-mules';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/mules-2/600/800', 'preview', 1 FROM products WHERE slug = 'gold-strappy-heeled-mules';

-- Gold Necklace
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/necklace-1/600/800', 'thumbnail', 0 FROM products WHERE slug = 'gold-twisted-chain-necklace';
INSERT INTO product_images (product_id, url, type, sort_order)
SELECT id, 'https://picsum.photos/seed/necklace-2/600/800', 'preview', 1 FROM products WHERE slug = 'gold-twisted-chain-necklace';


-- ====================================================
-- 3. LINK PRODUCTS TO COLLECTIONS (collection_products)
-- ====================================================

-- Summer Minimalist collection → its products
INSERT INTO collection_products (collection_id, product_id)
SELECT c.id, p.id FROM collections c, products p
WHERE c.slug = 'summer-minimalist'
AND p.slug IN ('white-linen-relaxed-shirt','beige-wide-leg-trousers','tan-leather-strappy-sandals','natural-woven-tote-bag');

-- Street Edge collection → its products
INSERT INTO collection_products (collection_id, product_id)
SELECT c.id, p.id FROM collections c, products p
WHERE c.slug = 'street-edge'
AND p.slug IN ('oversized-black-tech-hoodie','slim-cargo-joggers','high-top-leather-sneakers');

-- Office Power collection → its products
INSERT INTO collection_products (collection_id, product_id)
SELECT c.id, p.id FROM collections c, products p
WHERE c.slug = 'office-power'
AND p.slug IN ('structured-double-breasted-blazer','high-waist-pencil-skirt','pointed-toe-block-heel-pumps','structured-leather-handbag');

-- Night Out collection → its products
INSERT INTO collection_products (collection_id, product_id)
SELECT c.id, p.id FROM collections c, products p
WHERE c.slug = 'night-out'
AND p.slug IN ('champagne-satin-slip-dress','gold-strappy-heeled-mules','gold-twisted-chain-necklace');

-- ====================================================
-- 4. UPDATE Lookbook cover images (picsum)
-- ====================================================
UPDATE collections SET cover_image = 'https://picsum.photos/seed/summer-minimal/800/600' WHERE slug = 'summer-minimalist';
UPDATE collections SET cover_image = 'https://picsum.photos/seed/street-edge/800/600' WHERE slug = 'street-edge';
UPDATE collections SET cover_image = 'https://picsum.photos/seed/office-power/800/600' WHERE slug = 'office-power';
UPDATE collections SET cover_image = 'https://picsum.photos/seed/weekend-casual/800/600' WHERE slug = 'weekend-casual';
UPDATE collections SET cover_image = 'https://picsum.photos/seed/night-out/800/600' WHERE slug = 'night-out';
UPDATE collections SET cover_image = 'https://picsum.photos/seed/travel-ready/800/600' WHERE slug = 'travel-ready';

-- ====================================================
-- VERIFY
-- ====================================================
SELECT c.name AS collection, count(cp.product_id) AS product_count
FROM collections c
LEFT JOIN collection_products cp ON cp.collection_id = c.id
GROUP BY c.name;
