import { createClient } from "../supabase/client";
import { Product } from "./products";

export type WishlistItem = {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
    products?: Product;
};

// Fetch wishlist items for a user
export async function getWishlist() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) return [];

    const { data, error } = await supabase
        .from("wishlist")
        .select("*, products(*, product_images(*))")
        .eq("user_id", session.user.id);

    if (error) throw error;
    return data as WishlistItem[];
}

// Add an item to the wishlist
export async function addToWishlist(productId: string) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("wishlist")
        .insert([{ user_id: session.user.id, product_id: productId }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Remove an item from the wishlist
export async function removeFromWishlist(productId: string) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("wishlist")
        .delete()
        .match({ user_id: session.user.id, product_id: productId });

    if (error) throw error;
}
