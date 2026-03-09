"use strict";
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
    try {
        const { data: product } = await supabase
            .from("products")
            .select("*")
            .limit(1)
            .single();

        console.log("Product ID:", product.id);

        let query = supabase
            .from("products")
            .select("*, product_images(url, type, sort_order)")
            .eq("category_id", product.category_id)
            .neq("id", product.id)
            .eq("is_hidden", false);

        const { data, error } = await query.limit(30);
        console.log("Related error:", error);
        console.log("Related count:", data?.length);

        let query2 = supabase
            .from("products")
            .select("*, product_images(url, type, sort_order)")
            .neq("id", product.id)
            .eq("is_hidden", false);
        const { data: data2, error: err2 } = await query2.limit(30);
        console.log("CYL error:", err2);
        console.log("CYL count:", data2?.length);

    } catch (err) {
        console.error("Crash:", err);
    }
}
test();
