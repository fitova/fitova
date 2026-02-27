import { createClient } from "../supabase/client";
import { Product, mapProductFromDB } from "@/types/product";

export async function getBestSellers(limit: number = 10): Promise<Product[]> {
    const supabase = createClient();

    try {
        const { data, error } = await supabase.rpc("get_best_sellers", {
            p_limit: limit,
        });

        if (error) {
            console.error("Error fetching best sellers:", error);
            return [];
        }

        if (!data || data.length === 0) return [];

        const productIds = data.map((item: any) => item.product_id);
        const { data: productsData, error: productsError } = await supabase
            .from("products")
            .select(`
                *,
                product_images (*),
                product_reviews (id, rating)
            `)
            .in("id", productIds);

        if (productsError) {
            console.error("Error fetching product details for best sellers:", productsError);
            return [];
        }

        const sortedProducts = productsData
            .sort((a, b) => productIds.indexOf(a.id) - productIds.indexOf(b.id))
            .map(mapProductFromDB);

        return sortedProducts;
    } catch (err) {
        console.error("Unexpected error in getBestSellers:", err);
        return [];
    }
}
