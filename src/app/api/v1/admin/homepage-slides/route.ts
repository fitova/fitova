import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const slideSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().min(1, "Subtitle is required"),
    description: z.string().min(1, "Description is required"),
    button_text: z.string().min(1, "Button text is required"),
    button_link: z.string().min(1, "Button link is required"),
    image_url: z.string().url("Must be a valid URL"),
    sort_order: z.number().int().nonnegative(),
    is_active: z.boolean().default(true),
});

export async function GET() {
    try {
        const { authorized, response, supabase } = await verifyAdmin();
        if (!authorized) return response;

        const { data, error } = await supabase
            .from("homepage_slides")
            .select("*")
            .order("sort_order", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("GET /api/v1/admin/homepage-slides Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to fetch slides" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validatedData = slideSchema.parse({
            ...body,
            sort_order: Number(body.sort_order),
        });

        const { authorized, response, supabase } = await verifyAdmin();
        if (!authorized) return response;

        const { data, error } = await supabase
            .from("homepage_slides")
            .insert(validatedData)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/v1/admin/homepage-slides Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message || "Failed to create slide" }, { status: 500 });
    }
}
