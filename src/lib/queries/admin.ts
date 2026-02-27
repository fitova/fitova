import { createClient } from "@/lib/supabase/client";

export async function getAdminStats() {
    const supabase = createClient();

    // Using count queries with { count: 'exact', head: true } for performance
    const [
        { count: totalProducts },
        { count: totalUsers },
        { count: totalOrders },
        { data: salesData }
    ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        // For sales amount we'd normally do a sum query via RPC or DB function
        supabase.from('orders').select('total_amount').eq('status', 'completed')
    ]);

    // Calculate total sales sum from returned data if an RPC isn't available yet
    let totalSalesVolume = 0;
    if (salesData) {
        totalSalesVolume = salesData.reduce((acc, order) => acc + (order.total_amount || 0), 0);
    }

    return {
        totalProducts: totalProducts || 0,
        totalUsers: totalUsers || 0,
        totalOrders: totalOrders || 0,
        totalSalesVolume: totalSalesVolume || 0,
    };
}

export async function getRecentProducts(limit = 5) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching recent products for admin:", error);
        return [];
    }
    return data;
}

export async function getTopProducts(limit = 5) {
    const supabase = createClient();
    // Assuming sold_count tracks sales or views_count tracks views
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('views_count', { ascending: false, nullsFirst: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching top products for admin:", error);
        return [];
    }
    return data;
}
