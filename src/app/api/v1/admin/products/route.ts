import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/v1/admin/products?search=xxx
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const search = req.nextUrl.searchParams.get("search") ?? "";

        let query = supabase
            .from("products")
            .select("id, name, brand, price, stock_status, affiliate_link, piece_type, created_at")
            .order("created_at", { ascending: false });

        if (search) {
            query = query.ilike("name", `%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// POST /api/v1/admin/products
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        // Check is_admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", session.user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();

        const parseList = (s: string) =>
            s ? s.split(",").map((x: string) => x.trim()).filter(Boolean) : [];

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
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
