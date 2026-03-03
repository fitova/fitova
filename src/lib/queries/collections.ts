import { createClient } from "../supabase/client";
import { Product } from "./products";

export type Collection = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    cover_image: string | null;
    tag: string | null;
    styles: string[] | null;
    colors: string[] | null;
    generated_by_ai: boolean;
    is_featured: boolean;
    display_order: number;
    created_at: string;
    user_id?: string | null;
    // Joined from profiles (optional — only present when user_id exists)
    creator?: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
};

// Fetch all collections (with optional creator info from profiles)
export async function getCollections(limit = 10) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("collections")
        .select("*, profiles:user_id(full_name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return (data ?? []).map((col: any) => ({
        ...col,
        creator: col.profiles ?? null,
        profiles: undefined,
    })) as Collection[];
}

// Fetch a single collection and its products by slug
export async function getCollectionBySlug(slug: string) {
    const supabase = createClient();
    const { data: collection, error: collectionError } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug)
        .single();

    if (collectionError) throw collectionError;

    // Then fetch the associated products using the join table
    const { data: joinData, error: joinError } = await supabase
        .from("collection_products")
        .select("products(*, product_images(*))")
        .eq("collection_id", collection.id);

    if (joinError) throw joinError;

    const products = joinData.map((jd: any) => jd.products) as Product[];

    return { collection: collection as Collection, products };
}

// Fetch featured collections for homepage lookbook preview (max 4)
export async function getFeaturedCollections(limit = 4) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("collections")
        .select("id, name, slug, tag, cover_image, display_order, is_featured, generated_by_ai, user_id, profiles:user_id(full_name, avatar_url)")
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .limit(limit);

    if (error) throw error;
    return (data ?? []).map((col: any) => ({
        ...col,
        creator: col.profiles ?? null,
        profiles: undefined,
    })) as Collection[];
}

