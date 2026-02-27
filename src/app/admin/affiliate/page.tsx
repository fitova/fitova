"use client";
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
// ⚠ DATABASE CONFIGURATION REQUIRED HERE
// يجب وضع بيانات قاعدة البيانات الجديدة هنا

interface Product { id: string; name: string; brand: string; affiliate_link: string; affiliate_program: string; commission: number; merchant_id: string; }

export default function AdminAffiliatePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState({ affiliate_link: "", commission: "", affiliate_program: "", merchant_id: "" });

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        // ⚠ DATABASE CONFIGURATION REQUIRED HERE
        // يجب وضع بيانات قاعدة البيانات الجديدة هنا
        setProducts([]);
        setLoading(false);
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const startEdit = (p: Product) => {
        setEditingId(p.id);
        setEditData({ affiliate_link: p.affiliate_link ?? "", commission: String(p.commission ?? ""), affiliate_program: p.affiliate_program ?? "", merchant_id: p.merchant_id ?? "" });
    };

    const saveEdit = async (id: string) => {
        // ⚠ DATABASE CONFIGURATION REQUIRED HERE
        // يجب وضع بيانات قاعدة البيانات الجديدة هنا
        toast.success("Affiliate details updated!");
        setEditingId(null);
        fetchProducts();
    };

    const inputCls = "border border-[#E8E4DF] bg-white px-3 py-1.5 text-sm font-light outline-none focus:border-[#0A0A0A] ease-out duration-200 w-full";

    return (
        <div>
            <div className="mb-8">
                <span className="text-xs font-light tracking-[0.3em] uppercase text-[#8A8A8A]">Revenue</span>
                <h2 className="font-playfair font-normal text-3xl text-[#0A0A0A] mt-1" style={{ letterSpacing: "-0.02em" }}>Affiliate Links</h2>
                <p className="text-sm font-light text-[#8A8A8A] mt-1">Manage affiliate links and commissions for all products.</p>
            </div>

            <div className="bg-white border border-[#E8E4DF] overflow-x-auto">
                <table className="w-full text-sm font-light">
                    <thead>
                        <tr className="border-b border-[#E8E4DF] bg-[#FAFAF9]">
                            {["Product", "Affiliate Link", "Program", "Commission", "Merchant ID", ""].map((h) => (
                                <th key={h} className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (<tr><td colSpan={6} className="px-5 py-10 text-center text-[#8A8A8A]">Loading...</td></tr>)
                            : products.length === 0 ? (<tr><td colSpan={6} className="px-5 py-10 text-center text-[#8A8A8A]">No products yet.</td></tr>)
                                : products.map((p) => (
                                    <tr key={p.id} className="border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF9]">
                                        <td className="px-5 py-4">
                                            <div><p className="text-[#0A0A0A] font-normal">{p.name}</p><p className="text-[#8A8A8A] text-xs">{p.brand}</p></div>
                                        </td>
                                        {editingId === p.id ? (
                                            <>
                                                <td className="px-5 py-3"><input className={inputCls} value={editData.affiliate_link} onChange={(e) => setEditData({ ...editData, affiliate_link: e.target.value })} placeholder="https://..." /></td>
                                                <td className="px-5 py-3"><input className={inputCls} value={editData.affiliate_program} onChange={(e) => setEditData({ ...editData, affiliate_program: e.target.value })} placeholder="Amazon" /></td>
                                                <td className="px-5 py-3"><input type="number" step="0.01" className={inputCls} style={{ width: 80 }} value={editData.commission} onChange={(e) => setEditData({ ...editData, commission: e.target.value })} placeholder="10" /></td>
                                                <td className="px-5 py-3"><input className={inputCls} value={editData.merchant_id} onChange={(e) => setEditData({ ...editData, merchant_id: e.target.value })} placeholder="merchant-id" /></td>
                                                <td className="px-5 py-3">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => saveEdit(p.id)} className="text-xs text-white bg-[#0A0A0A] px-3 py-1.5 hover:bg-[#2C2C2C] ease-out duration-200">Save</button>
                                                        <button onClick={() => setEditingId(null)} className="text-xs text-[#8A8A8A] hover:text-[#0A0A0A]">Cancel</button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-5 py-4">{p.affiliate_link ? (<a href={p.affiliate_link} target="_blank" rel="noopener noreferrer" className="text-[#8B7355] hover:underline text-xs truncate max-w-[180px] block">Link ↗</a>) : (<span className="text-[#C8C4BF] text-xs">—</span>)}</td>
                                                <td className="px-5 py-4 text-[#4A4A4A]">{p.affiliate_program || "—"}</td>
                                                <td className="px-5 py-4 text-[#0A0A0A]">{p.commission ? `${p.commission}%` : "—"}</td>
                                                <td className="px-5 py-4 text-[#8A8A8A] text-xs">{p.merchant_id || "—"}</td>
                                                <td className="px-5 py-4"><button onClick={() => startEdit(p)} className="text-xs text-[#4A4A4A] hover:text-[#0A0A0A]">Edit</button></td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
