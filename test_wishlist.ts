import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase
        .from("wishlist")
        .select(`
            id,
            user_id,
            item_id,
            item_type,
            created_at
        `);

    console.log("Wishlist items:", data?.length);
    if (!data || data.length === 0) return;

    const productIds = data.filter(r => r.item_type === "product").map(r => r.item_id);

    if (productIds.length > 0) {
        const { data: productsRes, error: pError } = await supabase
            .from("products")
            .select("id, name, price, discounted_price, brand, affiliate_link, product_images(url, type, sort_order)")
            .in("id", productIds);

        console.log("Products fetched:", productsRes?.length);
        console.log("Sample product:", JSON.stringify(productsRes?.[0], null, 2));
        if (pError) console.error("Products error:", pError);
    }
}

test();
