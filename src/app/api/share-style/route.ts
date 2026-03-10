import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { styles, recommended_colors, summary, analysis } = body;

        if (!styles || !recommended_colors) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from("ai_style_results")
            .insert({
                styles,
                recommended_colors,
                summary: summary || "",
                analysis: analysis || {},
                created_at: new Date().toISOString(),
            })
            .select("id")
            .single();

        if (error) {
            console.error("[Share Style] DB Error:", error.message);
            return NextResponse.json({ success: false, error: "Failed to save result" }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data.id });
    } catch (err: any) {
        console.error("[Share Style] Fatal Error:", err);
        return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from("ai_style_results")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            return NextResponse.json({ success: false, error: "Result not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error("[Share Style GET] Error:", err);
        return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
    }
}
