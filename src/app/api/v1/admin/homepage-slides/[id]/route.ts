import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const updateSlideSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().min(1, "Subtitle is required"),
    description: z.string().min(1, "Description is required"),
    button_text: z.string().min(1, "Button text is required"),
    button_link: z.string().min(1, "Button link is required"),
    image_url: z.string().url("Must be a valid URL"),
    sort_order: z.number().int().nonnegative(),
    is_active: z.boolean(),
});

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const validatedData = updateSlideSchema.parse({
            ...body,
            sort_order: Number(body.sort_order),
        });

        const { authorized, response, supabase } = await verifyAdmin();
        if (!authorized) return response;

        const { data, error } = await supabase
            .from("homepage_slides")
            .update(validatedData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("PUT /api/v1/admin/homepage-slides/[id] Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message || "Failed to update slide" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { authorized, response, supabase } = await verifyAdmin();
        if (!authorized || !supabase) return response;

        const { error } = await supabase
            .from("homepage_slides")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE /api/v1/admin/homepage-slides/[id] Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to delete slide" }, { status: 500 });
    }
}
