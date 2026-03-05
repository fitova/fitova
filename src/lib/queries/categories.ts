import { createClient } from "../supabase/client";

export type CategoryImage = {
    id: number;
    gender_id: number;
    image_url: string;
    alt_text: string | null;
    sort_order: number;
    piece_type_group: string | null;
};

export type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    parent_id: string | null;
    sort_order: number;
    piece_type: string | null;
    gender: string[] | null;
    created_at: string;
};

export type CategoryWithChildren = Category & {
    children: Category[];
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

/**
 * Returns the full category hierarchy:
 * [{ id, name, slug, ..., children: [{ id, name, slug, piece_type, ... }] }]
 * Used by MegaMenu — fetched once server-side in the layout.
 */
/**
 * Fetch slider images for the Mega Menu dropdown.
 * Returns images grouped by gender_id.
 */
export async function getCategoryImages(): Promise<CategoryImage[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("category_images")
        .select("id, gender_id, image_url, alt_text, sort_order, piece_type_group")
        .order("sort_order", { ascending: true });
    if (error || !data) return [];
    return data as CategoryImage[];
}

export async function getCategoryHierarchy(): Promise<CategoryWithChildren[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id, sort_order, piece_type, gender, image_url, description, created_at")
        .order("sort_order", { ascending: true });

    if (error || !data) return [];

    const parents = data.filter((c) => c.parent_id === null);
    const children = data.filter((c) => c.parent_id !== null);

    return parents.map((parent) => ({
        ...parent,
        children: children.filter((c) => c.parent_id === parent.id),
    })) as CategoryWithChildren[];
}
