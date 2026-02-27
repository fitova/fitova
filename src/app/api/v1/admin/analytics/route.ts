import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/admin";

export async function GET() {
    try {
        const { authorized, response, supabase } = await verifyAdmin();
        if (!authorized) return response;

        // Fetch counts for various entities
        const [
            { count: products },
            { count: categories },
            { count: collections },
            { count: offers },
            { count: users },
            { data: recentUsers }
        ] = await Promise.all([
            supabase.from("products").select("*", { count: "exact", head: true }),
            supabase.from("categories").select("*", { count: "exact", head: true }),
            supabase.from("collections").select("*", { count: "exact", head: true }),
            supabase.from("offers").select("*", { count: "exact", head: true }),
            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("profiles").select("created_at").order("created_at", { ascending: false }).limit(30)
        ]);

        // Format time-series data for a chart (mocking signups over the last few days based on recent users)
        const signupsByDay = (recentUsers || []).reduce((acc: any, curr: any) => {
            const date = curr.created_at.split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        const chartData = Object.keys(signupsByDay).map(date => ({
            date,
            signups: signupsByDay[date]
        })).sort((a, b) => a.date.localeCompare(b.date));

        // Provide some dummy secondary data for the bar chart as we don't have orders/views in the DB schema
        const topProductsData = [
            { name: "Linen Shirt", views: 2400 },
            { name: "Silk Dress", views: 1398 },
            { name: "Wool Coat", views: 9800 },
            { name: "Cotton Pants", views: 3908 },
        ];

        const data = {
            counts: {
                products: products || 0,
                categories: categories || 0,
                collections: collections || 0,
                offers: offers || 0,
                users: users || 0,
            },
            charts: {
                signups: chartData.length ? chartData : [{ date: new Date().toISOString().split('T')[0], signups: 0 }],
                topProducts: topProductsData
            }
        };

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("GET /api/v1/admin/analytics Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to fetch analytics data" }, { status: 500 });
    }
}
