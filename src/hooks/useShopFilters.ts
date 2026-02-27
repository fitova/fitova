import { useState, useEffect } from "react";
import { getProducts, Product } from "@/lib/queries/products";
import { mapProductFromDB } from "@/types/product";

export function useShopFilters() {
    const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState("0");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Active filter state
    const [filters, setFilters] = useState({
        category: "",
        gender: "",
        size: "",
        colors: [] as string[],
        minPrice: 0,
        maxPrice: 1000,
    });

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                // Note: in a real app, pass filters and sortBy to getProducts
                const data = await getProducts();

                // Ensure products are consistently mapped whether or not they need it
                // Some places might return raw DB rows, some might already return mapped Product objects
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
