import { createClient } from "../supabase/client";

export type CartItem = {
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    size: string | null;
    color: string | null;
    created_at: string;
    products?: {
        id: string;
        name: string;
        slug: string;
        price: number;
        discounted_price: number | null;
        brand: string | null;
        product_images: { url: string; type: string; sort_order: number }[];
    };
};

/** Fetch all cart items for the authenticated user */
export async function getCartItems(): Promise<CartItem[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(id, name, slug, price, discounted_price, brand, product_images(url, type, sort_order))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) { console.error("getCartItems error:", error); return []; }
    return (data ?? []) as CartItem[];
}

/** Add or update a cart item (upsert on user_id + product_id + size + color) */
export async function addToCart(
    productId: string,
    quantity = 1,
    size?: string | null,
    color?: string | null
): Promise<CartItem | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Check if item already exists
    const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("size", size ?? null)
        .eq("color", color ?? null)
        .maybeSingle();

    if (existing) {
        // Increment quantity
        const { data, error } = await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + quantity })
            .eq("id", existing.id)
            .select()
            .single();
        if (error) throw error;
        return data as CartItem;
    } else {
        // Insert new row
        const { data, error } = await supabase
            .from("cart_items")
            .insert({ user_id: user.id, product_id: productId, quantity, size: size ?? null, color: color ?? null })
            .select()
            .single();
        if (error) throw error;
        return data as CartItem;
    }
}

/** Remove a cart item by id */
export async function removeFromCart(cartItemId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
    if (error) throw error;
}

/** Update quantity for a specific cart item */
export async function updateCartQuantity(cartItemId: string, quantity: number): Promise<void> {
    const supabase = createClient();
    if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
    }
    const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId);
    if (error) throw error;
}

/** Clear entire cart for the user */
export async function clearCart(): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);
    if (error) throw error;
}

/** Check if a product is in the cart */
export async function isInCart(productId: string, size?: string, color?: string): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    let query = supabase
        .from("cart_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId);

    if (size) query = query.eq("size", size);
    if (color) query = query.eq("color", color);

    const { data } = await query.maybeSingle();
    return !!data;
}

/** Sync local Redux cart to DB after login */
export async function syncCartToDb(items: { productId: string; quantity: number; size?: string; color?: string }[]): Promise<void> {
    for (const item of items) {
        await addToCart(item.productId, item.quantity, item.size, item.color).catch(() => { });
    }
}
