import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts, Product } from "@/lib/queries/products";
import { mapProductFromDB } from "@/types/product";

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
        const colors = searchParams.getAll("color");

        if (gender || category || style || size || brand || material || search || colors.length > 0) {
            return { ...defaultFilters, gender, category, style, size, brand, material, search, colors };
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
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ShopFilters>(() =>
        readInitialFilters(null) // SSR-safe: no searchParams on first render
    );

    // Sync from URL params on mount and when URL changes
    useEffect(() => {
        if (!searchParams) return;
        setFilters(readInitialFilters(searchParams));
    }, [searchParams]);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
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
                });
                const mapped = data.map((p: any) => p.imgs ? p : mapProductFromDB(p));
                setProducts(mapped);
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [filters, sortBy]);

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
