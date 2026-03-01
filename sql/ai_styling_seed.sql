-- ============================================================
-- FITOVA — AI Styling Seed Data (Supplementary)
-- Run in Supabase SQL Editor
-- Adds diverse products with gender tags + all piece_types
-- ============================================================

INSERT INTO products (name, slug, description, price, discounted_price, brand, piece_type, season, stock_status, affiliate_link, styles, colors, tags, material, is_featured, is_deal, deal_tag, quantity)
VALUES

-- ─── MEN — CASUAL ──────────────────────────────────────────

('Classic White Cotton T-Shirt', 'classic-white-cotton-tshirt',
 'A clean essential white crew-neck tee in premium 100% cotton. The foundation of any casual wardrobe.',
 35.00, null, 'Uniqlo', 'Shirt', 'Summer', 'In stock',
 'https://www.uniqlo.com', ARRAY['Casual','Minimal'], ARRAY['White'], ARRAY['men','unisex','tshirt','basics','casual'], 'Cotton', true, false, null, 100
),

('Slim Fit Dark Wash Jeans', 'slim-fit-dark-wash-jeans',
 'Classic slim-fit jeans in deep indigo. Pairs with anything from sneakers to dress shoes.',
 95.00, 75.00, 'Levi''s', 'Pants', 'Autumn', 'In stock',
 'https://www.levis.com', ARRAY['Casual','Street'], ARRAY['Navy'], ARRAY['men','jeans','denim','slim'], 'Denim', true, true, 'Best Seller', 80
),

('White Leather Low-Top Sneakers', 'white-leather-low-top-sneakers',
 'Minimalist white leather sneakers that elevate any casual look. Timeless and versatile.',
 120.00, null, 'Common Projects', 'Shoes', 'Summer', 'In stock',
 'https://www.commonprojects.com', ARRAY['Casual','Minimal','Street'], ARRAY['White'], ARRAY['men','sneakers','shoes','minimal','white'], 'Leather', true, false, null, 45
),

('Navy Blue Chino Pants', 'navy-blue-chino-pants',
 'Tailored chinos in navy blue. Smart enough for the office, casual enough for the weekend.',
 85.00, 69.00, 'J.Crew', 'Pants', 'Autumn', 'In stock',
 'https://www.jcrew.com', ARRAY['Casual','Formal'], ARRAY['Navy'], ARRAY['men','chinos','pants','navy'], 'Cotton', false, false, null, 60
),

('Grey Crewneck Sweatshirt', 'grey-crewneck-sweatshirt',
 'An essential heavyweight crewneck in grey marl. Oversized fit for effortless layering.',
 65.00, null, 'H&M', 'Shirt', 'Winter', 'In stock',
 'https://www.hm.com', ARRAY['Casual','Street'], ARRAY['Grey'], ARRAY['men','unisex','sweatshirt','grey','casual'], 'Cotton', false, false, null, 75
),

('Camel Wool Overcoat', 'camel-wool-overcoat',
 'A statement overcoat in warm camel wool. The ultimate autumn/winter essential.',
 280.00, 220.00, 'Zara', 'Jacket', 'Winter', 'In stock',
 'https://www.zara.com', ARRAY['Formal','Elegant','Casual'], ARRAY['Brown'], ARRAY['men','coat','jacket','camel','wool','winter'], 'Wool', true, false, null, 25
),

('Black Leather Bifold Wallet', 'black-leather-bifold-wallet',
 'A slim bifold wallet in full-grain black leather. Carries what matters, nothing more.',
 55.00, null, 'Bellroy', 'Accessories', 'Summer', 'In stock',
 'https://www.bellroy.com', ARRAY['Minimal','Formal','Casual'], ARRAY['Black'], ARRAY['men','wallet','accessories','leather','black'], 'Leather', false, false, null, 90
),

('Navy Linen Shirt', 'navy-linen-shirt',
 'A relaxed-fit linen shirt in navy for summer styling. Light, breathable, effortless.',
 79.00, 59.00, 'COS', 'Shirt', 'Summer', 'In stock',
 'https://www.cos.com', ARRAY['Casual','Minimal'], ARRAY['Navy'], ARRAY['men','shirt','linen','navy','summer'], 'Linen', false, false, null, 40
),

-- ─── WOMEN — CASUAL ─────────────────────────────────────────

('White Fitted Crop Top', 'white-fitted-crop-top',
 'A clean white ribbed crop top with a slim fit. The ultimate layering piece.',
 25.00, null, 'Zara', 'Shirt', 'Summer', 'In stock',
 'https://www.zara.com', ARRAY['Casual','Street','Minimal'], ARRAY['White'], ARRAY['women','croptop','shirt','white','summer'], 'Cotton', true, false, null, 120
),

('Black High-Waist Wide-Leg Pants', 'black-high-waist-wide-leg-pants',
 'Flowing wide-leg trousers with a high waist. Effortlessly elegant and versatile.',
 110.00, 85.00, 'Mango', 'Pants', 'Autumn', 'In stock',
 'https://www.mango.com', ARRAY['Casual','Elegant','Minimal'], ARRAY['Black'], ARRAY['women','pants','wide-leg','black','highwaist'], 'Linen', true, false, null, 50
),

('White Block Heel Ankle Boots', 'white-block-heel-ankle-boots',
 'Sleek ankle boots with a stable block heel. Transition-season essential.',
 165.00, 130.00, 'Mango', 'Shoes', 'Autumn', 'In stock',
 'https://www.mango.com', ARRAY['Casual','Elegant','Formal'], ARRAY['White','Beige'], ARRAY['women','boots','shoes','white','block-heel'], 'Leather', false, true, 'New In', 30
),

('Beige Ribbed Knit Cardigan', 'beige-ribbed-knit-cardigan',
 'A cozy oversized cardigan in beige. The perfect layering piece for transitional weather.',
 95.00, null, 'Uniqlo', 'Jacket', 'Autumn', 'In stock',
 'https://www.uniqlo.com', ARRAY['Casual','Minimal'], ARRAY['Beige'], ARRAY['women','cardigan','knit','beige','cozy'], 'Wool', false, false, null, 45
),

('Gold Hoop Earrings Set', 'gold-hoop-earrings-set',
 'A set of three gold hoop earrings in varying sizes. Everyday luxury.',
 35.00, null, 'Mango', 'Accessories', 'Summer', 'In stock',
 'https://www.mango.com', ARRAY['Casual','Elegant','Minimal'], ARRAY['Beige','White'], ARRAY['women','earrings','gold','accessories','jewelry'], 'Metal', false, false, null, 200
),

('Black Mini Crossbody Bag', 'black-mini-crossbody-bag',
 'A structured mini crossbody in smooth black leather. Compact and effortlessly chic.',
 120.00, null, 'Zara', 'Bag', 'Summer', 'In stock',
 'https://www.zara.com', ARRAY['Casual','Elegant','Street'], ARRAY['Black'], ARRAY['women','bag','crossbody','mini','black','leather'], 'Leather', true, false, null, 35
),

-- ─── UNISEX — STREET / SPORT ────────────────────────────────

('Black Oversized Puffer Jacket', 'black-oversized-puffer-jacket',
 'A bold oversized puffer jacket in recycled nylon. Maximum warmth, maximum style.',
 180.00, 149.00, 'The North Face', 'Jacket', 'Winter', 'In stock',
 'https://www.thenorthface.com', ARRAY['Street','Sporty','Casual'], ARRAY['Black'], ARRAY['men','women','unisex','puffer','jacket','winter','street'], 'Nylon', true, true, 'Flash Sale', 40
),

('White Sports Running Shoes', 'white-sports-running-shoes',
 'Lightweight technical running shoes with responsive cushioning. Performance meets street style.',
 140.00, null, 'Nike', 'Shoes', 'Summer', 'In stock',
 'https://www.nike.com', ARRAY['Sporty','Street','Casual'], ARRAY['White'], ARRAY['men','women','unisex','running','shoes','white','sport'], 'Nylon', true, false, null, 60
),

('Black Cargo Pants', 'black-cargo-pants',
 'Utility cargo pants with multiple pockets. Street-ready and endlessly functional.',
 110.00, 89.00, 'Carhartt', 'Pants', 'Autumn', 'In stock',
 'https://www.carhartt.com', ARRAY['Street','Casual'], ARRAY['Black'], ARRAY['men','women','unisex','cargo','pants','street','black'], 'Cotton', false, false, null, 55
),

('Navy Knitted Beanie', 'navy-knitted-beanie',
 'A soft chunky-knit beanie in navy wool. Winter''s most essential accessory.',
 28.00, null, 'Carhartt', 'Accessories', 'Winter', 'In stock',
 'https://www.carhartt.com', ARRAY['Street','Casual','Sporty'], ARRAY['Navy'], ARRAY['men','women','unisex','beanie','hat','navy','winter'], 'Wool', false, false, null, 150
),

('White Oversized Logo Hoodie', 'white-oversized-logo-hoodie',
 'A heavyweight oversized hoodie in off-white. Minimal logo for a clean streetwear look.',
 89.00, null, 'Adidas', 'Shirt', 'Winter', 'In stock',
 'https://www.adidas.com', ARRAY['Street','Casual'], ARRAY['White'], ARRAY['men','women','unisex','hoodie','white','street','oversized'], 'Cotton', false, false, null, 70
),

-- ─── FORMAL / ELEGANT ───────────────────────────────────────

('Charcoal Slim-Fit Suit', 'charcoal-slim-fit-suit',
 'A classic slim-fit suit in charcoal grey. Modern proportions, refined construction.',
 450.00, 380.00, 'Massimo Dutti', 'Jacket', 'Autumn', 'In stock',
 'https://www.massimodutti.com', ARRAY['Formal','Elegant'], ARRAY['Grey'], ARRAY['men','suit','blazer','formal','charcoal','grey'], 'Wool', true, false, null, 15
),

('Cream Silk Blouse', 'cream-silk-blouse',
 'A fluid silk blouse in cream. Effortless elegance from day to evening.',
 135.00, null, 'COS', 'Shirt', 'Summer', 'In stock',
 'https://www.cos.com', ARRAY['Formal','Elegant','Minimal'], ARRAY['Beige','White'], ARRAY['women','blouse','silk','cream','formal'], 'Silk', true, false, null, 30
),

('Black Leather Oxford Shoes', 'black-leather-oxford-shoes',
 'Impeccably crafted leather Oxford shoes in polished black. For moments that matter.',
 220.00, null, 'Clarks', 'Shoes', 'Autumn', 'In stock',
 'https://www.clarks.com', ARRAY['Formal','Elegant'], ARRAY['Black'], ARRAY['men','oxford','shoes','black','leather','formal'], 'Leather', false, false, null, 20
),

('Emerald Green Midi Dress', 'emerald-green-midi-dress',
 'A rich emerald green midi dress in flowing fabric. Worn for moments you''ll remember.',
 175.00, 140.00, 'Zara', 'Dress', 'Summer', 'In stock',
 'https://www.zara.com', ARRAY['Elegant','Bold'], ARRAY['Green'], ARRAY['women','dress','midi','green','elegant','evening'], 'Silk', true, true, 'Hot Deal', 20
),

('Silver Chain Bracelet', 'silver-chain-bracelet',
 'A delicate layered chain bracelet in sterling silver. The minimal finishing touch.',
 45.00, null, 'Mango', 'Accessories', 'Summer', 'In stock',
 'https://www.mango.com', ARRAY['Minimal','Elegant','Formal'], ARRAY['Grey','White'], ARRAY['women','unisex','bracelet','silver','accessories','jewelry'], 'Metal', false, false, null, 100
);


-- ============================================================
-- PRODUCT IMAGES (picsum placeholders with fashion seeds)
-- ============================================================

-- Men products
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/white-tee/600/800', 'thumbnail', 0 FROM products WHERE slug = 'classic-white-cotton-tshirt';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/dark-jeans/600/800', 'thumbnail', 0 FROM products WHERE slug = 'slim-fit-dark-wash-jeans';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/white-sneakers/600/800', 'thumbnail', 0 FROM products WHERE slug = 'white-leather-low-top-sneakers';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/navy-chinos/600/800', 'thumbnail', 0 FROM products WHERE slug = 'navy-blue-chino-pants';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/grey-sweat/600/800', 'thumbnail', 0 FROM products WHERE slug = 'grey-crewneck-sweatshirt';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/camel-coat/600/800', 'thumbnail', 0 FROM products WHERE slug = 'camel-wool-overcoat';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/black-wallet/600/800', 'thumbnail', 0 FROM products WHERE slug = 'black-leather-bifold-wallet';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/navy-linen-shirt/600/800', 'thumbnail', 0 FROM products WHERE slug = 'navy-linen-shirt';

-- Women products
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/white-crop/600/800', 'thumbnail', 0 FROM products WHERE slug = 'white-fitted-crop-top';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/black-wide-pants/600/800', 'thumbnail', 0 FROM products WHERE slug = 'black-high-waist-wide-leg-pants';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/white-boots/600/800', 'thumbnail', 0 FROM products WHERE slug = 'white-block-heel-ankle-boots';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/beige-cardigan/600/800', 'thumbnail', 0 FROM products WHERE slug = 'beige-ribbed-knit-cardigan';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/gold-hoops/600/800', 'thumbnail', 0 FROM products WHERE slug = 'gold-hoop-earrings-set';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/black-crossbody/600/800', 'thumbnail', 0 FROM products WHERE slug = 'black-mini-crossbody-bag';

-- Unisex / Street
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/black-puffer/600/800', 'thumbnail', 0 FROM products WHERE slug = 'black-oversized-puffer-jacket';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/white-runners/600/800', 'thumbnail', 0 FROM products WHERE slug = 'white-sports-running-shoes';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/black-cargo/600/800', 'thumbnail', 0 FROM products WHERE slug = 'black-cargo-pants';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/navy-beanie/600/800', 'thumbnail', 0 FROM products WHERE slug = 'navy-knitted-beanie';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/white-hoodie/600/800', 'thumbnail', 0 FROM products WHERE slug = 'white-oversized-logo-hoodie';

-- Formal
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/charcoal-suit/600/800', 'thumbnail', 0 FROM products WHERE slug = 'charcoal-slim-fit-suit';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/cream-blouse/600/800', 'thumbnail', 0 FROM products WHERE slug = 'cream-silk-blouse';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/black-oxford/600/800', 'thumbnail', 0 FROM products WHERE slug = 'black-leather-oxford-shoes';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/green-dress/600/800', 'thumbnail', 0 FROM products WHERE slug = 'emerald-green-midi-dress';
INSERT INTO product_images (product_id, url, type, sort_order) SELECT id, 'https://picsum.photos/seed/silver-bracelet/600/800', 'thumbnail', 0 FROM products WHERE slug = 'silver-chain-bracelet';

-- ============================================================
-- VERIFY
-- ============================================================
SELECT piece_type, COUNT(*) as count FROM products GROUP BY piece_type ORDER BY count DESC;
