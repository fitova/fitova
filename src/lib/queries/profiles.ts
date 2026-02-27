import { createClient } from "../supabase/client";

export type UserProfile = {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
};

// Fetch current user's profile
export async function getCurrentUserProfile() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

    if (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }

    return data as UserProfile;
}

// Update current user's profile
export async function updateCurrentUserProfile(updates: Partial<UserProfile>) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", session.user.id)
        .select()
        .single();

    if (error) throw error;

    return data;
}
