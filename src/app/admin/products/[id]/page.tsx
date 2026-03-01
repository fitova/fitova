"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AestheticColorWheel from "@/components/Admin/AestheticColorWheel";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";

const EMPTY = {
    name: "", description: "", price: "", brand: "", piece_type: "",
    season: "", stock_status: "In stock", affiliate_link: "", commission: "",
    affiliate_program: "", merchant_id: "", quantity: "0",
    tags: "", colors: "", styles: "", size: "", material: "",
};

function toFormValue(product: any) {
    return {
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        brand: product.brand || "",
        piece_type: product.piece_type || "",
        season: product.season || "",
        stock_status: product.stock_status || "In stock",
        affiliate_link: product.affiliate_link || "",
        commission: product.commission?.toString() || "",
        affiliate_program: product.affiliate_program || "",
        merchant_id: product.merchant_id || "",
        quantity: product.quantity?.toString() || "0",
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : (product.tags || ""),
        colors: Array.isArray(product.colors) ? product.colors.join(", ") : (product.colors || ""),
        styles: Array.isArray(product.styles) ? product.styles.join(", ") : (product.styles || ""),
        size: Array.isArray(product.size) ? product.size.join(", ") : (product.size || ""),
        material: product.material || "",
    };
}

export default function ProductFormPage() {
    const params = useParams();
    const isNew = params?.id === "new";
    const router = useRouter();
    const queryClient = useQueryClient();
    const [form, setForm] = useState(EMPTY);

    // Load existing product if editing
    const { data: existingProduct, isLoading: isLoadingProduct } = useQuery({
        queryKey: ["admin-product", params?.id],
        queryFn: () => adminService.getProduct(params!.id as string),
        enabled: !isNew && !!params?.id,
    });

    useEffect(() => {
        if (existingProduct) {
            setForm(toFormValue(existingProduct));
        }
    }, [existingProduct]);

    const parseList = (s: string) =>
        s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];

    const mutationCreate = useMutation({
        mutationFn: adminService.createProduct,
        onSuccess: () => {
            toast.success("Product created!");
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            router.push("/admin/products");
        },
        onError: (err: any) => toast.error(err.message || "Failed to create product"),
    });

    const mutationUpdate = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => adminService.updateProduct(id, payload),
        onSuccess: () => {
            toast.success("Product updated!");
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["admin-product", params?.id] });
            router.push("/admin/products");
        },
        onError: (err: any) => toast.error(err.message || "Failed to update product"),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.price) { toast.error("Name and price are required."); return; }

        const payload = { ...form };

        if (isNew) {
            mutationCreate.mutate(payload);
        } else {
            mutationUpdate.mutate({ id: params!.id as string, payload });
        }
    };

    const loading = mutationCreate.isPending || mutationUpdate.isPending;

    const inputCls = "w-full border border-[#E8E4DF] bg-white px-4 py-2.5 text-sm font-light outline-none focus:border-[#0A0A0A] ease-out duration-200";
    const labelCls = "block text-xs font-light tracking-[0.15em] uppercase text-[#4A4A4A] mb-1.5";

    if (!isNew && isLoadingProduct) {
        return <div className="text-sm text-[#8A8A8A] py-10 text-center">Loading product...</div>;
    }

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <span className="text-xs font-light tracking-[0.3em] uppercase text-[#8A8A8A]">Products</span>
                <h2 className="font-playfair font-normal text-3xl text-[#0A0A0A] mt-1" style={{ letterSpacing: "-0.02em" }}>
                    {isNew ? "Add Product" : "Edit Product"}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Info */}
                <div className="bg-white border border-[#E8E4DF] p-6 space-y-4">
                    <p className="text-xs font-light tracking-[0.2em] uppercase text-[#8A8A8A] pb-2 border-b border-[#E8E4DF]">Basic Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Product Name *</label>
                            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Classic White Tee" required />
                        </div>
                        <div>
                            <label className={labelCls}>Brand</label>
                            <input className={inputCls} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Fitova Basics" />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Description</label>
                        <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description..." />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <label className={labelCls}>Price ($) *</label>
                            <input type="number" step="0.01" className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="49.99" required />
                        </div>
                        <div>
                            <label className={labelCls}>Quantity</label>
                            <input type="number" className={inputCls} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
                        </div>
                        <div>
                            <label className={labelCls}>Stock Status</label>
                            <select className={inputCls} value={form.stock_status} onChange={(e) => setForm({ ...form, stock_status: e.target.value })}>
                                <option>In stock</option>
                                <option>Out of stock</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Season</label>
                            <select className={inputCls} value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })}>
                                <option value="">Any</option>
                                <option>Spring</option>
                                <option>Summer</option>
                                <option>Autumn</option>
                                <option>Winter</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Piece Type</label>
                            <input className={inputCls} value={form.piece_type} onChange={(e) => setForm({ ...form, piece_type: e.target.value })} placeholder="e.g. T-Shirt, Jacket, Pants" />
                        </div>
                        <div>
                            <label className={labelCls}>Material</label>
                            <input className={inputCls} value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} placeholder="e.g. 100% Cotton" />
                        </div>
                    </div>
                </div>

                {/* Affiliate */}
                <div className="bg-white border border-[#E8E4DF] p-6 space-y-4">
                    <p className="text-xs font-light tracking-[0.2em] uppercase text-[#8A8A8A] pb-2 border-b border-[#E8E4DF]">🔗 Affiliate Details</p>
                    <div>
                        <label className={labelCls}>Affiliate Link *</label>
                        <input className={inputCls} value={form.affiliate_link} onChange={(e) => setForm({ ...form, affiliate_link: e.target.value })} placeholder="https://partner.com/product?ref=fitova" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className={labelCls}>Commission (%)</label>
                            <input type="number" step="0.01" className={inputCls} value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} placeholder="10.00" />
                        </div>
                        <div>
                            <label className={labelCls}>Affiliate Program</label>
                            <input className={inputCls} value={form.affiliate_program} onChange={(e) => setForm({ ...form, affiliate_program: e.target.value })} placeholder="e.g. Amazon, Shareasale" />
                        </div>
                        <div>
                            <label className={labelCls}>Merchant ID</label>
                            <input className={inputCls} value={form.merchant_id} onChange={(e) => setForm({ ...form, merchant_id: e.target.value })} placeholder="merchant-123" />
                        </div>
                    </div>
                </div>

                {/* Attributes */}
                <div className="bg-white border border-[#E8E4DF] p-6 space-y-4">
                    <p className="text-xs font-light tracking-[0.2em] uppercase text-[#8A8A8A] pb-2 border-b border-[#E8E4DF]">Attributes (comma-separated)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Sizes</label>
                            <input className={inputCls} value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="XS, S, M, L, XL" />
                        </div>
                        <div>
                            <label className={labelCls}>Selected Colors</label>
                            <div className="flex gap-2 flex-wrap mb-3 p-2 border border-[#E8E4DF] bg-[#FAFAF9] min-h-[42px] items-center">
                                {parseList(form.colors).length === 0 ? (
                                    <span className="text-xs text-[#8A8A8A] italic">No colors added yet</span>
                                ) : (
                                    parseList(form.colors).map((c, i) => (
                                        <div key={i} className="flex items-center gap-1.5 bg-white border border-[#E8E4DF] shadow-sm rounded-full pl-1.5 pr-2 py-1">
                                            <span className="w-4 h-4 rounded-full border border-[#E8E4DF]" style={{ backgroundColor: c }} />
                                            <span className="text-[10px] uppercase tracking-wider font-light text-[#0A0A0A]">{c}</span>
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, colors: parseList(form.colors).filter((_, idx) => idx !== i).join(", ") })}
                                                className="text-[10px] text-[#8A8A8A] hover:text-red-500 ml-1 transition"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="flex justify-center mt-4">
                                <AestheticColorWheel
                                    size={180}
                                    selectedColors={parseList(form.colors)}
                                    onChange={(c) => {
                                        const current = parseList(form.colors);
                                        const next = current.includes(c)
                                            ? current.filter(x => x !== c)
                                            : [...current, c];
                                        setForm({ ...form, colors: next.join(", ") });
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Styles</label>
                            <input className={inputCls} value={form.styles} onChange={(e) => setForm({ ...form, styles: e.target.value })} placeholder="Casual, Formal, Minimalist" />
                        </div>
                        <div>
                            <label className={labelCls}>Tags</label>
                            <input className={inputCls} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="cotton, basics, summer" />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 text-xs font-light tracking-[0.15em] uppercase border border-[#0A0A0A] bg-[#0A0A0A] text-white px-6 py-3 hover:bg-transparent hover:text-[#0A0A0A] ease-out duration-200 disabled:opacity-60"
                    >
                        {loading ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/admin/products")}
                        className="text-xs font-light tracking-[0.15em] uppercase border border-[#E8E4DF] text-[#4A4A4A] px-6 py-3 hover:border-[#0A0A0A] ease-out duration-200"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
