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
    is_deal: boolean | null;
    product_images: { url: string; type: string; sort_order: number }[];
};

export type SearchCollection = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
};

export type SearchLookbook = {
    id: string;
    title: string;
    slug: string;
    cover_image: string | null;
};

export type SearchCoupon = {
    id: string;
    code: string;
    store_name: string;
    discount_type: string;
    discount_value: number;
    min_order_amount: number | null;
    expires_at: string | null;
    is_active: boolean;
};

export type GlobalSearchResults = {
    products: SearchProduct[];
    deals: SearchProduct[];        // products where is_deal = true
    collections: SearchCollection[];
    lookbooks: SearchLookbook[];
    coupons: SearchCoupon[];
};

/**
 * Global multi-entity search: queries products, deals, lookbooks, collections, and coupons in parallel.
 * Uses ilike for broad case-insensitive matching.
 */
export async function globalSearch(query: string, limit = 5): Promise<GlobalSearchResults> {
    if (!query || query.trim().length < 2) {
        return { products: [], deals: [], collections: [], lookbooks: [], coupons: [] };
    }

    const q = `%${query.trim()}%`;
    const supabase = createClient();

    const [productsRes, collectionsRes, lookbooksRes, couponsRes] = await Promise.all([
        // Products (non-deal): search by name, brand, or piece_type
        supabase
            .from("products")
            .select("id, name, slug, price, discounted_price, brand, gender, piece_type, colors, is_deal, product_images(url, type, sort_order)")
            .eq("is_hidden", false)
            .eq("is_deal", false)
            .or(`name.ilike.${q},brand.ilike.${q},piece_type.ilike.${q}`)
            .order("views_count", { ascending: false })
            .limit(limit),

        // Collections / Lookbooks (collections table)
        supabase
            .from("collections")
            .select("id, name, slug, description, thumbnail_url")
            .or(`name.ilike.${q},description.ilike.${q}`)
            .limit(4),

        // Lookbooks (lookbooks table)
        supabase
            .from("lookbooks")
            .select("id, title, slug, cover_image")
            .ilike("title", q)
            .limit(3),

        // Coupons: search by code or store_name (active only)
        supabase
            .from("coupons")
            .select("id, code, store_name, discount_type, discount_value, min_order_amount, expires_at, is_active")
            .eq("is_active", true)
            .or(`code.ilike.${q},store_name.ilike.${q}`)
            .limit(4),
    ]);

    // Deals: products with is_deal = true matching the query
    const dealsRes = await supabase
        .from("products")
        .select("id, name, slug, price, discounted_price, brand, gender, piece_type, colors, is_deal, product_images(url, type, sort_order)")
        .eq("is_hidden", false)
        .eq("is_deal", true)
        .or(`name.ilike.${q},brand.ilike.${q}`)
        .limit(3);

    return {
        products: (productsRes.data ?? []) as SearchProduct[],
        deals: (dealsRes.data ?? []) as SearchProduct[],
        collections: (collectionsRes.data ?? []) as SearchCollection[],
        lookbooks: (lookbooksRes.data ?? []) as SearchLookbook[],
        coupons: (couponsRes.data ?? []) as SearchCoupon[],
    };
}
