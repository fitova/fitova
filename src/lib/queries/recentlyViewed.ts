import { createClient } from "../supabase/client";
import { Product, mapProductFromDB } from "@/types/product";

export async function getRecentlyViewed(userId?: string, limit: number = 10): Promise<Product[]> {
    if (!userId) {
        // Fetch from localStorage
        if (typeof window === "undefined") return [];

        try {
            const stored = localStorage.getItem("fitova_rv");
            if (!stored) return [];

            const rvList: string[] = JSON.parse(stored);
            if (rvList.length === 0) return [];

            const idList = rvList.slice(0, limit);

            // Fetch product data
            const supabase = createClient();
            const { data: productsData, error } = await supabase
                .from("products")
                .select(`
                    *,
                    product_images (*),
                    product_reviews (id, rating)
                `)
                .in("id", idList);

            if (error) {
                console.error("Error fetching recently viewed from anon ids", error);
                return [];
            }

            // Sort by order of localStorage
            const sortedProducts = productsData
                .sort((a, b) => idList.indexOf(a.id) - idList.indexOf(b.id))
                .map(mapProductFromDB);

            return sortedProducts;
        } catch (err) {
            console.error("Error getting recently viewed from localStorage", err);
            return [];
        }
    }

    // Auth Users: Fetch from DB using distinct products sorted by latest view
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from("product_views")
            .select("product_id, viewed_at")
            .eq("user_id", userId)
            .order("viewed_at", { ascending: false })
            .limit(100); // Fetch a chunk to filter unique

        if (error) {
            console.error("Error fetching recently viewed for logged in user", error);
            return [];
        }

        if (!data || data.length === 0) return [];

        // Filter unique product IDs preserving first appearance (most recent)
        const uniqueIds: string[] = [];
        data.forEach(item => {
            if (!uniqueIds.includes(item.product_id) && uniqueIds.length < limit) {
                uniqueIds.push(item.product_id);
            }
        });

        if (uniqueIds.length === 0) return [];

        const { data: productsData, error: productsError } = await supabase
            .from("products")
            .select(`
                *,
                product_images (*),
                product_reviews (id, rating)
            `)
            .in("id", uniqueIds);

        if (productsError) {
            console.error("Error fetching product details for recently viewed:", productsError);
            return [];
        }

        const sortedProducts = productsData
            .sort((a, b) => uniqueIds.indexOf(a.id) - uniqueIds.indexOf(b.id))
            .map(mapProductFromDB);

        return sortedProducts;
    } catch (err) {
        console.error("Unexpected error in getRecentlyViewed:", err);
        return [];
    }
}
