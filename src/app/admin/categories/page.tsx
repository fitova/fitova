"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { adminService } from "@/services/admin.service";
import { AdminCategory, AdminCategoryPayload } from "@/types/admin";
import toast from "react-hot-toast";

const EMPTY_CATEGORY: AdminCategoryPayload = {
    name: "",
    slug: "",
    description: "",
    icon_url: "",
    sort_order: 0,
};

export default function AdminCategoriesPage() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<AdminCategory | null>(null);
    const [form, setForm] = useState<AdminCategoryPayload>(EMPTY_CATEGORY);

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ["admin-categories"],
        queryFn: adminService.getCategories,
    });

    const mutationCreate = useMutation({
        mutationFn: adminService.createCategory,
        onSuccess: () => {
            toast.success("Category created!");
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to create category")
    });

    const mutationUpdate = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: AdminCategoryPayload }) => adminService.updateCategory(id, payload),
        onSuccess: () => {
            toast.success("Category updated!");
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to update category")
    });

    const mutationDelete = useMutation({
        mutationFn: adminService.deleteCategory,
        onSuccess: () => {
            toast.success("Category deleted!");
            queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to delete category")
    });

    const openNew = () => { setEditing(null); setForm(EMPTY_CATEGORY); setShowForm(true); };
    const openEdit = (c: AdminCategory) => {
        setEditing(c);
        setForm({
            name: c.name,
            slug: c.slug,
            description: c.description || "",
            icon_url: c.icon_url || "",
            sort_order: c.sort_order,
        });
        setShowForm(true);
    };

    const handleNameChange = (name: string) => {
        // Auto-generate slug from name if creating
        if (!editing) {
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
            setForm({ ...form, name, slug });
        } else {
            setForm({ ...form, name });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editing) {
            mutationUpdate.mutate({ id: editing.id, payload: form });
        } else {
            mutationCreate.mutate(form);
        }
    };

    const handleDelete = (id: string) => {
        if (!confirm(`Are you sure you want to delete this category?`)) return;
        mutationDelete.mutate(id);
    };

    // Quick Seed Function
    const handleSeedDefaults = async () => {
        if (!confirm("This will attempt to add Women, Men, and Kids categories. Continue?")) return;
        const defaults = [
            { name: "Women", slug: "women", sort_order: 1 },
            { name: "Men", slug: "men", sort_order: 2 },
            { name: "Kids", slug: "kids", sort_order: 3 },
        ];

        for (const cat of defaults) {
            try {
                await adminService.createCategory(cat);
            } catch (err: any) {
                // Ignore duplicates gracefully
                if (err.message !== "Category slug must be unique") {
                    toast.error(`Error creating ${cat.name}: ` + err.message);
                }
            }
        }
        toast.success("Default categories evaluated!");
        queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    };

    const inputCls = "w-full border border-[#E8E4DF] bg-white px-4 py-2.5 text-sm font-light outline-none focus:border-[#0A0A0A] ease-out duration-200 mt-1 pb-2";
    const labelCls = "block text-xs font-light tracking-[0.15em] uppercase text-[#4A4A4A]";
    const isSaving = mutationCreate.isPending || mutationUpdate.isPending;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <span className="text-xs font-light tracking-[0.3em] uppercase text-[#8A8A8A]">Catalog</span>
                    <h2 className="font-playfair font-normal text-3xl text-[#0A0A0A] mt-1" style={{ letterSpacing: "-0.02em" }}>Categories</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleSeedDefaults} className="text-xs font-light tracking-[0.15em] uppercase border border-[#E8E4DF] bg-white text-[#0A0A0A] px-5 py-2.5 hover:border-[#0A0A0A] ease-out duration-200">
                        Seed Defaults
                    </button>
                    <button onClick={openNew} className="inline-flex items-center gap-2 text-xs font-light tracking-[0.15em] uppercase border border-[#0A0A0A] bg-[#0A0A0A] text-white px-5 py-2.5 hover:bg-transparent hover:text-[#0A0A0A] ease-out duration-200">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        Add Category
                    </button>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white border border-[#0A0A0A] p-6 mb-6 space-y-4">
                    <p className="text-xs font-light tracking-[0.2em] uppercase text-[#4A4A4A] pb-2 border-b border-[#E8E4DF]">{editing ? "Edit Category" : "New Category"}</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className={labelCls}>Name</label><input className={inputCls} value={form.name} onChange={(e) => handleNameChange(e.target.value)} required /></div>
                            <div><label className={labelCls}>Slug URL</label><input className={inputCls} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
                        </div>
                        <div><label className={labelCls}>Description (Optional)</label><textarea rows={2} className={inputCls} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className={labelCls}>Icon/Image URL (Optional)</label><input type="url" className={inputCls} value={form.icon_url || ""} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} /></div>
                            <div><label className={labelCls}>Sort Order</label><input type="number" className={inputCls} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} required min={0} /></div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="submit" disabled={isSaving} className="text-xs font-light tracking-[0.15em] uppercase border border-[#0A0A0A] bg-[#0A0A0A] text-white px-5 py-2.5 hover:bg-transparent hover:text-[#0A0A0A] ease-out duration-200 disabled:opacity-60">{isSaving ? "Saving..." : editing ? "Update" : "Create"}</button>
                            <button type="button" onClick={() => setShowForm(false)} className="text-xs font-light text-[#8A8A8A] hover:text-[#0A0A0A] ease-out duration-200">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-white border border-[#E8E4DF] overflow-x-auto">
                <table className="w-full text-sm font-light">
                    <thead>
                        <tr className="border-b border-[#E8E4DF] bg-[#FAFAF9]">
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Name</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Slug</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Sort</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="px-5 py-10 text-center text-[#8A8A8A]">Loading categories...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan={4} className="px-5 py-10 text-center text-[#8A8A8A]">No categories found.</td></tr>
                        ) : categories.map((category) => (
                            <tr key={category.id} className="border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF9]">
                                <td className="px-5 py-4 font-medium text-[#0A0A0A] flex items-center gap-3">
                                    {category.icon_url && <Image src={category.icon_url} alt="" width={24} height={24} className="object-cover rounded-full border border-gray-200" />}
                                    {category.name}
                                </td>
                                <td className="px-5 py-4 text-[#8A8A8A] font-mono text-xs">{category.slug}</td>
                                <td className="px-5 py-4 text-[#4A4A4A]">{category.sort_order}</td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => openEdit(category)} className="text-xs text-[#4A4A4A] hover:text-[#0A0A0A]">Edit</button>
                                        <button onClick={() => handleDelete(category.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
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
