"use client";
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
// ⚠ DATABASE CONFIGURATION REQUIRED HERE
// يجب وضع بيانات قاعدة البيانات الجديدة هنا

interface Collection { id: string; name: string; product_ids: string[]; generated_by_ai: boolean; created_at: string; }
interface Product { id: string; name: string; }

export default function AdminCollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Collection | null>(null);
    const [name, setName] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        // ⚠ DATABASE CONFIGURATION REQUIRED HERE
        // يجب وضع بيانات قاعدة البيانات الجديدة هنا
        setCollections([]);
        setProducts([]);
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openNew = () => { setEditing(null); setName(""); setSelectedIds([]); setShowForm(true); };
    const openEdit = (c: Collection) => { setEditing(c); setName(c.name); setSelectedIds(c.product_ids ?? []); setShowForm(true); };

    const toggleProduct = (id: string) =>
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) { toast.error("Name is required."); return; }
        setSaving(true);
        // ⚠ DATABASE CONFIGURATION REQUIRED HERE
        // يجب وضع بيانات قاعدة البيانات الجديدة هنا

        setTimeout(() => {
            setSaving(false);
            toast.success(editing ? "Collection updated!" : "Collection created!");
            setShowForm(false);
            fetchData();
        }, 500);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this collection?")) return;
        // ⚠ DATABASE CONFIGURATION REQUIRED HERE
        // يجب وضع بيانات قاعدة البيانات الجديدة هنا
        fetchData();
    };

    const inputCls = "w-full border border-[#E8E4DF] bg-white px-4 py-2.5 text-sm font-light outline-none focus:border-[#0A0A0A] ease-out duration-200";
    const labelCls = "block text-xs font-light tracking-[0.15em] uppercase text-[#4A4A4A] mb-1.5";

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <span className="text-xs font-light tracking-[0.3em] uppercase text-[#8A8A8A]">Lookbook</span>
                    <h2 className="font-playfair font-normal text-3xl text-[#0A0A0A] mt-1" style={{ letterSpacing: "-0.02em" }}>Collections</h2>
                </div>
                <button onClick={openNew} className="inline-flex items-center gap-2 text-xs font-light tracking-[0.15em] uppercase border border-[#0A0A0A] bg-[#0A0A0A] text-white px-5 py-2.5 hover:bg-transparent hover:text-[#0A0A0A] ease-out duration-200">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    New Collection
                </button>
            </div>

            {showForm && (
                <div className="bg-white border border-[#0A0A0A] p-6 mb-6 space-y-4">
                    <p className="text-xs font-light tracking-[0.2em] uppercase text-[#4A4A4A] pb-2 border-b border-[#E8E4DF]">{editing ? "Edit Collection" : "New Collection"}</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className={labelCls}>Collection Name</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Essentials" required /></div>
                        <div>
                            <label className={labelCls}>Products in this Collection ({selectedIds.length} selected)</label>
                            <div className="border border-[#E8E4DF] p-3 max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {products.map((p) => (
                                    <label key={p.id} className="flex items-center gap-2 text-sm font-light text-[#4A4A4A] cursor-pointer">
                                        <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleProduct(p.id)} className="accent-[#0A0A0A]" />
                                        {p.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={saving} className="text-xs font-light tracking-[0.15em] uppercase border border-[#0A0A0A] bg-[#0A0A0A] text-white px-5 py-2.5 hover:bg-transparent hover:text-[#0A0A0A] ease-out duration-200 disabled:opacity-60">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
                            <button type="button" onClick={() => setShowForm(false)} className="text-xs font-light text-[#8A8A8A] hover:text-[#0A0A0A]">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (<p className="text-[#8A8A8A] text-sm font-light">Loading...</p>)
                    : collections.length === 0 ? (<p className="text-[#8A8A8A] text-sm font-light col-span-3">No collections yet.</p>)
                        : collections.map((c) => (
                            <div key={c.id} className="bg-white border border-[#E8E4DF] p-5 hover:border-[#0A0A0A] ease-out duration-200">
                                <div className="flex items-start justify-between mb-3">
                                    <p className="font-normal text-[#0A0A0A]">{c.name}</p>
                                    {c.generated_by_ai && <span className="text-[9px] tracking-widest uppercase bg-[#0A0A0A] text-white px-1.5 py-0.5">AI</span>}
                                </div>
                                <p className="text-xs font-light text-[#8A8A8A] mb-4">{(c.product_ids ?? []).length} products</p>
                                <div className="flex gap-3">
                                    <button onClick={() => openEdit(c)} className="text-xs text-[#4A4A4A] hover:text-[#0A0A0A]">Edit</button>
                                    <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                                </div>
                            </div>
                        ))}
            </div>
        </div>
    );
}
