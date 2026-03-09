import { createClient } from "../supabase/client";

export type ItemType = "product" | "lookbook";

export type WishlistProduct = {
    id: string;
    name: string;
    slug: string;
    price: number;
    discounted_price: number | null;
    brand: string | null;
    affiliate_link: string | null;
    product_images?: { url: string; type: string; sort_order: number }[];
};

export type WishlistCollection = {
    id: string;
    name: string;
    slug: string;
    cover_image: string | null;
};

export type WishlistItem = {
    id: string;
    user_id: string;
    item_id: string;
    item_type: ItemType;
    created_at: string;
    product?: WishlistProduct;
    collection?: WishlistCollection;
};

// ── Fetch full wishlist for current user ─────────────────────
export async function getWishlist(): Promise<WishlistItem[]> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const { data, error } = await supabase
        .from("wishlist")
        .select(`
            id,
            user_id,
            item_id,
            item_type,
            created_at
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

    if (error || !data) return [];

    // Separate by type and enrich with joined data
    const productIds = data.filter(r => r.item_type === "product").map(r => r.item_id);
    const lookbookIds = data.filter(r => r.item_type === "lookbook").map(r => r.item_id);

    const [productsRes, collectionsRes] = await Promise.all([
        productIds.length > 0
            ? supabase
                .from("products")
                .select("id, name, slug, price, discounted_price, brand, affiliate_link, imgs, product_images(url, type, sort_order)")
                .in("id", productIds)
            : Promise.resolve({ data: [] }),
        lookbookIds.length > 0
            ? supabase
                .from("collections")
                .select("id, name, slug, cover_image")
                .in("id", lookbookIds)
            : Promise.resolve({ data: [] }),
    ]);

    const productMap = new Map((productsRes.data ?? []).map((p: any) => [p.id, p]));
    const collectionMap = new Map((collectionsRes.data ?? []).map((c: any) => [c.id, c]));

    return data.map(row => ({
        ...row,
        product: row.item_type === "product" ? productMap.get(row.item_id) : undefined,
        collection: row.item_type === "lookbook" ? collectionMap.get(row.item_id) : undefined,
    })) as WishlistItem[];
}

// ── Add to wishlist (upsert, duplicate-safe) ─────────────────
export async function addToWishlist(itemId: string, itemType: ItemType = "product") {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("wishlist")
        .upsert(
            [{
                user_id: session.user.id,
                item_id: itemId,
                item_type: itemType,
                // legacy compat: keep product_id if product
                ...(itemType === "product" ? { product_id: itemId } : {}),
            }],
            { onConflict: "user_id,item_id,item_type", ignoreDuplicates: true }
        )
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
}

// ── Remove from wishlist ──────────────────────────────────────
export async function removeFromWishlist(itemId: string, itemType: ItemType = "product") {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("wishlist")
        .delete()
        .match({ user_id: session.user.id, item_id: itemId, item_type: itemType });

    if (error) throw error;
}

// ── Check if item is wishlisted ───────────────────────────────
export async function isWishlisted(itemId: string, itemType: ItemType = "product"): Promise<boolean> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { data } = await supabase
        .from("wishlist")
        .select("id")
        .match({ user_id: session.user.id, item_id: itemId, item_type: itemType })
        .maybeSingle();

    return !!data;
}
