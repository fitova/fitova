import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const subscribeSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = subscribeSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email } = parsed.data;
        const supabase = await createClient();

        // ── Check if already subscribed ───────────────────────────
        const { data: existing } = await supabase
            .from("newsletter_subscribers")
            .select("id, is_active")
            .eq("email", email)
            .maybeSingle();

        if (existing) {
            if (existing.is_active) {
                return NextResponse.json(
                    { success: false, error: "This email is already subscribed." },
                    { status: 409 }
                );
            }
            // Re-activate a previously unsubscribed email
            const { error } = await supabase
                .from("newsletter_subscribers")
                .update({ is_active: true })
                .eq("id", existing.id);

            if (error) throw error;

            return NextResponse.json({ success: true, data: { subscribed: true } });
        }

        // ── New subscriber ─────────────────────────────────────────
        const { error } = await supabase
            .from("newsletter_subscribers")
            .insert({ email, is_active: true });

        if (error) throw error;

        return NextResponse.json({ success: true, data: { subscribed: true } });
    } catch (err) {
        console.error("[Newsletter Subscribe]", err);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
