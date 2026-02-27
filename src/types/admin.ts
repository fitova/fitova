export interface DetailedAnalyticsData {
    counts: {
        products: number;
        categories: number;
        collections: number;
        offers: number;
        users: number;
        reviews: number;
        wishlist: number;
        newsletters: number;
        contacts: number;
        styleWorlds: number;
    };
    charts: {
        signups: { date: string; signups: number }[];
        topWishlist: { name: string; saves: number }[];
        offersPerformance: { name: string; used: number; remaining?: number }[];
        styleHubColors: { color: string; count: number }[];
    };
}

export interface Promotion {
    id: string;
    type: "offer" | "coupon";
    code: string | null;
    description: string;
    discount_type: "Percentage" | "Fixed";
    discount_value: number;
    valid_from: string | null;
    valid_to: string | null;
    created_at?: string;
}

export interface PromotionPayload {
    type: "offer" | "coupon";
    code?: string | null;
    description: string;
    discount_type: "Percentage" | "Fixed" | string;
    discount_value: number | string;
    valid_from?: string | null;
    valid_to?: string | null;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface AdminCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon_url: string | null;
    sort_order: number;
    created_at: string;
}

export interface AdminCategoryPayload {
    name: string;
    slug: string;
    description?: string | null;
    icon_url?: string | null;
    sort_order: number;
}
