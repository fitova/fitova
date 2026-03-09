import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/lib/queries/products";
import { getTrendingProducts } from "@/lib/queries/trending";
import { getBestSellers } from "@/lib/queries/bestSellers";
import { mapProductFromDB } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { ShopFilters } from "./useShopFilters";

const defaultFilters: ShopFilters = {
    category: [],
    gender: "",
    size: [],
    colors: [],
    minPrice: 0,
    maxPrice: 1000,
    style: [],
    season: [],
    brand: [],
    material: [],
    search: "",
    pieceTypeGroup: "",
};

function readInitialFilters(searchParams: URLSearchParams | null): ShopFilters {
    if (searchParams) {
        const gender = searchParams.get("gender") ?? "";
        const category = searchParams.getAll("category");
        const style = searchParams.getAll("style");
        const size = searchParams.getAll("size");
        const brand = searchParams.getAll("brand");
        const material = searchParams.getAll("material");
        const search = searchParams.get("search") ?? "";
        const pieceTypeGroup = searchParams.get("piece_type_group") ?? "";
        const colors = searchParams.getAll("color");

        if (gender || category.length > 0 || style.length > 0 || size.length > 0 ||
            brand.length > 0 || material.length > 0 || search || colors.length > 0 || pieceTypeGroup) {
            return { ...defaultFilters, gender, category, style, size, brand, material, search, colors, pieceTypeGroup };
        }
    }
    return defaultFilters;
}

export type TabType = "new-arrivals" | "trending" | "best-sellers";

export function useThisWeekFilters(activeTab: TabType) {
    const searchParams = useSearchParams();
    const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");
    const [filters, setFilters] = useState<ShopFilters>(() => readInitialFilters(searchParams));

    useEffect(() => {
        if (!searchParams) return;
        setFilters(readInitialFilters(searchParams));
    }, [searchParams]);

    const { data: products = [], isLoading: loading } = useQuery({
        queryKey: ["thisWeekProducts", { activeTab, ...filters }],
        queryFn: async () => {
            let data: any[] = [];

            // 1. Fetch base data for active tab
            if (activeTab === "trending") {
                data = await getTrendingProducts(60);
            } else if (activeTab === "best-sellers") {
                data = await getBestSellers(60);
            } else {
                // New Arrivals
                data = await getProducts({ sortBy: "0", limit: 60 });
            }

            // Map the data
            const mapped = data.map((p: any) => p.imgs ? p : mapProductFromDB(p));

            // 2. Client-side filter them based on `filters` (since trending/bestsellers dont have backend filter APIs yet)!
            return mapped.filter(p => {
                // Search
                if (filters.search && !p.title?.toLowerCase().includes(filters.search.toLowerCase())) return false;

                // Gender
                if (filters.gender && p.gender !== filters.gender && p.gender !== "Unisex") return false;

                // Min/Max Price
                const price = p.discountedPrice || p.price;
                if (price < filters.minPrice || price > filters.maxPrice) return false;

                // Colors
                if (filters.colors.length > 0) {
                    if (!p.colors || !filters.colors.some(c => p.colors.includes(c))) return false;
                }

                // Piece Type Group
                if (filters.pieceTypeGroup && p.piece_type?.toLowerCase() !== filters.pieceTypeGroup.toLowerCase()) {
                    // Very naive fallback
                    if (!p.piece_type && p.category?.toLowerCase() !== filters.pieceTypeGroup.toLowerCase()) return false;
                }

                return true;
            });
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (prev) => prev,
    });

    return {
        productStyle,
        setProductStyle,
        products,
        loading,
        filters,
        setFilters,
    };
}
