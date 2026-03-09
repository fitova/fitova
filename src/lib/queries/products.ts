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

// Piece-type group → individual piece_type values (mirrors MegaMenu groupChildren)
const PIECE_TYPE_GROUPS: Record<string, string[]> = {
    clothing: ["tshirt", "shirt", "hoodie", "jacket", "pants", "jeans", "shorts", "dress", "top",
        "skirt", "outerwear", "blouse", "bottom", "cardigan", "sweater", "coat", "vest"],
    footwear: ["sneakers", "boots", "sandals", "heels", "shoes", "loafers", "flats", "slippers"],
    accessories: ["watch", "belt", "cap", "bag", "sunglasses", "wallet", "jewelry", "scarf",
        "socks", "hat", "bracelet", "necklace", "ring", "earring", "backpack", "handbag",
        "clutch", "tote", "accessories"],
    fragrances: ["perfume", "fragrance"],
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
    sizes,
    minPrice,
    maxPrice,
    sortBy,
    search,
    pieceTypeGroup,
}: {
    categoryId?: string;
    category?: string;
    gender?: string;
    isFeatured?: boolean;
    isDeal?: boolean;
    limit?: number;
    style?: string;
    season?: string;
    brand?: string;
    material?: string;
    colors?: string[];
    size?: string;           // legacy single (kept for URL compat)
    sizes?: string[];        // multi-select
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    search?: string;
    pieceTypeGroup?: string;
} = {}) {
    const supabase = createClient();
    let query = supabase.from("products").select("*, product_images(url, type, sort_order)").eq("is_hidden", false);

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

    // Filter by gender — normalize to lowercase to handle DB case inconsistencies
    if (gender) query = query.eq("gender", gender.toLowerCase());

    // Filter by piece_type group (clothing / footwear / accessories / fragrances)
    if (pieceTypeGroup) {
        const pieceTypes = PIECE_TYPE_GROUPS[pieceTypeGroup.toLowerCase()];
        if (pieceTypes && pieceTypes.length > 0) {
            query = query.in("piece_type", pieceTypes);
        }
    }

    if (isFeatured !== undefined) query = query.eq("is_featured", isFeatured);
    if (isDeal !== undefined) query = query.eq("is_deal", isDeal);
    if (style) query = query.ilike("season", season);
    if (brand) query = query.ilike("brand", `%${brand}%`);
    if (material) query = query.ilike("material", `%${material}%`);
    if (style) query = query.contains("styles", [style]);
    if (colors && colors.length > 0) query = query.overlaps("colors", colors);
    // Multi-select sizes: overlaps with the product's size array
    if (sizes && sizes.length > 0) query = query.overlaps("size", sizes);
    else if (size) query = query.contains("size", [size]);
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
        .select("*, product_images(*), product_reviews(*), categories(id, name, slug)")
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

// Map of complementary piece types for "Complete Your Look"
const COMPLEMENTARY_MAP: Record<string, string[]> = {
    "top": ["pants", "shorts", "shoes", "accessories"],
    "tshirt": ["pants", "shorts", "shoes", "accessories"],
    "shirt": ["pants", "shoes", "accessories"],
    "hoodie": ["pants", "shoes"],
    "sweater": ["pants", "shoes"],
    "jacket": ["tshirt", "pants", "shoes"],
    "pants": ["top", "tshirt", "shirt", "hoodie", "shoes"],
    "shorts": ["top", "tshirt", "shoes"],
    "shoes": ["pants", "shorts", "accessories", "top"],
    "accessories": ["top", "pants", "shoes"],
    "bag": ["top", "pants", "shoes", "dress"],
    "dress": ["shoes", "accessories", "bag"],
};

// Fetch "Complete Your Look" products
export async function getCompleteYourLookProducts(currentProduct: any, limit = 4) {
    const supabase = createClient();
    const pt = currentProduct.piece_type?.toLowerCase() || "";
    const complements = COMPLEMENTARY_MAP[pt] || ["accessories", "shoes", "bag", "fragrances"]; // fallback
    const styles = currentProduct.styles || [];

    // Build query
    let query = supabase
        .from("products")
        .select("*, product_images(url, type, sort_order)")
        .neq("id", currentProduct.id)
        .eq("is_hidden", false);

    // Filter by gender if available
    if (currentProduct.gender && currentProduct.gender !== 'unisex') {
        query = query.in("gender", [currentProduct.gender, "unisex"]);
    }

    // Filter by complementary piece types
    if (complements.length > 0) {
        query = query.in("piece_type", complements);
    }

    // Primary fetch
    const { data: primaryData, error } = await query.limit(20);
    if (error) throw error;

    let candidates = (primaryData ?? []) as any[];

    // Sort candidates by style match score
    candidates.sort((a, b) => {
        const aStyles = a.styles || [];
        const bStyles = b.styles || [];
        const aMatch = aStyles.filter((s: string) => styles.includes(s)).length;
        const bMatch = bStyles.filter((s: string) => styles.includes(s)).length;
        return bMatch - aMatch; // descending score
    });

    // If we don't have enough, fill with new arrivals
    if (candidates.length < limit) {
        const fillCount = limit - candidates.length;
        const fallback = await getNewArrivals(fillCount + 4);
        const filteredFallback = fallback.filter((p) => p.id !== currentProduct.id && !candidates.some(c => c.id === p.id)).slice(0, fillCount);
        candidates = [...candidates, ...filteredFallback];
    }

    // Return the top N
    return candidates.slice(0, limit);
}

// Fetch related products (Similar Items algorithm)
export async function getRelatedProducts(currentProduct: any, limit = 4) {
    const supabase = createClient();

    if (!currentProduct.category_id) return [];

    // Query same category
    let query = supabase
        .from("products")
        .select("*, product_images(url, type, sort_order)")
        .eq("category_id", currentProduct.category_id)
        .neq("id", currentProduct.id)
        .eq("is_hidden", false);

    const { data, error } = await query.limit(30);
    if (error) throw error;

    let candidates = (data ?? []) as any[];

    // Score candidates based on similarity
    const targetStyles = currentProduct.styles || [];
    const targetBrand = currentProduct.brand;
    const targetMaterial = currentProduct.material;

    candidates.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Brand match = +3
        if (targetBrand && a.brand === targetBrand) scoreA += 3;
        if (targetBrand && b.brand === targetBrand) scoreB += 3;

        // Material match = +2
        if (targetMaterial && a.material === targetMaterial) scoreA += 2;
        if (targetMaterial && b.material === targetMaterial) scoreB += 2;

        // Style overlap = +1 per style
        const aStyles = a.styles || [];
        scoreA += aStyles.filter((s: string) => targetStyles.includes(s)).length;

        const bStyles = b.styles || [];
        scoreB += bStyles.filter((s: string) => targetStyles.includes(s)).length;

        return scoreB - scoreA;
    });

    return candidates.slice(0, limit);
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
