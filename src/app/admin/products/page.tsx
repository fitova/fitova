"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

type Product = {
    id: string;
    name: string;
    price: number;
    is_new_arrival: boolean;
    is_trending: boolean;
    is_bestseller: boolean;
    is_hidden: boolean;
};

const TAG_CONFIG = [
    { key: "is_new_arrival", label: "New Arrival", color: "bg-blue-50 text-blue-700" },
    { key: "is_trending", label: "Trending", color: "bg-orange-50 text-orange-700" },
    { key: "is_bestseller", label: "Best Seller", color: "bg-green-50 text-green-700" },
    { key: "is_hidden", label: "Hidden", color: "bg-red-50 text-red-700" },
] as const;

export default function ProductsAdmin() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from("products")
            .select("id, name, price, is_new_arrival, is_trending, is_bestseller, is_hidden")
            .order("created_at", { ascending: false })
            .limit(100)
            .then(({ data }) => {
                setProducts(data ?? []);
                setLoading(false);
            });
    }, []);

    const toggleTag = async (
        productId: string,
        tag: keyof Pick<Product, "is_new_arrival" | "is_trending" | "is_bestseller" | "is_hidden">,
        current: boolean
    ) => {
        const key = `${productId}-${tag}`;
        setSaving(key);
        const supabase = createClient();
        const { error } = await supabase
            .from("products")
            .update({ [tag]: !current })
            .eq("id", productId);

        if (error) {
            toast.error("Failed to update tag");
        } else {
            setProducts((prev) =>
                prev.map((p) => (p.id === productId ? { ...p, [tag]: !current } : p))
            );
            toast.success("Updated!");
        }
        setSaving(null);
    };

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const inputCls = "border border-[#E8E4DF] bg-white px-4 py-2.5 text-sm font-light outline-none focus:border-[#0A0A0A] ease-out duration-200";

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <span className="text-xs font-light tracking-[0.3em] uppercase text-[#8A8A8A]">Admin</span>
                    <h2 className="font-playfair font-normal text-3xl text-[#0A0A0A] mt-1" style={{ letterSpacing: "-0.02em" }}>
                        Products &amp; Tagging
                    </h2>
                </div>
                <input
                    type="search"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${inputCls} min-w-[240px]`}
                />
            </div>

            {/* Tag legend */}
            <div className="flex flex-wrap gap-2 mb-4">
                {TAG_CONFIG.map((t) => (
                    <span key={t.key} className={`text-[10px] font-light tracking-wider uppercase px-2.5 py-1 ${t.color}`}>
                        {t.label}
                    </span>
                ))}
                <span className="text-xs font-light text-[#8A8A8A] ml-2 self-center">
                    — Click a badge to toggle on/off
                </span>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-14 animate-pulse bg-[#F0EDEA]" />
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-[#E8E4DF] overflow-x-auto">
                    <table className="w-full text-sm font-light min-w-[600px]">
                        <thead>
                            <tr className="border-b border-[#E8E4DF] bg-[#FAFAF9]">
                                <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A] w-[40%]">Product</th>
                                <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Price</th>
                                <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Tags</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-5 py-10 text-center text-[#8A8A8A]">No products found.</td>
                                </tr>
                            ) : filtered.map((product) => (
                                <tr key={product.id} className="border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF9]">
                                    <td className="px-5 py-3">
                                        <p className="text-[#0A0A0A] font-light line-clamp-1">{product.name}</p>
                                        <p className="text-[10px] text-[#8A8A8A] mt-0.5 font-mono">{product.id.slice(0, 8)}…</p>
                                    </td>
                                    <td className="px-5 py-3 text-[#4A4A4A]">
                                        ${product.price?.toFixed(2) ?? "—"}
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            {TAG_CONFIG.map((tag) => {
                                                const isOn = product[tag.key as keyof Product] as boolean;
                                                const isSaving = saving === `${product.id}-${tag.key}`;
                                                return (
                                                    <button
                                                        key={tag.key}
                                                        onClick={() => toggleTag(product.id, tag.key as any, isOn)}
                                                        disabled={isSaving}
                                                        className={`text-[10px] font-light tracking-wider uppercase px-2.5 py-1 border transition-all duration-150 disabled:opacity-50 ${isOn
                                                                ? `${tag.color} border-transparent`
                                                                : "border-[#E8E4DF] text-[#BCBCBC] bg-white hover:border-[#8A8A8A]"
                                                            }`}
                                                        title={`Toggle ${tag.label}`}
                                                    >
                                                        {isSaving ? "…" : tag.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
