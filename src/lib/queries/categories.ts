import { createClient } from "../supabase/client";

export type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    parent_id: string | null;
    sort_order: number;
    gender: string[] | null;
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

// Fetch top-level gender categories only (Men, Women, Kids — parent_id is null)
export async function getTopLevelCategories() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image_url, sort_order, gender")
        .is("parent_id", null)
        .order("sort_order", { ascending: true });
    if (error) throw error;
    return data as Category[];
}

// Fetch subcategories by parent ID
export async function getSubcategoriesByParentId(parentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("parent_id", parentId)
        .order("sort_order", { ascending: true });
    if (error) return [];
    return data as Category[];
}
