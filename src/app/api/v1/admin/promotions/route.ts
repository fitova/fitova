import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const promotionSchema = z.object({
    type: z.enum(["offer", "coupon"]),
    code: z.string().optional().nullable(),
    description: z.string().min(1, "Description is required"),
    discount_type: z.string(), // "Percentage" or "Fixed"
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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");

        const { authorized, response, supabase } = await verifyAdmin();
        if (!authorized || !supabase) return response;

        let query = supabase.from("offers").select("*").order("created_at", { ascending: false });

        // If a type is provided in the query string, filter by it
        if (type && (type === "offer" || type === "coupon")) {
            query = query.eq("type", type);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("GET /api/v1/admin/promotions Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to fetch promotions" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate request body
        const validatedData = promotionSchema.parse({
            ...body,
            discount_value: Number(body.discount_value),
            valid_from: body.valid_from || null,
            valid_to: body.valid_to || null,
        });

        const { authorized, response, supabase } = await verifyAdmin();
        if (!authorized || !supabase) return response;

        const insertData = {
            type: validatedData.type,
            code: validatedData.type === "coupon" ? validatedData.code : null, // Ensure offers have no code
            description: validatedData.description,
            discount_type: validatedData.discount_type,
            discount_value: validatedData.discount_value,
            valid_from: validatedData.valid_from,
            valid_to: validatedData.valid_to,
        };

        const { data, error } = await supabase
            .from("offers")
            .insert(insertData)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/v1/admin/promotions Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message || "Failed to create promotion" }, { status: 500 });
    }
}
