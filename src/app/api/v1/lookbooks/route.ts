import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/v1/lookbooks
 * Body: { name: string, description?: string, cover_image?: string, product_ids: string[] }
 * Creates a collection (lookbook) + collection_products entries.
 * Requires an authenticated session.
 */
export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    // Auth guard
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
        name,
        description,
        cover_image,
        gender,
        styles,
        colors,
        tag,
        is_draft = false,
        product_ids = [],
    } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Lookbook name is required" }, { status: 400 });
    }

    // Build a URL-safe slug
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 80)
        + "-" + Date.now().toString(36);

    // Create the collection
    const { data: collection, error: collError } = await supabase
        .from("collections")
        .insert({
            name: name.trim(),
            slug,
            description: description?.trim() || null,
            cover_image: cover_image ?? null,
            user_id: user.id,
            gender: gender || null,
            styles: styles ?? [],
            colors: colors ?? [],
            tag: tag?.trim() || null,
            is_featured: false,
            generated_by_ai: false,
            display_order: 0,
            is_draft: is_draft ?? false,
        })
        .select("id, slug")
        .single();

    if (collError || !collection) {
        console.error("[lookbooks POST]", collError);
        return NextResponse.json({ error: "Failed to create lookbook" }, { status: 500 });
    }

    // Add products if supplied
    if (product_ids.length > 0) {
        const rows = product_ids.map((pid: string, idx: number) => ({
            collection_id: collection.id,
            product_id: pid,
            sort_order: idx,
        }));
        const { error: prodError } = await supabase
            .from("collection_products")
            .insert(rows);

        if (prodError) {
            console.error("[lookbooks POST products]", prodError);
            // Non-fatal — lookbook is created but products may not all be linked
        }
    }

    return NextResponse.json(
        { id: collection.id, slug: collection.slug },
        { status: 201 }
    );
}

/**
 * GET /api/v1/lookbooks
 * Returns the current user's lookbooks, newest first.
 */
export async function GET(_req: NextRequest) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("collections")
        .select("id, name, slug, cover_image, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: "Failed to fetch lookbooks" }, { status: 500 });
    }

    return NextResponse.json({ lookbooks: data ?? [] });
}
