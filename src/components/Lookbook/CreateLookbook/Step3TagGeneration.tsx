"use client";
import React, { useState, useEffect, useRef } from "react";

interface SelectedProduct {
    id: string;
    styles?: string[] | null;
    tags?: string[] | null;
    material?: string | null;
    brand?: string | null;
    colors?: string[] | null;
}

interface Step3Props {
    selectedProducts: SelectedProduct[];
    tags: string[];
    colors: string[];
    mood: string;
    onChange: (data: { tags: string[]; colors: string[]; mood: string }) => void;
    onSubmit: () => void;
    onBack: () => void;
    submitting: boolean;
}

const PRESET_COLORS = [
    { label: "Black", value: "#000000" },
    { label: "White", value: "#FFFFFF" },
    { label: "Navy", value: "#1E3A5F" },
    { label: "Red", value: "#C0392B" },
    { label: "Green", value: "#27AE60" },
    { label: "Beige", value: "#F5E6D3" },
    { label: "Grey", value: "#718096" },
    { label: "Brown", value: "#6B4423" },
    { label: "Blue", value: "#2980B9" },
    { label: "Pink", value: "#E91E8C" },
    { label: "Purple", value: "#8E44AD" },
    { label: "Orange", value: "#E67E22" },
];

export default function Step3TagGeneration({ selectedProducts, tags, colors, mood, onChange, onSubmit, onBack, submitting }: Step3Props) {
    const [newTag, setNewTag] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-generate tags from products on first render
    useEffect(() => {
        if (tags.length > 0) return; // already have tags
        const autoTags = [
            ...selectedProducts.flatMap((p) => p.styles ?? []),
            ...selectedProducts.flatMap((p) => p.tags ?? []),
            ...selectedProducts.map((p) => p.material).filter(Boolean),
            ...selectedProducts.map((p) => p.brand).filter(Boolean),
        ];
        const autoColors = selectedProducts.flatMap((p) => p.colors ?? []);
        const deduped = Array.from(new Set(autoTags.filter(Boolean).map((t) => (t as string).toLowerCase())));
        const dedupedColors = Array.from(new Set(autoColors.filter(Boolean)));
        onChange({ tags: deduped, colors: dedupedColors, mood });
        // eslint-disable-next-line
    }, []);

    const addTag = (tag: string) => {
        const cleaned = tag.trim().toLowerCase();
        if (!cleaned || tags.includes(cleaned)) return;
        onChange({ tags: [...tags, cleaned], colors, mood });
        setNewTag("");
    };

    const removeTag = (tag: string) => {
        onChange({ tags: tags.filter((t) => t !== tag), colors, mood });
    };

    const toggleColor = (color: string) => {
        const next = colors.includes(color) ? colors.filter((c) => c !== color) : [...colors, color];
        onChange({ tags, colors: next, mood });
    };

    return (
        <div className="space-y-6">
            {/* Tags */}
            <div>
                <label className="block text-[11px] font-light tracking-[0.2em] uppercase text-[#8A8A8A] mb-3">
                    Style Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-light border border-[#E8E4DF] bg-[#F6F5F2] text-[#4A4A4A]"
                        >
                            {tag}
                            <button
                                onClick={() => removeTag(tag)}
                                className="opacity-50 hover:opacity-100 transition-opacity"
                            >
                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M1 1L7 7M7 1L1 7" />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
                {/* Add custom tag */}
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); addTag(newTag); }
                        }}
                        placeholder="Add a tag and press Enter..."
                        className="flex-1 text-sm font-light px-3 py-2 border border-[#E8E4DF] focus:outline-none focus:border-[#0A0A0A] transition-colors placeholder-[#C8C8C8]"
                    />
                    <button
                        onClick={() => addTag(newTag)}
                        className="px-4 py-2 text-xs font-light border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all duration-200"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Colors */}
            <div>
                <label className="block text-[11px] font-light tracking-[0.2em] uppercase text-[#8A8A8A] mb-3">
                    Colors
                </label>
                <div className="flex flex-wrap gap-2.5">
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c.value}
                            onClick={() => toggleColor(c.value)}
                            title={c.label}
                            className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 ${colors.includes(c.value)
                                ? "border-[#0A0A0A] scale-110"
                                : "border-transparent hover:border-[#C8C8C8]"
                                }`}
                            style={{ background: c.value }}
                        >
                            {colors.includes(c.value) && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path
                                            d="M2 5L4.5 7.5L8 3"
                                            stroke={c.value === "#FFFFFF" || c.value === "#F5E6D3" ? "#0A0A0A" : "white"}
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mood (optional) */}
            <div>
                <label className="block text-[11px] font-light tracking-[0.2em] uppercase text-[#8A8A8A] mb-2">
                    Mood (optional)
                </label>
                <input
                    type="text"
                    value={mood}
                    onChange={(e) => onChange({ tags, colors, mood: e.target.value })}
                    placeholder="e.g. Casual, Formal, Sporty..."
                    className="w-full text-sm font-light px-3 py-2.5 border border-[#E8E4DF] focus:outline-none focus:border-[#0A0A0A] transition-colors placeholder-[#C8C8C8]"
                />
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={onBack}
                    className="flex-1 py-3.5 text-xs font-light tracking-[0.2em] uppercase border border-[#E8E4DF] text-[#8A8A8A] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-all duration-200"
                >
                    ← Back
                </button>
                <button
                    onClick={onSubmit}
                    disabled={submitting}
                    className="flex-1 py-3.5 text-xs font-light tracking-[0.2em] uppercase bg-[#0A0A0A] text-white hover:bg-[#2C2C2C] transition-all duration-200 disabled:opacity-50"
                >
                    {submitting ? "Creating..." : "Create Lookbook ✓"}
                </button>
            </div>
        </div>
    );
}
