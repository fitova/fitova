import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts, Product } from "@/lib/queries/products";
import { mapProductFromDB } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export interface ShopFilters {
    category: string;
    gender: string;
    size: string;
    colors: string[];
    minPrice: number;
    maxPrice: number;
    style: string;
    season: string;
    brand: string;
    material: string;
    search: string;
    pieceTypeGroup: string; // clothing | footwear | accessories | fragrances
}

const defaultFilters: ShopFilters = {
    category: "",
    gender: "",
    size: "",
    colors: [],
    minPrice: 0,
    maxPrice: 1000,
    style: "",
    season: "",
    brand: "",
    material: "",
    search: "",
    pieceTypeGroup: "",
};

function readInitialFilters(searchParams: URLSearchParams | null): ShopFilters {
    // 1. Check URL params first (highest priority — from MegaMenu links)
    if (searchParams) {
        const gender = searchParams.get("gender") ?? "";
        const category = searchParams.get("category") ?? "";
        const style = searchParams.get("style") ?? "";
        const size = searchParams.get("size") ?? "";
        const brand = searchParams.get("brand") ?? "";
        const material = searchParams.get("material") ?? "";
        const search = searchParams.get("search") ?? "";
        const pieceTypeGroup = searchParams.get("piece_type_group") ?? "";
        const colors = searchParams.getAll("color");

        if (gender || category || style || size || brand || material || search || colors.length > 0 || pieceTypeGroup) {
            return { ...defaultFilters, gender, category, style, size, brand, material, search, colors, pieceTypeGroup };
        }
    }

    // 2. Fallback: StyleHub localStorage filters
    if (typeof window !== "undefined") {
        try {
            const stored = localStorage.getItem("fitova_shop_filters");
            if (stored) {
                localStorage.removeItem("fitova_shop_filters");
                return { ...defaultFilters, ...JSON.parse(stored) };
            }
        } catch (_) { }
    }

    return defaultFilters;
}

export function useShopFilters() {
    const searchParams = useSearchParams();
    const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState("0");
    const [filters, setFilters] = useState<ShopFilters>(() =>
        readInitialFilters(null) // SSR-safe: no searchParams on first render
    );

    // Sync from URL params on mount and when URL changes
    useEffect(() => {
        if (!searchParams) return;
        setFilters(readInitialFilters(searchParams));
    }, [searchParams]);

    const { data: products = [], isLoading: loading } = useQuery({
        queryKey: ["products", { ...filters, sortBy }],
        queryFn: async () => {
            const data = await getProducts({
                gender: filters.gender || undefined,
                category: filters.category || undefined,
                style: filters.style || undefined,
                season: filters.season || undefined,
                brand: filters.brand || undefined,
                material: filters.material || undefined,
                colors: filters.colors.length > 0 ? filters.colors : undefined,
                size: filters.size || undefined,
                minPrice: filters.minPrice || undefined,
                maxPrice: filters.maxPrice < 1000 ? filters.maxPrice : undefined,
                sortBy,
                search: filters.search || undefined,
                pieceTypeGroup: filters.pieceTypeGroup || undefined,
            });
            return data.map((p: any) => p.imgs ? p : mapProductFromDB(p));
        },
        staleTime: 5 * 60 * 1000,
    });

    const sortOptions = [
        { label: "Latest Products", value: "0" },
        { label: "Best Selling", value: "1" },
        { label: "Old Products", value: "2" },
        { label: "Price: Low to High", value: "price_asc" },
        { label: "Price: High to Low", value: "price_desc" },
    ];

    return {
        productStyle,
        setProductStyle,
        sortBy,
        setSortBy,
        products,
        loading,
        filters,
        setFilters,
        sortOptions,
    };
}
