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
    affiliate_link: string | null;
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
    gender: 'men' | 'women' | 'kids' | 'unisex' | null;
    is_featured: boolean;
    is_deal: boolean;
    deal_tag: string | null;
    is_new_arrival: boolean;
    is_trending: boolean;
    is_bestseller: boolean;
    is_hidden: boolean;
    views_count: number;
    created_at: string;
    updated_at: string;
};

// Fetch all products (optional filtering)
export async function getProducts({
    categoryId,
    category,
    gender,
    isFeatured,
    isDeal,
    limit = 50,
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
    category?: string;       // slug-based filter (joins categories table)
    gender?: string;         // 'men' | 'women' | 'kids' | 'unisex'
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
    sortBy?: string;
    search?: string;
} = {}) {
    const supabase = createClient();
    let query = supabase.from("products").select("*, product_images(url, type, sort_order)");

    if (categoryId) query = query.eq("category_id", categoryId);

    // Filter by category slug (join into categories table)
    if (category) {
        const supabaseSub = createClient();
        const { data: catData } = await supabaseSub
            .from("categories")
            .select("id")
            .eq("slug", category)
            .single();
        if (catData?.id) query = query.eq("category_id", catData.id);
    }

    // Filter by gender
    if (gender) query = query.eq("gender", gender);

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

// Fetch new arrivals (is_new_arrival = true)
export async function getNewArrivals(limit = 12) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("products")
        .select("*, product_images(url, type, sort_order)")
        .eq("is_new_arrival", true)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data as (Product & { product_images: { url: string; type: string; sort_order: number }[] })[];
}

// Fetch related products (same category, exclude current product)
export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 6) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("products")
        .select("*, product_images(url, type, sort_order)")
        .eq("category_id", categoryId)
        .neq("id", excludeId)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data as (Product & { product_images: { url: string; type: string; sort_order: number }[] })[];
}

// Fetch a single product by ID
export async function getProductById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), product_reviews(*), categories(id, name, slug)")
        .eq("id", id)
        .single();
    if (error) throw error;
    return data;
}

/* ─── Reviews ────────────────────────────────────────────────────────────── */

export type ProductReview = {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;           // 1–5
    comment: string | null;
    created_at: string;
    // joined from profiles
    profiles?: { full_name: string | null; avatar_url: string | null } | null;
};

/**
 * Fetch paginated reviews for a product, newest first.
 * Joins `profiles` for author name & avatar.
 */
export async function getProductReviews(productId: string, page = 0, perPage = 10) {
    const supabase = createClient();
    const from = page * perPage;
    const to = from + perPage - 1;
    const { data, error, count } = await supabase
        .from("product_reviews")
        .select("id, product_id, user_id, rating, comment, created_at, profiles(full_name, avatar_url)", { count: "exact" })
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .range(from, to);
    if (error) throw error;
    return { reviews: (data ?? []) as unknown as ProductReview[], count: count ?? 0 };
}

/**
 * Submit (or update) a review. Relies on UNIQUE(product_id, user_id) constraint
 * + Supabase RLS (user must be authenticated).
 */
export async function submitProductReview(productId: string, rating: number, comment: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("product_reviews").upsert(
        { product_id: productId, user_id: user.id, rating, comment },
        { onConflict: "product_id,user_id" }
    );
    if (error) throw error;
}
