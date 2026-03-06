import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/lib/queries/products";
import { mapProductFromDB } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export interface ShopFilters {
    category: string[];      // multi-select
    gender: string;          // single (Men / Women / Kids)
    size: string[];          // multi-select
    colors: string[];        // multi-select
    minPrice: number;
    maxPrice: number;
    style: string[];         // multi-select
    season: string[];        // multi-select
    brand: string[];         // multi-select
    material: string[];      // multi-select
    search: string;
    pieceTypeGroup: string;  // single (clothing / footwear / accessories / fragrances)
}

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

    // Fallback: StyleHub localStorage filters
    if (typeof window !== "undefined") {
        try {
            const stored = localStorage.getItem("fitova_shop_filters");
            if (stored) {
                localStorage.removeItem("fitova_shop_filters");
                const parsed = JSON.parse(stored);
                // Normalize legacy string values to arrays
                return {
                    ...defaultFilters,
                    ...parsed,
                    style: Array.isArray(parsed.style) ? parsed.style : (parsed.style ? [parsed.style] : []),
                    season: Array.isArray(parsed.season) ? parsed.season : (parsed.season ? [parsed.season] : []),
                    brand: Array.isArray(parsed.brand) ? parsed.brand : (parsed.brand ? [parsed.brand] : []),
                    material: Array.isArray(parsed.material) ? parsed.material : (parsed.material ? [parsed.material] : []),
                };
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
        readInitialFilters(searchParams)
    );

    // Keep filters in sync when URL params change (MegaMenu navigation)
    useEffect(() => {
        if (!searchParams) return;
        setFilters(readInitialFilters(searchParams));
    }, [searchParams]);

    const { data: products = [], isLoading: loading } = useQuery({
        queryKey: ["products", { ...filters, sortBy }],
        queryFn: async () => {
            const data = await getProducts({
                gender: filters.gender || undefined,
                // Multi-select: pass first selected or handle via OR in query
                category: filters.category[0] || undefined,
                // Pass first selected style/season/brand/material for now
                // (full OR support requires query builder extension)
                style: filters.style[0] || undefined,
                season: filters.season[0] || undefined,
                brand: filters.brand[0] || undefined,
                material: filters.material[0] || undefined,
                sizes: filters.size.length > 0 ? filters.size : undefined,
                colors: filters.colors.length > 0 ? filters.colors : undefined,
                minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
                maxPrice: filters.maxPrice < 1000 ? filters.maxPrice : undefined,
                sortBy,
                search: filters.search || undefined,
                pieceTypeGroup: filters.pieceTypeGroup || undefined,
            });
            return data.map((p: any) => p.imgs ? p : mapProductFromDB(p));
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (prev) => prev,
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
