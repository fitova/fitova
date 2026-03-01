import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional().nullable(),
    icon_url: z.string().url("Must be a valid URL").optional().nullable(),
    sort_order: z.number().int().nonnegative().default(0),
});

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const validatedData = categorySchema.parse({
            ...body,
            sort_order: Number(body.sort_order),
        });

        const { authorized, response, supabase } = await verifyAdmin();
        if (!authorized) return response;

        const { data, error } = await supabase
            .from("categories")
            .update(validatedData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("PUT /api/v1/admin/categories/[id] Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
        }
        if (error.code === '23505') {
            return NextResponse.json({ success: false, error: "Category slug must be unique" }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message || "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { authorized, response, supabase } = await verifyAdmin();
        if (!authorized) return response;

        const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE /api/v1/admin/categories/[id] Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to delete category" }, { status: 500 });
    }
}
