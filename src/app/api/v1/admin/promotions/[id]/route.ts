import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const updatePromotionSchema = z.object({
    type: z.enum(["offer", "coupon"]),
    code: z.string().optional().nullable(),
    description: z.string().min(1, "Description is required"),
    discount_type: z.string(),
    discount_value: z.number().positive("Discount value must be positive"),
    valid_from: z.string().optional().nullable(),
    valid_to: z.string().optional().nullable(),
}).refine(data => {
    if (data.type === "coupon" && (!data.code || data.code.trim() === "")) {
        return false;
    }
    return true;
}, {
    message: "Coupon code is required for type 'coupon'",
    path: ["code"]
});

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const validatedData = updatePromotionSchema.parse({
            ...body,
            discount_value: Number(body.discount_value),
            valid_from: body.valid_from || null,
            valid_to: body.valid_to || null,
        });

        const { authorized, response, supabase } = await verifyAdmin();
        if (!authorized || !supabase) return response;

        const updateData = {
            type: validatedData.type,
            code: validatedData.type === "coupon" ? validatedData.code : null,
            description: validatedData.description,
            discount_type: validatedData.discount_type,
            discount_value: validatedData.discount_value,
            valid_from: validatedData.valid_from,
            valid_to: validatedData.valid_to,
        };

        const { data, error } = await supabase
            .from("offers")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("PUT /api/v1/admin/promotions/[id] Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message || "Failed to update promotion" }, { status: 500 });
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
            .from("offers")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE /api/v1/admin/promotions/[id] Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to delete promotion" }, { status: 500 });
    }
}
