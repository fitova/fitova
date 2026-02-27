import axios from "axios";
import { Promotion, PromotionPayload, ApiResponse, AdminCategory, AdminCategoryPayload, DetailedAnalyticsData } from "@/types/admin";
import { HomepageSlide } from "@/types/homepage_slide";

export interface AnalyticsData {
    counts: {
        products: number;
        categories: number;
        collections: number;
        offers: number;
        users: number;
    };
    charts: {
        signups: { date: string; signups: number }[];
        topProducts: { name: string; views: number }[];
    };
}

const API_BASE = "/api/v1/admin";

export const adminService = {
    // --- Promotions (Offers & Coupons) ---

    async getPromotions(type?: "offer" | "coupon"): Promise<Promotion[]> {
        const url = type ? `${API_BASE}/promotions?type=${type}` : `${API_BASE}/promotions`;
        const response = await axios.get<ApiResponse<Promotion[]>>(url);
        if (!response.data.success) throw new Error(response.data.error);
        return response.data.data || [];
    },

    async createPromotion(payload: PromotionPayload): Promise<Promotion> {
        const response = await axios.post<ApiResponse<Promotion>>(`${API_BASE}/promotions`, payload);
        if (!response.data.success) throw new Error(response.data.error);
        return response.data.data!;
    },

    async updatePromotion(id: string, payload: PromotionPayload): Promise<Promotion> {
        const response = await axios.put<ApiResponse<Promotion>>(`${API_BASE}/promotions/${id}`, payload);
        if (!response.data.success) throw new Error(response.data.error);
        return response.data.data!;
    },

    async deletePromotion(id: string): Promise<void> {
        const response = await axios.delete<ApiResponse<void>>(`${API_BASE}/promotions/${id}`);
        if (!response.data.success) throw new Error(response.data.error);
    },

    // --- Homepage Slides ---

    async getHomepageSlides(): Promise<HomepageSlide[]> {
        const response = await axios.get<ApiResponse<HomepageSlide[]>>(`${API_BASE}/homepage-slides`);
        if (!response.data.success) throw new Error(response.data.error);
        return response.data.data || [];
    },

    async createHomepageSlide(payload: Omit<HomepageSlide, "id" | "created_at">): Promise<HomepageSlide> {
        const response = await axios.post<ApiResponse<HomepageSlide>>(`${API_BASE}/homepage-slides`, payload);
        if (!response.data.success) throw new Error(response.data.error);
        return response.data.data!;
    },

    async updateHomepageSlide(id: string, payload: Omit<HomepageSlide, "id" | "created_at">): Promise<HomepageSlide> {
        const response = await axios.put<ApiResponse<HomepageSlide>>(`${API_BASE}/homepage-slides/${id}`, payload);
        if (!response.data.success) throw new Error(response.data.error);
        return response.data.data!;
    },

    async deleteHomepageSlide(id: string): Promise<void> {
        const response = await axios.delete<ApiResponse<void>>(`${API_BASE}/homepage-slides/${id}`);
        if (!response.data.success) throw new Error(response.data.error);
    },

    // --- Analytics ---
    async getAnalytics(): Promise<AnalyticsData> {
        const response = await axios.get<ApiResponse<AnalyticsData>>(`${API_BASE}/analytics`);
        if (!response.data.success) throw new Error(response.data.error);
        return response.data.data!;
    },

    async getDetailedAnalytics(): Promise<DetailedAnalyticsData> {
        const response = await axios.get<ApiResponse<DetailedAnalyticsData>>(`${API_BASE}/detailed-analytics`);
        if (!response.data.success) throw new Error(response.data.error);
        return response.data.data!;
    },

    // --- Categories ---
    async getCategories(): Promise<AdminCategory[]> {
        const response = await axios.get<ApiResponse<AdminCategory[]>>(`${API_BASE}/categories`);
        if (!response.data.success) throw new Error(response.data.error);
        return response.data.data || [];
    },

    async createCategory(payload: AdminCategoryPayload): Promise<AdminCategory> {
        const response = await axios.post<ApiResponse<AdminCategory>>(`${API_BASE}/categories`, payload);
        if (!response.data.success) throw new Error(response.data.error);
        return response.data.data!;
    },

    async updateCategory(id: string, payload: AdminCategoryPayload): Promise<AdminCategory> {
        const response = await axios.put<ApiResponse<AdminCategory>>(`${API_BASE}/categories/${id}`, payload);
        if (!response.data.success) throw new Error(response.data.error);
        return response.data.data!;
    },

    async deleteCategory(id: string): Promise<void> {
        const response = await axios.delete<ApiResponse<void>>(`${API_BASE}/categories/${id}`);
        if (!response.data.success) throw new Error(response.data.error);
    },
};
