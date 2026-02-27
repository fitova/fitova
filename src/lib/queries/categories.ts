import { createClient } from "../supabase/client";

export type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    parent_id: string | null;
    sort_order: number;
    created_at: string;
};

// Fetch all categories
export async function getCategories() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

    if (error) throw error;
    return data as Category[];
}

// Fetch a single category by slug
export async function getCategoryBySlug(slug: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) throw error;
    return data as Category;
}
