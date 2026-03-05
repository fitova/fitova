import { createClient } from "../supabase/client";

export type SearchProduct = {
    id: string;
    name: string;
    slug: string;
    price: number;
    discounted_price: number | null;
    brand: string | null;
    gender: string | null;
    piece_type: string | null;
    colors: string[] | null;
    product_images: { url: string; type: string; sort_order: number }[];
};

export type SearchCollection = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
};

export type SearchCoupon = {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
    min_order_amount: number | null;
    expires_at: string | null;
    is_active: boolean;
};

export type GlobalSearchResults = {
    products: SearchProduct[];
    collections: SearchCollection[];
    coupons: SearchCoupon[];
};

/**
 * Global search: queries products, collections, and coupons in parallel.
 * Uses ilike for broad case-insensitive matching.
 * For production: add GIN index on products.name and pg_trgm for fuzzy search.
 */
export async function globalSearch(query: string, limit = 5): Promise<GlobalSearchResults> {
    if (!query || query.trim().length < 2) {
        return { products: [], collections: [], coupons: [] };
    }

    const q = `%${query.trim()}%`;
    const supabase = createClient();

    const [productsRes, collectionsRes, couponsRes] = await Promise.all([
        // Products: search by name, brand, or piece_type
        supabase
            .from("products")
            .select("id, name, slug, price, discounted_price, brand, gender, piece_type, colors, product_images(url, type, sort_order)")
            .eq("is_hidden", false)
            .or(`name.ilike.${q},brand.ilike.${q},piece_type.ilike.${q}`)
            .order("views_count", { ascending: false })
            .limit(limit),

        // Collections / Lookbooks
        supabase
            .from("collections")
            .select("id, name, slug, description, thumbnail_url")
            .or(`name.ilike.${q},description.ilike.${q}`)
            .limit(3),

        // Coupons: search by code (case-insensitive, active only)
        supabase
            .from("coupons")
            .select("id, code, discount_type, discount_value, min_order_amount, expires_at, is_active")
            .eq("is_active", true)
            .ilike("code", q)
            .limit(2),
    ]);

    return {
        products: (productsRes.data ?? []) as SearchProduct[],
        collections: (collectionsRes.data ?? []) as SearchCollection[],
        coupons: (couponsRes.data ?? []) as SearchCoupon[],
    };
}
