import { createClient } from "../supabase/client";

export type UserCoupon = {
    id: number;
    user_id: string | null;
    code: string;
    title: string | null;
    store_name: string;
    affiliate_link: string | null;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    discount_percent: number; // Legacy column, we'll keep it synced with discount_value if type is percentage
    min_order_value: number | null;
    max_discount_value: number | null;
    usage_limit: number | null;
    current_uses: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string | null;
    image_url: string | null;
};

export async function getUserCoupons(userId: string): Promise<UserCoupon[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching user coupons:", error);
        return [];
    }
    return data || [];
}

export async function createUserCoupon(couponData: Omit<UserCoupon, "id" | "created_at" | "current_uses">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("coupons")
        .insert([couponData])
        .select()
        .single();

    if (error) {
        console.error("Error creating user coupon:", error);
        throw error;
    }
    return data as UserCoupon;
}

export async function toggleCouponStatus(couponId: number, isActive: boolean) {
    const supabase = createClient();
    const { error } = await supabase
        .from("coupons")
        .update({ is_active: isActive })
        .eq("id", couponId);

    if (error) {
        console.error("Error toggling coupon status:", error);
        throw error;
    }
}

export async function deleteUserCoupon(couponId: number) {
    const supabase = createClient();
    const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", couponId);

    if (error) {
        console.error("Error deleting coupon:", error);
        throw error;
    }
}
