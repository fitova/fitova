import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin(supabase: any, session: any) {
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();
    return !!profile?.is_admin;
}

const parseList = (s: string) =>
    s ? s.split(",").map((x: string) => x.trim()).filter(Boolean) : [];

// GET /api/v1/admin/products/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// PUT /api/v1/admin/products/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        if (!(await checkAdmin(supabase, session))) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

        const body = await req.json();

        const payload = {
            name: body.name,
            description: body.description || null,
            price: parseFloat(body.price) || 0,
            brand: body.brand || null,
            piece_type: body.piece_type || null,
            season: body.season || null,
            stock_status: body.stock_status || "In stock",
            affiliate_link: body.affiliate_link || null,
            commission: body.commission ? parseFloat(body.commission) : null,
            affiliate_program: body.affiliate_program || null,
            merchant_id: body.merchant_id || null,
            quantity: parseInt(body.quantity) || 0,
            tags: parseList(body.tags),
            colors: parseList(body.colors),
            styles: parseList(body.styles),
            size: parseList(body.size),
            material: body.material || null,
        };

        const { data, error } = await supabase
            .from("products")
            .update(payload)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// DELETE /api/v1/admin/products/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        if (!(await checkAdmin(supabase, session))) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true, data: null });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
