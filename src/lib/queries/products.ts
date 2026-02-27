import { createClient } from "../supabase/client";

export type Product = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    discounted_price: number | null;
    brand: string | null;
    piece_type: string | null;
    season: string | null;
    stock_status: string;
    affiliate_link: string;
    commission: number | null;
    affiliate_program: string | null;
    merchant_id: string | null;
    quantity: number;
    tags: string[] | null;
    colors: string[] | null;
    styles: string[] | null;
    size: string[] | null;
    material: string | null;
    category_id: string | null;
    is_featured: boolean;
    is_deal: boolean;
    deal_tag: string | null;
    views_count: number;
    created_at: string;
    updated_at: string;
};

// Fetch all products (optional filtering by category or featured)
export async function getProducts({
    categoryId,
    isFeatured,
    isDeal,
    limit = 20,
}: {
    categoryId?: string;
    isFeatured?: boolean;
    isDeal?: boolean;
    limit?: number;
} = {}) {
    const supabase = createClient();
    let query = supabase.from("products").select("*, product_images(url, type, sort_order)");

    if (categoryId) {
        query = query.eq("category_id", categoryId);
    }
    if (isFeatured !== undefined) {
        query = query.eq("is_featured", isFeatured);
    }
    if (isDeal !== undefined) {
        query = query.eq("is_deal", isDeal);
    }

    query = query.order("created_at", { ascending: false }).limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data as (Product & { product_images: { url: string; type: string; sort_order: number }[] })[];
}

// Fetch a single product by slug
export async function getProductBySlug(slug: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), product_reviews(*)")
        .eq("slug", slug)
        .single();

    if (error) throw error;
    return data;
}

// Increment views count
export async function incrementProductViews(id: string) {
    const supabase = createClient();
    const { error } = await supabase.rpc("increment_views", { product_id: id });
    if (error) console.error("Error incrementing views:", error);
}
