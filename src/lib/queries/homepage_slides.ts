import { createClient } from "../supabase/client";
import { HomepageSlide } from "@/types/homepage_slide";

export async function getActiveHomepageSlides(): Promise<HomepageSlide[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("homepage_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("Error fetching homepage slides:", error);
        return [];
    }

    return data as HomepageSlide[];
}
