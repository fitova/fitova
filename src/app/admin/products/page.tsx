"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
// ⚠ DATABASE CONFIGURATION REQUIRED HERE
// يجب وضع بيانات قاعدة البيانات الجديدة هنا

interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    stock_status: string;
    affiliate_link: string;
    piece_type: string;
    created_at: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        // ⚠ DATABASE CONFIGURATION REQUIRED HERE
        // يجب وضع بيانات قاعدة البيانات الجديدة هنا
        setProducts([]);
        setLoading(false);
    }, [search]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        // ⚠ DATABASE CONFIGURATION REQUIRED HERE
        // يجب وضع بيانات قاعدة البيانات الجديدة هنا
        fetchProducts();
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <span className="text-xs font-light tracking-[0.3em] uppercase text-[#8A8A8A]">Catalog</span>
                    <h2 className="font-playfair font-normal text-3xl text-[#0A0A0A] mt-1" style={{ letterSpacing: "-0.02em" }}>
                        Products
                    </h2>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 text-xs font-light tracking-[0.15em] uppercase border border-[#0A0A0A] bg-[#0A0A0A] text-white px-5 py-2.5 hover:bg-transparent hover:text-[#0A0A0A] ease-out duration-200"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    Add Product
                </Link>
            </div>

            {/* Search */}
            <div className="mb-5">
                <input
                    type="search"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-80 border border-[#E8E4DF] bg-white px-4 py-2.5 text-sm font-light outline-none focus:border-[#0A0A0A] ease-out duration-200"
                />
            </div>

            {/* Table */}
            <div className="bg-white border border-[#E8E4DF] overflow-x-auto">
                <table className="w-full text-sm font-light">
                    <thead>
                        <tr className="border-b border-[#E8E4DF] bg-[#FAFAF9]">
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Product</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Type</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Price</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Status</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Affiliate</th>
                            <th className="text-right px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="px-5 py-10 text-center text-[#8A8A8A]">Loading...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan={6} className="px-5 py-10 text-center text-[#8A8A8A]">No products found.</td></tr>
                        ) : (
                            products.map((p) => (
                                <tr key={p.id} className="border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF9] ease-out duration-150">
                                    <td className="px-5 py-4">
                                        <div>
                                            <p className="text-[#0A0A0A] font-normal">{p.name}</p>
                                            <p className="text-[#8A8A8A] text-xs">{p.brand}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-[#4A4A4A]">{p.piece_type ?? "—"}</td>
                                    <td className="px-5 py-4 text-[#0A0A0A]">${p.price}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-light tracking-wider uppercase ${p.stock_status === "In stock" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                                            {p.stock_status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        {p.affiliate_link ? (
                                            <a href={p.affiliate_link} target="_blank" rel="noopener noreferrer" className="text-[#8B7355] hover:underline text-xs truncate max-w-[160px] block">
                                                Link ↗
                                            </a>
                                        ) : (
                                            <span className="text-[#C8C4BF] text-xs">No link</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/admin/products/${p.id}`} className="text-xs text-[#4A4A4A] hover:text-[#0A0A0A] ease-out duration-200">Edit</Link>
                                            <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-700 ease-out duration-200">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
