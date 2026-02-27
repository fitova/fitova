import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/admin";

export async function GET() {
    try {
        const { authorized, response, supabase } = await verifyAdmin();
        if (!authorized) return response;

        // Fire off all count queries concurrently
        const [
            { count: products },
            { count: categories },
            { count: collections },
            { count: offers },
            { count: users },
            { count: reviews },
            { count: wishlist },
            { count: newsletters },
            { count: contacts },
            { count: styleWorlds },

            // Fetch data for charts
            { data: signupsData },
            { data: wishlistData },
            { data: styleWorldData },
            { data: offersData }
        ] = await Promise.all([
            // Counts
            supabase.from("products").select("*", { count: "exact", head: true }),
            supabase.from("categories").select("*", { count: "exact", head: true }),
            supabase.from("collections").select("*", { count: "exact", head: true }),
            supabase.from("offers").select("*", { count: "exact", head: true }),
            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("product_reviews").select("*", { count: "exact", head: true }),
            supabase.from("wishlist").select("*", { count: "exact", head: true }),
            supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
            supabase.from("contact_messages").select("*", { count: "exact", head: true }),
            supabase.from("saved_style_worlds").select("*", { count: "exact", head: true }),

            // Data Arrays for aggregations
            supabase.from("profiles").select("created_at").order("created_at", { ascending: false }).limit(100),
            supabase.from("wishlist").select("product_id, products(name)").limit(500),
            supabase.from("saved_style_worlds").select("filters"),
            supabase.from("offers").select("code, discount_value, type, current_uses, max_uses, is_active").limit(50)
        ]);

        // 1. Process User Signups over time (last 14 days approximation from 100 rows)
        const signupsMap: Record<string, number> = {};
        (signupsData || []).forEach(u => {
            const d = u.created_at.split('T')[0];
            signupsMap[d] = (signupsMap[d] || 0) + 1;
        });
        const signupsChart = Object.keys(signupsMap)
            .sort((a, b) => a.localeCompare(b))
            .map(k => ({ date: k, signups: signupsMap[k] }));

        // 2. Process Top Wishlisted Products
        const wlMap: Record<string, { views: number, name: string }> = {};
        (wishlistData || []).forEach(w => {
            const pid = w.product_id;
            // products() might be an array or object depending on join, safely extract name
            const pName = w.products && !Array.isArray(w.products) ? (w.products as any).name : Array.isArray(w.products) ? w.products[0]?.name : pid;
            if (!wlMap[pid]) wlMap[pid] = { views: 0, name: pName || pid };
            wlMap[pid].views += 1;
        });
        const topWishlistChart = Object.values(wlMap)
            .sort((a, b) => b.views - a.views)
            .slice(0, 5) // top 5
            .map(item => ({ name: item.name.substring(0, 15) + (item.name.length > 15 ? '...' : ''), saves: item.views }));

        // 3. Process Offers Performance
        const offersChart = (offersData || [])
            .filter(o => o.current_uses > 0 || o.max_uses)
            .map(o => ({
                name: o.code || o.type,
                used: o.current_uses || 0,
                remaining: o.max_uses ? (o.max_uses - (o.current_uses || 0)) : 0
            }))
            .sort((a, b) => b.used - a.used)
            .slice(0, 5);

        // 4. Preferred Colors in Style Hub (Example of deep analytics)
        const colorMap: Record<string, number> = {};
        (styleWorldData || []).forEach(sw => {
            if (sw.filters && typeof sw.filters === 'object') {
                const colors = (sw.filters as any).color || [];
                colors.forEach((c: string) => {
                    colorMap[c] = (colorMap[c] || 0) + 1;
                });
            }
        });
        const styleHubColorsChart = Object.keys(colorMap)
            .map(c => ({ color: c, count: colorMap[c] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);

        const data = {
            counts: {
                products: products || 0,
                categories: categories || 0,
                collections: collections || 0,
                offers: offers || 0,
                users: users || 0,
                reviews: reviews || 0,
                wishlist: wishlist || 0,
                newsletters: newsletters || 0,
                contacts: contacts || 0,
                styleWorlds: styleWorlds || 0,
            },
            charts: {
                signups: signupsChart.length ? signupsChart : [{ date: new Date().toISOString().split('T')[0], signups: 0 }],
                topWishlist: topWishlistChart.length ? topWishlistChart : [{ name: "No Data", saves: 0 }],
                offersPerformance: offersChart.length ? offersChart : [{ name: "No usages", used: 0 }],
                styleHubColors: styleHubColorsChart.length ? styleHubColorsChart : [{ color: "No saves", count: 0 }]
            }
        };

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("GET /api/v1/admin/detailed-analytics Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to fetch detailed analytics data" }, { status: 500 });
    }
}
