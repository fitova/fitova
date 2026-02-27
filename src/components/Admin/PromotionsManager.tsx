"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { Promotion, PromotionPayload } from "@/types/admin";
import toast from "react-hot-toast";

interface PromotionsManagerProps {
    type: "offer" | "coupon";
    title: string;
}

const EMPTY_PROMOTION: PromotionPayload = { type: "offer", code: "", description: "", discount_type: "Percentage", discount_value: "", valid_from: "", valid_to: "" };

export default function PromotionsManager({ type, title }: PromotionsManagerProps) {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Promotion | null>(null);
    const [form, setForm] = useState<PromotionPayload>({ ...EMPTY_PROMOTION, type });

    // Fetch query
    const { data: promotions = [], isLoading } = useQuery({
        queryKey: ["admin-promotions", type],
        queryFn: () => adminService.getPromotions(type),
    });

    // Mutations
    const mutationCreate = useMutation({
        mutationFn: adminService.createPromotion,
        onSuccess: () => {
            toast.success(`${type === "coupon" ? "Coupon" : "Offer"} created!`);
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ["admin-promotions", type] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to create")
    });

    const mutationUpdate = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: PromotionPayload }) => adminService.updatePromotion(id, payload),
        onSuccess: () => {
            toast.success(`${type === "coupon" ? "Coupon" : "Offer"} updated!`);
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ["admin-promotions", type] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to update")
    });

    const mutationDelete = useMutation({
        mutationFn: adminService.deletePromotion,
        onSuccess: () => {
            toast.success(`${type === "coupon" ? "Coupon" : "Offer"} deleted!`);
            queryClient.invalidateQueries({ queryKey: ["admin-promotions", type] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to delete")
    });

    const openNew = () => { setEditing(null); setForm({ ...EMPTY_PROMOTION, type }); setShowForm(true); };
    const openEdit = (p: Promotion) => {
        setEditing(p);
        setForm({
            type,
            code: p.code || "",
            description: p.description,
            discount_type: p.discount_type,
            discount_value: p.discount_value,
            valid_from: p.valid_from ? p.valid_from.split('T')[0] : "", // ensure Date input format
            valid_to: p.valid_to ? p.valid_to.split('T')[0] : "",
        });
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let errs = [];
        if (type === "coupon" && !form.code) errs.push("Coupon Code is required");
        if (!form.description) errs.push("Description is required");
        if (!form.discount_value) errs.push("Value is required");

        if (errs.length > 0) {
            toast.error(errs.join("\n"));
            return;
        }

        if (editing) {
            mutationUpdate.mutate({ id: editing.id, payload: form });
        } else {
            mutationCreate.mutate(form);
        }
    };

    const handleDelete = (id: string) => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
        mutationDelete.mutate(id);
    };

    const inputCls = "w-full border border-[#E8E4DF] bg-white px-4 py-2.5 text-sm font-light outline-none focus:border-[#0A0A0A] ease-out duration-200";
    const labelCls = "block text-xs font-light tracking-[0.15em] uppercase text-[#4A4A4A] mb-1.5";
    const isSaving = mutationCreate.isPending || mutationUpdate.isPending;

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <span className="text-xs font-light tracking-[0.3em] uppercase text-[#8A8A8A]">Promotions</span>
                    <h2 className="font-playfair font-normal text-3xl text-[#0A0A0A] mt-1" style={{ letterSpacing: "-0.02em" }}>{title}</h2>
                </div>
                <button onClick={openNew} className="inline-flex items-center gap-2 text-xs font-light tracking-[0.15em] uppercase border border-[#0A0A0A] bg-[#0A0A0A] text-white px-5 py-2.5 hover:bg-transparent hover:text-[#0A0A0A] ease-out duration-200">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    Add {type === "coupon" ? "Coupon" : "Offer"}
                </button>
            </div>

            {/* Inline Form */}
            {showForm && (
                <div className="bg-white border border-[#0A0A0A] p-6 mb-6 space-y-4">
                    <p className="text-xs font-light tracking-[0.2em] uppercase text-[#4A4A4A] pb-2 border-b border-[#E8E4DF]">{editing ? `Edit ${type}` : `New ${type}`}</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {type === "coupon" && (
                                <div><label className={labelCls}>Coupon Code</label><input className={inputCls} value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="FITOVA10" required={type === "coupon"} /></div>
                            )}
                            <div><label className={labelCls}>Discount Type</label>
                                <select className={inputCls} value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
                                    <option value="Percentage">Percentage</option><option value="Fixed">Fixed</option>
                                </select>
                            </div>
                        </div>
                        <div><label className={labelCls}>Description</label><input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="10% off first order" required /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div><label className={labelCls}>Discount Value</label><input type="number" step="0.01" className={inputCls} value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder="10" required /></div>
                            <div><label className={labelCls}>Valid From</label><input type="date" className={inputCls} value={form.valid_from || ""} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} /></div>
                            <div><label className={labelCls}>Valid To</label><input type="date" className={inputCls} value={form.valid_to || ""} onChange={(e) => setForm({ ...form, valid_to: e.target.value })} /></div>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={isSaving} className="text-xs font-light tracking-[0.15em] uppercase border border-[#0A0A0A] bg-[#0A0A0A] text-white px-5 py-2.5 hover:bg-transparent hover:text-[#0A0A0A] ease-out duration-200 disabled:opacity-60">{isSaving ? "Saving..." : editing ? "Update" : "Create"}</button>
                            <button type="button" onClick={() => setShowForm(false)} className="text-xs font-light text-[#8A8A8A] hover:text-[#0A0A0A] ease-out duration-200">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-[#E8E4DF] overflow-x-auto">
                <table className="w-full text-sm font-light">
                    <thead>
                        <tr className="border-b border-[#E8E4DF] bg-[#FAFAF9]">
                            {type === "coupon" && <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Code</th>}
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Description</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Type</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Value</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Valid From</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Valid To</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} className="px-5 py-10 text-center text-[#8A8A8A]">Loading...</td></tr>
                        ) : promotions.length === 0 ? (
                            <tr><td colSpan={7} className="px-5 py-10 text-center text-[#8A8A8A]">No {type}s found.</td></tr>
                        ) : promotions.map((p) => (
                            <tr key={p.id} className="border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF9]">
                                {type === "coupon" && <td className="px-5 py-4 font-mono text-xs text-[#0A0A0A] tracking-wider">{p.code}</td>}
                                <td className="px-5 py-4 text-[#4A4A4A] max-w-[200px] truncate">{p.description}</td>
                                <td className="px-5 py-4">
                                    <span className={`text-[10px] font-light tracking-wider uppercase px-2 py-0.5 rounded-full ${p.discount_type === "Percentage" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{p.discount_type}</span>
                                </td>
                                <td className="px-5 py-4 text-[#0A0A0A]">{p.discount_type === "Percentage" ? `${p.discount_value}%` : `$${p.discount_value}`}</td>
                                <td className="px-5 py-4 text-[#8A8A8A] text-xs">{p.valid_from ? new Date(p.valid_from).toLocaleDateString() : "-"}</td>
                                <td className="px-5 py-4 text-[#8A8A8A] text-xs">{p.valid_to ? new Date(p.valid_to).toLocaleDateString() : "-"}</td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => openEdit(p)} className="text-xs text-[#4A4A4A] hover:text-[#0A0A0A]">Edit</button>
                                        <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
