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
    created_at: string;
};

// Fetch all collections
export async function getCollections(limit = 10) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data as Collection[];
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
