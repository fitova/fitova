"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { LookbookCategory } from "@/lib/queries/lookbooks";

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    brand?: string | null;
    piece_type?: string | null;
    imgs?: { previews?: string[] } | null;
}

interface ProductPickerModalProps {
    category: LookbookCategory;
    onSelect: (product: Product) => void;
    onClose: () => void;
}

const PIECE_TYPE_FOR_CATEGORY: Record<LookbookCategory, string[]> = {
    top: ["tops", "shirts", "t-shirts", "blouses", "hoodies", "sweaters", "jackets", "coats"],
    pants: ["pants", "jeans", "shorts", "skirts", "trousers"],
    shoes: ["shoes", "sneakers", "boots", "sandals", "loafers", "heels"],
    accessories: ["accessories", "bags", "hats", "belts", "scarves", "sunglasses", "watches"],
    perfumes: ["perfumes", "fragrances"],
};

export default function ProductPickerModal({ category, onSelect, onClose }: ProductPickerModalProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const supabase = createClient();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const pieceTypes = PIECE_TYPE_FOR_CATEGORY[category];

        let query = supabase
            .from("products")
            .select("id, name, slug, price, brand, piece_type, imgs")
            .eq("is_visible", true)
            .in("piece_type", pieceTypes)
            .limit(60);

        if (search.trim()) {
            query = query.ilike("name", `%${search}%`);
        }

        const { data } = await query;
        setProducts((data ?? []) as Product[]);
        setLoading(false);
    }, [category, search]);

    useEffect(() => {
        const timer = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DF]">
                    <div>
                        <h2 className="text-sm font-light tracking-[0.15em] uppercase text-[#0A0A0A]">
                            Select {category.charAt(0).toUpperCase() + category.slice(1)}
                        </h2>
                        <p className="text-[11px] text-[#8A8A8A] font-light mt-0.5">Choose one product for this slot</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#F6F5F2] rounded-full transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#0A0A0A" strokeWidth="1.5">
                            <path d="M1 1L13 13M13 1L1 13" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-3 border-b border-[#E8E4DF]">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full text-sm font-light px-3 py-2 border border-[#E8E4DF] focus:outline-none focus:border-[#0A0A0A] transition-colors placeholder-[#C8C8C8]"
                        autoFocus
                    />
                </div>

                {/* Product Grid */}
                <div className="overflow-y-auto flex-1 p-6">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-square bg-[#E8E4DF] mb-2" />
                                    <div className="h-3 bg-[#E8E4DF] rounded w-3/4 mb-1" />
                                    <div className="h-3 bg-[#E8E4DF] rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-[#8A8A8A]">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <p className="text-sm font-light mt-3">No products found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {products.map((product) => {
                                const img = product.imgs?.previews?.[0];
                                return (
                                    <button
                                        key={product.id}
                                        onClick={() => onSelect(product)}
                                        className="group text-left border border-[#E8E4DF] hover:border-[#0A0A0A] transition-all duration-200 overflow-hidden"
                                    >
                                        <div className="aspect-square bg-[#F6F5F2] overflow-hidden">
                                            {img ? (
                                                <img
                                                    src={img}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#C8C8C8]">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <path d="m21 15-5-5L5 21" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2.5">
                                            <p className="text-[12px] font-light text-[#0A0A0A] truncate">{product.name}</p>
                                            {product.brand && (
                                                <p className="text-[10px] text-[#8A8A8A] font-light mt-0.5">{product.brand}</p>
                                            )}
                                            <p className="text-[12px] text-[#0A0A0A] font-light mt-1">${product.price}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
