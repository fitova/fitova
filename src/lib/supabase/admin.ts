import { NextResponse } from "next/server";
import { createClient } from "./server";

export async function verifyAdmin() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            ),
            supabase: null,
        };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, error: "Forbidden - Admin access required" },
                { status: 403 }
            ),
            supabase: null,
        };
    }

    return {
        authorized: true,
        response: null,
        supabase,
    };
}
