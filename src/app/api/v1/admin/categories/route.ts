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

export async function GET() {
    try {
        const { authorized, response, supabase } = await verifyAdmin();
        if (!authorized) return response;

        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("sort_order", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("GET /api/v1/admin/categories Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validatedData = categorySchema.parse({
            ...body,
            sort_order: Number(body.sort_order),
        });

        const { authorized, response, supabase } = await verifyAdmin();
        if (!authorized) return response;

        const { data, error } = await supabase
            .from("categories")
            .insert(validatedData)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/v1/admin/categories Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
        }
        // Handle uniqueness error for slug
        if (error.code === '23505') {
            return NextResponse.json({ success: false, error: "Category slug must be unique" }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message || "Failed to create category" }, { status: 500 });
    }
}
