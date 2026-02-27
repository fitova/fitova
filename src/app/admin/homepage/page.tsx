"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { adminService } from "@/services/admin.service";
import { HomepageSlide } from "@/types/homepage_slide";
import toast from "react-hot-toast";

const EMPTY_SLIDE: Omit<HomepageSlide, "id" | "created_at"> = {
    title: "",
    subtitle: "",
    description: "",
    button_text: "Shop Now",
    button_link: "#",
    image_url: "",
    sort_order: 0,
    is_active: true,
};

export default function HomepageControl() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<HomepageSlide | null>(null);
    const [form, setForm] = useState(EMPTY_SLIDE);

    const { data: slides = [], isLoading } = useQuery({
        queryKey: ["admin-homepage-slides"],
        queryFn: adminService.getHomepageSlides,
    });

    const mutationCreate = useMutation({
        mutationFn: adminService.createHomepageSlide,
        onSuccess: () => {
            toast.success("Slide created!");
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ["admin-homepage-slides"] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to create slide")
    });

    const mutationUpdate = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Omit<HomepageSlide, "id" | "created_at"> }) => adminService.updateHomepageSlide(id, payload),
        onSuccess: () => {
            toast.success("Slide updated!");
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ["admin-homepage-slides"] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to update slide")
    });

    const mutationDelete = useMutation({
        mutationFn: adminService.deleteHomepageSlide,
        onSuccess: () => {
            toast.success("Slide deleted!");
            queryClient.invalidateQueries({ queryKey: ["admin-homepage-slides"] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to delete slide")
    });

    const openNew = () => { setEditing(null); setForm(EMPTY_SLIDE); setShowForm(true); };
    const openEdit = (s: HomepageSlide) => {
        setEditing(s);
        setForm({
            title: s.title,
            subtitle: s.subtitle,
            description: s.description,
            button_text: s.button_text,
            button_link: s.button_link,
            image_url: s.image_url,
            sort_order: s.sort_order,
            is_active: s.is_active,
        });
        setShowForm(true);
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
        if (!confirm(`Are you sure you want to delete this slide?`)) return;
        mutationDelete.mutate(id);
    };

    const inputCls = "w-full border border-[#E8E4DF] bg-white px-4 py-2.5 text-sm font-light outline-none focus:border-[#0A0A0A] ease-out duration-200 mt-1";
    const labelCls = "block text-xs font-light tracking-[0.15em] uppercase text-[#4A4A4A]";
    const isSaving = mutationCreate.isPending || mutationUpdate.isPending;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <span className="text-xs font-light tracking-[0.3em] uppercase text-[#8A8A8A]">Homepage Control</span>
                    <h2 className="font-playfair font-normal text-3xl text-[#0A0A0A] mt-1" style={{ letterSpacing: "-0.02em" }}>Hero Slides</h2>
                </div>
                <button onClick={openNew} className="inline-flex items-center gap-2 text-xs font-light tracking-[0.15em] uppercase border border-[#0A0A0A] bg-[#0A0A0A] text-white px-5 py-2.5 hover:bg-transparent hover:text-[#0A0A0A] ease-out duration-200">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    Add Slide
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white border border-[#0A0A0A] p-6 mb-6 space-y-4">
                    <p className="text-xs font-light tracking-[0.2em] uppercase text-[#4A4A4A] pb-2 border-b border-[#E8E4DF]">{editing ? "Edit Slide" : "New Slide"}</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className={labelCls}>Title</label><input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
                            <div><label className={labelCls}>Subtitle</label><input className={inputCls} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} required /></div>
                        </div>
                        <div><label className={labelCls}>Description</label><textarea rows={2} className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className={labelCls}>Image URL</label><input type="url" className={inputCls} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelCls}>Sort Order</label><input type="number" className={inputCls} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} required min={0} /></div>
                                <div className="flex flex-col justify-end pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 cursor-pointer accent-[#0A0A0A]" />
                                        <span className="text-sm font-light text-[#4A4A4A]">Is Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className={labelCls}>Button Text</label><input className={inputCls} value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} required /></div>
                            <div><label className={labelCls}>Button Link</label><input className={inputCls} value={form.button_link} onChange={(e) => setForm({ ...form, button_link: e.target.value })} required /></div>
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
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Image</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Sort</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Content</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Status</th>
                            <th className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-5 py-10 text-center text-[#8A8A8A]">Loading slides...</td></tr>
                        ) : slides.length === 0 ? (
                            <tr><td colSpan={5} className="px-5 py-10 text-center text-[#8A8A8A]">No slides found.</td></tr>
                        ) : slides.map((slide) => (
                            <tr key={slide.id} className="border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF9]">
                                <td className="px-5 py-4">
                                    <div className="w-20 h-10 overflow-hidden border border-[#E8E4DF] relative">
                                        <Image src={slide.image_url} alt="Slide preview" fill className="object-cover" sizes="80px" />
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-[#4A4A4A]">{slide.sort_order}</td>
                                <td className="px-5 py-4">
                                    <p className="font-playfair text-base text-[#0A0A0A]">{slide.subtitle}</p>
                                    <p className="text-xs text-[#8A8A8A] mt-1 line-clamp-1">{slide.title.replace('\n', ' ')}</p>
                                </td>
                                <td className="px-5 py-4">
                                    <span className={`text-[10px] font-light tracking-wider uppercase px-2 py-0.5 rounded-full ${slide.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {slide.is_active ? "Active" : "Hidden"}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => openEdit(slide)} className="text-xs text-[#4A4A4A] hover:text-[#0A0A0A]">Edit</button>
                                        <button onClick={() => handleDelete(slide.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
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
