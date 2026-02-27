import { createClient } from "../supabase/client";

export type Offer = {
    id: string;
    code: string | null;
    description: string;
    discount_type: string;
    discount_value: number;
    min_purchase: number | null;
    max_uses: number | null;
    current_uses: number;
    is_active: boolean;
    valid_from: string | null;
    valid_to: string | null;
    created_at: string;
};

// Fetch active offers
export async function getActiveOffers() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (error) throw error;

    // Filter out expired offers on client side just in case
    const now = new Date();
    return (data as Offer[]).filter((offer) => {
        if (offer.valid_to && new Date(offer.valid_to) < now) return false;
        if (offer.valid_from && new Date(offer.valid_from) > now) return false;
        if (offer.max_uses && offer.current_uses >= offer.max_uses) return false;
        return true;
    });
}
