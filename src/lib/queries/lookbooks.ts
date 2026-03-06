import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type LookbookCategory = "top" | "pants" | "shoes" | "accessories" | "perfumes";

export interface LookbookProduct {
    id: string;
    lookbook_id: string;
    product_id: string;
    category: LookbookCategory | null;
    sort_order: number | null;
    products?: {
        id: string;
        name: string;
        slug: string;
        price: number;
        discounted_price?: number | null;
        imgs?: { previews?: string[] } | null;
        brand?: string | null;
        piece_type?: string | null;
    };
}

export interface Lookbook {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    cover_image?: string | null;
    user_id?: string | null;
    is_copy?: boolean;
    original_lookbook_id?: string | null;
    tags?: string[] | null;
    colors?: string[] | null;
    mood?: string | null;
    occasion?: string | null;
    season?: string | null;
    tag?: "AI" | "Trending" | "User" | null;
    created_at: string;
    profiles?: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

export interface CreateLookbookData {
    title: string;
    description?: string;
    cover_image?: string;
    tags?: string[];
    colors?: string[];
    mood?: string;
    occasion?: string;
    season?: string;
}

export interface LookbookProductSlot {
    category: LookbookCategory;
    product_id: string;
}

/* ─────────────────────────── Fetch ───────────────────────────────── */

/** Fetch all lookbooks with creator info */
export async function getLookbooks(tag?: string) {
    let query = supabase
        .from("lookbooks")
        .select("*, profiles(id, full_name, avatar_url)")
        .order("created_at", { ascending: false });

    if (tag && tag !== "All") {
        query = query.eq("tag", tag);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Lookbook[];
}

/** Fetch a single lookbook by slug with its products */
export async function getLookbookBySlug(slug: string) {
    const { data, error } = await supabase
        .from("lookbooks")
        .select(`
            *,
            profiles(id, full_name, avatar_url),
            lookbook_products(
                id, category, sort_order,
                products(id, name, slug, price, discounted_price, imgs, brand, piece_type)
            )
        `)
        .eq("slug", slug)
        .single();

    if (error) throw error;
    return data as Lookbook & { lookbook_products: LookbookProduct[] };
}

/** Fetch products of a lookbook (for hover preview) */
export async function getLookbookProductPreviews(lookbookId: string, limit = 6) {
    const { data } = await supabase
        .from("lookbook_products")
        .select("products(imgs)")
        .eq("lookbook_id", lookbookId)
        .limit(limit);

    if (!data) return [];
    return data
        .map((row: any) => row.products?.imgs?.previews?.[0])
        .filter(Boolean) as string[];
}

/* ─────────────────────────── Create ──────────────────────────────── */

/** Create a new lookbook and insert its products */
export async function createLookbook(
    data: CreateLookbookData,
    productSlots: LookbookProductSlot[],
    userId: string
) {
    // Generate slug from title
    const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        + "-" + Date.now();

    const { data: lookbook, error: insertError } = await supabase
        .from("lookbooks")
        .insert({
            title: data.title,
            description: data.description,
            cover_image: data.cover_image,
            slug,
            user_id: userId,
            tags: data.tags ?? [],
            colors: data.colors ?? [],
            mood: data.mood,
            occasion: data.occasion,
            season: data.season,
            tag: "User",
        })
        .select()
        .single();

    if (insertError) throw insertError;

    // Insert product slots
    if (productSlots.length > 0) {
        const { error: productsError } = await supabase
            .from("lookbook_products")
            .insert(
                productSlots.map((slot, i) => ({
                    lookbook_id: lookbook.id,
                    product_id: slot.product_id,
                    category: slot.category,
                    sort_order: i,
                }))
            );
        if (productsError) throw productsError;
    }

    return lookbook as Lookbook;
}

/* ─────────────────────────── Fork ────────────────────────────────── */

/** Fork an existing lookbook for a user (Modify flow) */
export async function forkLookbook(originalId: string, userId: string) {
    // Fetch original
    const { data: original, error: fetchError } = await supabase
        .from("lookbooks")
        .select("*, lookbook_products(*)")
        .eq("id", originalId)
        .single();

    if (fetchError || !original) throw fetchError ?? new Error("Lookbook not found");

    const slug = original.slug + "-copy-" + Date.now();

    // Create fork
    const { data: fork, error: forkError } = await supabase
        .from("lookbooks")
        .insert({
            title: `${original.title} (My Version)`,
            description: original.description,
            cover_image: original.cover_image,
            slug,
            user_id: userId,
            is_copy: true,
            original_lookbook_id: original.id,
            tags: original.tags ?? [],
            colors: original.colors ?? [],
            mood: original.mood,
            occasion: original.occasion,
            season: original.season,
            tag: "User",
        })
        .select()
        .single();

    if (forkError) throw forkError;

    // Copy products
    if (original.lookbook_products?.length > 0) {
        await supabase.from("lookbook_products").insert(
            original.lookbook_products.map((p: any) => ({
                lookbook_id: fork.id,
                product_id: p.product_id,
                category: p.category,
                sort_order: p.sort_order,
            }))
        );
    }

    return fork as Lookbook;
}

/* ─────────────────────────── Cart ────────────────────────────────── */

/** Add all lookbook products to cart, return skipped (out of stock) names */
export async function addLookbookToCart(lookbookId: string, userId: string) {
    const { data: items } = await supabase
        .from("lookbook_products")
        .select("product_id, products(id, name, stock_status)")
        .eq("lookbook_id", lookbookId);

    if (!items || items.length === 0) return { added: 0, skipped: [] };

    const available = items.filter((p: any) => p.products?.stock_status !== "out_of_stock");
    const skipped = items
        .filter((p: any) => p.products?.stock_status === "out_of_stock")
        .map((p: any) => p.products?.name ?? "Unknown");

    // Insert into cart_items
    if (available.length > 0) {
        await supabase.from("cart_items").insert(
            available.map((p: any) => ({
                user_id: userId,
                product_id: p.product_id,
                quantity: 1,
            }))
        );
    }

    return { added: available.length, skipped };
}
