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

// Fetch all products (optional filtering)
export async function getProducts({
    categoryId,
    isFeatured,
    isDeal,
    limit = 20,
    style,
    season,
    brand,
    material,
    colors,
    size,
    minPrice,
    maxPrice,
    sortBy,
    search,
}: {
    categoryId?: string;
    isFeatured?: boolean;
    isDeal?: boolean;
    limit?: number;
    style?: string;
    season?: string;
    brand?: string;
    material?: string;
    colors?: string[];
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string; // '0' = newest, '1' = best selling, '2' = oldest, 'price_asc', 'price_desc'
    search?: string;
} = {}) {
    const supabase = createClient();
    let query = supabase.from("products").select("*, product_images(url, type, sort_order)");

    if (categoryId) query = query.eq("category_id", categoryId);
    if (isFeatured !== undefined) query = query.eq("is_featured", isFeatured);
    if (isDeal !== undefined) query = query.eq("is_deal", isDeal);
    if (season) query = query.ilike("season", season);
    if (brand) query = query.ilike("brand", `%${brand}%`);
    if (material) query = query.ilike("material", `%${material}%`);
    if (style) query = query.contains("styles", [style]);
    if (colors && colors.length > 0) query = query.overlaps("colors", colors);
    if (size) query = query.contains("size", [size]);
    if (minPrice !== undefined) query = query.gte("price", minPrice);
    if (maxPrice !== undefined) query = query.lte("price", maxPrice);
    if (search) query = query.ilike("name", `%${search}%`);

    if (sortBy === "1") {
        query = query.order("views_count", { ascending: false });
    } else if (sortBy === "2") {
        query = query.order("created_at", { ascending: true });
    } else if (sortBy === "price_asc") {
        query = query.order("price", { ascending: true });
    } else if (sortBy === "price_desc") {
        query = query.order("price", { ascending: false });
    } else {
        query = query.order("created_at", { ascending: false });
    }

    query = query.limit(limit);

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
