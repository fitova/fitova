import { createClient } from "../supabase/client";

export type Address = {
    id: string;
    user_id: string;
    label: string | null;
    full_name: string;
    phone: string | null;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    state: string | null;
    postal_code: string | null;
    country: string;
    is_default: boolean;
    created_at: string;
};

// Fetch user addresses
export async function getUserAddresses() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) return [];

    const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Address[];
}

// Add a new address
export async function addAddress(addressData: Omit<Address, "id" | "user_id" | "created_at">) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) throw new Error("Not authenticated");

    // If this is set as default, we might need to unset others first
    if (addressData.is_default) {
        await supabase
            .from("user_addresses")
            .update({ is_default: false })
            .eq("user_id", session.user.id)
            .eq("is_default", true);
    }

    const { data, error } = await supabase
        .from("user_addresses")
        .insert([{ ...addressData, user_id: session.user.id }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Delete an address
export async function deleteAddress(addressId: string) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("user_addresses")
        .delete()
        .match({ id: addressId, user_id: session.user.id });

    if (error) throw error;
}
