import { createClient } from "../supabase/server";

export type Testimonial = {
    id: string;
    review: string;
    author_name: string;
    author_img: string | null;
    author_role: string | null;
    is_visible: boolean;
    sort_order: number;
    created_at: string;
};

// Fetch visible testimonials
export async function getTestimonials() {
    const supabase = await createClient(); // assuming server side for home page statically generally
    const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

    if (error) {
        return []; // silent fail for client rendering sometimes
    }
    return data as Testimonial[];
}
