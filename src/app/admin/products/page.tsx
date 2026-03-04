"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Product = {
    id: string;
    name: string;
    price: number;
    imgs: { previews: string[] } | null;
    is_new_arrival: boolean;
    is_trending: boolean;
    is_bestseller: boolean;
    is_hidden: boolean;
};

const TAG_CONFIG = [
    { key: "is_new_arrival", label: "New", color: "bg-blue-50 text-blue-700" },
    { key: "is_trending", label: "Trending", color: "bg-orange-50 text-orange-700" },
    { key: "is_bestseller", label: "Best", color: "bg-green-50 text-green-700" },
    { key: "is_hidden", label: "Hidden", color: "bg-red-50 text-red-700" },
] as const;

export default function ProductsAdmin() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from("products")
            .select("id, name, price, imgs, is_new_arrival, is_trending, is_bestseller, is_hidden")
            .order("created_at", { ascending: false })
            .limit(100)
            .then(({ data }) => {
                setProducts((data as Product[]) ?? []);
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
                        Products
                    </h2>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <input
                        type="search"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputCls} min-w-[200px]`}
                    />
                    <button
                        onClick={() => router.push("/admin/products/new")}
                        className="text-xs font-light tracking-[0.15em] uppercase px-5 py-2.5 bg-[#0A0A0A] text-white hover:opacity-80 ease-out duration-200 whitespace-nowrap"
                    >
                        + Add Product
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse bg-[#F0EDEA]" />
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-[#E8E4DF] overflow-x-auto">
                    <table className="w-full text-sm font-light min-w-[700px]">
                        <thead>
                            <tr className="border-b border-[#E8E4DF] bg-[#FAFAF9]">
                                <th className="text-left px-4 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A] w-12"></th>
                                <th className="text-left px-4 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Product</th>
                                <th className="text-left px-4 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Price</th>
                                <th className="text-left px-4 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Tags</th>
                                <th className="text-left px-4 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-[#8A8A8A]">No products found.</td>
                                </tr>
                            ) : filtered.map((product) => {
                                const thumb = product.imgs?.previews?.[0] ?? null;
                                return (
                                    <tr key={product.id} className="border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF9]">
                                        {/* Thumbnail */}
                                        <td className="px-4 py-2">
                                            {thumb ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={thumb}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover border border-[#E8E4DF]"
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-[#F0EDEA] flex items-center justify-center">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                        <rect x="3" y="3" width="18" height="18" rx="1" stroke="#BCBCBC" strokeWidth="1.5" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" stroke="#BCBCBC" strokeWidth="1.5" />
                                                        <path d="M21 15l-5-5L5 21" stroke="#BCBCBC" strokeWidth="1.5" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            )}
                                        </td>

                                        {/* Name */}
                                        <td className="px-4 py-2">
                                            <p className="text-[#0A0A0A] font-light line-clamp-1">{product.name}</p>
                                            <p className="text-[10px] text-[#8A8A8A] mt-0.5 font-mono">{product.id.slice(0, 8)}…</p>
                                        </td>

                                        {/* Price */}
                                        <td className="px-4 py-2 text-[#4A4A4A] whitespace-nowrap">
                                            ${product.price?.toFixed(2) ?? "—"}
                                        </td>

                                        {/* Tags */}
                                        <td className="px-4 py-2">
                                            <div className="flex flex-wrap gap-1.5">
                                                {TAG_CONFIG.map((tag) => {
                                                    const isOn = product[tag.key as keyof Product] as boolean;
                                                    const isSaving = saving === `${product.id}-${tag.key}`;
                                                    return (
                                                        <button
                                                            key={tag.key}
                                                            onClick={() => toggleTag(product.id, tag.key as any, isOn)}
                                                            disabled={isSaving}
                                                            title={`Toggle ${tag.label}`}
                                                            className={`text-[10px] font-light tracking-wider uppercase px-2 py-0.5 border transition-all duration-150 disabled:opacity-50 ${isOn
                                                                ? `${tag.color} border-transparent`
                                                                : "border-[#E8E4DF] text-[#BCBCBC] bg-white hover:border-[#8A8A8A]"
                                                                }`}
                                                        >
                                                            {isSaving ? "…" : tag.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => router.push(`/admin/products/${product.id}`)}
                                                className="text-xs font-light tracking-[0.1em] uppercase px-3 py-1.5 border border-[#E8E4DF] text-[#4A4A4A] hover:border-[#0A0A0A] hover:text-[#0A0A0A] ease-out duration-200"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="px-5 py-3 border-t border-[#E8E4DF] text-xs font-light text-[#8A8A8A]">
                        {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                    </div>
                </div>
            )}
        </div>
    );
}
