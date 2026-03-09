"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import toast from "react-hot-toast";

/* ─── Types ─────────────────────────────────────────────────── */
type Step = 1 | 2 | 3;

interface LookbookData {
    name: string;
    description: string;
    cover_image: string;
    gender: string;          // men | women | kids | unisex | ""
    styles: string[];
    colors: string[];
    tag: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    slug: string;
    piece_type: string;
    gender: string;
    imgs?: { previews?: string[] };
}

/* ─── Constants ──────────────────────────────────────────────── */
const PIECE_TYPE_LABELS: Record<string, string> = {
    // Tops
    tshirt: "T-Shirts",
    shirt: "Shirts",
    top: "Tops",
    blouse: "Blouses",
    // Outerwear
    hoodie: "Hoodies & Sweatshirts",
    jacket: "Jackets",
    outerwear: "Outerwear",
    cardigan: "Cardigans",
    sweater: "Sweaters",
    coat: "Coats",
    vest: "Vests",
    // Dresses
    dress: "Dresses",
    // Bottoms
    pants: "Pants",
    jeans: "Jeans",
    shorts: "Shorts",
    skirt: "Skirts",
    bottom: "Bottoms",
    // Footwear
    shoes: "Shoes",
    sneakers: "Sneakers",
    boots: "Boots",
    sandals: "Sandals",
    heels: "Heels",
    loafers: "Loafers",
    flats: "Flats",
    slippers: "Slippers",
    // Accessories
    accessories: "Accessories",
    watch: "Watches",
    belt: "Belts",
    cap: "Hats & Caps",
    hat: "Hats",
    bag: "Bags",
    sunglasses: "Sunglasses",
    wallet: "Wallets",
    jewelry: "Jewelry",
    necklace: "Necklaces",
    bracelet: "Bracelets",
    ring: "Rings",
    earring: "Earrings",
    scarf: "Scarves",
    socks: "Socks",
    backpack: "Backpacks",
    handbag: "Handbags",
    clutch: "Clutches",
    tote: "Totes",
    // Fragrances
    perfume: "Perfumes",
    fragrance: "Fragrances",
};

const PRESET_COLORS = [
    { label: "Black", value: "#000000" },
    { label: "White", value: "#FFFFFF" },
    { label: "Beige", value: "#F5E6D3" },
    { label: "Navy", value: "#1E3A5F" },
    { label: "Grey", value: "#718096" },
    { label: "Brown", value: "#6B4423" },
    { label: "Red", value: "#C0392B" },
    { label: "Green", value: "#27AE60" },
    { label: "Camel", value: "#C19A6B" },
    { label: "Blue", value: "#3498DB" },
    { label: "Pink", value: "#F1A7C7" },
    { label: "Yellow", value: "#F1C40F" },
];

/* ─── StepBar ────────────────────────────────────────────────── */
const StepBar = ({ current }: { current: Step }) => (
    <div className="flex items-center gap-3 mb-10">
        {([1, 2, 3] as Step[]).map((s) => (
            <React.Fragment key={s}>
                <div className="flex items-center gap-2.5">
                    <span
                        className="w-7 h-7 flex items-center justify-center text-xs font-light transition-all duration-300"
                        style={{
                            background: current >= s ? "#1A1A1A" : "transparent",
                            color: current >= s ? "#F6F5F2" : "#8A8A8A",
                            border: current < s ? "1px solid #E8E4DF" : "none",
                        }}
                    >
                        {current > s ? "✓" : s}
                    </span>
                    <span
                        className="text-xs font-light tracking-wide hidden sm:block"
                        style={{ color: current === s ? "#1A1A1A" : "#8A8A8A" }}
                    >
                        {s === 1 ? "Details" : s === 2 ? "Products" : "Review"}
                    </span>
                </div>
                {s < 3 && <div className="flex-1 h-px" style={{ background: "#E8E4DF" }} />}
            </React.Fragment>
        ))}
    </div>
);

/* ─── Step 1: Details ────────────────────────────────────────── */
const Step1 = ({
    data,
    onChange,
    onNext,
    styleOptions,
}: {
    data: LookbookData;
    onChange: (d: Partial<LookbookData>) => void;
    onNext: () => void;
    styleOptions: string[];
}) => {
    const supabase = createClient();
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(data.cover_image || "");

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB per image."); return; }
        setUploading(true);
        const ext = file.name.split(".").pop();
        const path = `covers/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("lookbook-images").upload(path, file, { upsert: true });
        if (error) { toast.error("Upload failed."); setUploading(false); return; }
        const { data: urlData } = supabase.storage.from("lookbook-images").getPublicUrl(path);
        onChange({ cover_image: urlData.publicUrl });
        setPreview(urlData.publicUrl);
        setUploading(false);
    };

    const toggleStyle = (s: string) => {
        const next = data.styles.includes(s) ? data.styles.filter((x) => x !== s) : [...data.styles, s];
        onChange({ styles: next });
    };

    const toggleColor = (c: string) => {
        const next = data.colors.includes(c) ? data.colors.filter((x) => x !== c) : [...data.colors, c];
        onChange({ colors: next });
    };

    return (
        <div>
            <h2 className="font-playfair text-2xl text-dark mb-8" style={{ letterSpacing: "-0.02em" }}>
                Lookbook Details
            </h2>

            {/* Name */}
            <div className="mb-5">
                <label className="block text-xs font-light tracking-[0.2em] uppercase mb-2" style={{ color: "#8A8A8A" }}>
                    Name <span style={{ color: "#1A1A1A" }}>*</span>
                </label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    placeholder="e.g. Summer Essentials"
                    maxLength={80}
                    className="w-full border border-[#E8E4DF] bg-white text-sm font-light text-dark px-4 py-3 outline-none focus:border-dark transition-colors duration-200"
                />
            </div>

            {/* Description */}
            <div className="mb-5">
                <label className="block text-xs font-light tracking-[0.2em] uppercase mb-2" style={{ color: "#8A8A8A" }}>
                    Description <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                    rows={3}
                    value={data.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="What makes this look special?"
                    className="w-full border border-[#E8E4DF] bg-white text-sm font-light text-dark px-4 py-3 outline-none resize-none focus:border-dark transition-colors duration-200"
                />
            </div>

            {/* Cover Image Upload */}
            <div className="mb-5">
                <label className="block text-xs font-light tracking-[0.2em] uppercase mb-2" style={{ color: "#8A8A8A" }}>
                    Cover Image <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <div
                    className="border border-dashed border-[#E8E4DF] p-6 text-center cursor-pointer hover:border-dark transition-colors duration-200"
                    onClick={() => fileRef.current?.click()}
                >
                    {preview ? (
                        <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={preview} alt="Cover" className="w-full h-32 object-cover mb-2" />
                            <p className="text-xs font-light" style={{ color: "#8A8A8A" }}>Click to change</p>
                        </div>
                    ) : uploading ? (
                        <div className="flex items-center justify-center gap-2 py-2">
                            <div className="w-4 h-4 border-2 border-t-dark border-[#E8E4DF] rounded-full animate-spin" />
                            <span className="text-xs font-light" style={{ color: "#8A8A8A" }}>Uploading…</span>
                        </div>
                    ) : (
                        <>
                            <svg className="mx-auto mb-2" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="text-xs font-light" style={{ color: "#8A8A8A" }}>Upload photo (max 5MB)</p>
                        </>
                    )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>

            {/* Gender */}
            <div className="mb-5">
                <label className="block text-xs font-light tracking-[0.2em] uppercase mb-3" style={{ color: "#8A8A8A" }}>
                    Gender
                </label>
                <div className="flex flex-wrap gap-2">
                    {(["", "men", "women", "kids", "unisex"] as const).map((g) => (
                        <button
                            key={g || "all"}
                            onClick={() => onChange({ gender: g })}
                            className="px-4 py-2 text-xs font-light tracking-[0.08em] uppercase transition-all duration-200"
                            style={
                                data.gender === g
                                    ? { background: "#1A1A1A", color: "#F6F5F2", border: "1px solid #1A1A1A" }
                                    : { background: "transparent", color: "#6A6A6A", border: "1px solid #E8E4DF" }
                            }
                        >
                            {g === "" ? "All" : g.charAt(0).toUpperCase() + g.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Styles */}
            {styleOptions.length > 0 && (
                <div className="mb-5">
                    <label className="block text-xs font-light tracking-[0.2em] uppercase mb-3" style={{ color: "#8A8A8A" }}>
                        Style <span className="normal-case tracking-normal">(multi-select)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {styleOptions.map((s) => (
                            <button
                                key={s}
                                onClick={() => toggleStyle(s)}
                                className="px-3 py-1.5 text-xs font-light tracking-[0.08em] uppercase transition-all duration-200"
                                style={
                                    data.styles.includes(s)
                                        ? { background: "#1A1A1A", color: "#F6F5F2", border: "1px solid #1A1A1A" }
                                        : { background: "transparent", color: "#6A6A6A", border: "1px solid #E8E4DF" }
                                }
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Colors */}
            <div className="mb-5">
                <label className="block text-xs font-light tracking-[0.2em] uppercase mb-3" style={{ color: "#8A8A8A" }}>
                    Colors <span className="normal-case tracking-normal">(multi-select)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c.value}
                            onClick={() => toggleColor(c.value)}
                            title={c.label}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-light transition-all duration-200"
                            style={
                                data.colors.includes(c.value)
                                    ? { border: "1.5px solid #1A1A1A", color: "#1A1A1A" }
                                    : { border: "1px solid #E8E4DF", color: "#6A6A6A" }
                            }
                        >
                            <span
                                className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                                style={{ background: c.value, border: c.value === "#FFFFFF" ? "1px solid #E8E4DF" : "none" }}
                            />
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tag */}
            <div className="mb-8">
                <label className="block text-xs font-light tracking-[0.2em] uppercase mb-2" style={{ color: "#8A8A8A" }}>
                    Tag <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <input
                    type="text"
                    value={data.tag}
                    onChange={(e) => onChange({ tag: e.target.value })}
                    placeholder="e.g. Streetwear, Minimal…"
                    maxLength={40}
                    className="w-full border border-[#E8E4DF] bg-white text-sm font-light text-dark px-4 py-3 outline-none focus:border-dark transition-colors duration-200"
                />
            </div>

            <button
                onClick={onNext}
                disabled={!data.name.trim() || uploading}
                className="text-xs font-light tracking-[0.15em] uppercase px-10 py-3 transition-all duration-300 disabled:opacity-40"
                style={{ background: "#1A1A1A", color: "#F6F5F2" }}
            >
                Next — Add Products →
            </button>
        </div>
    );
};

/* ─── Step 2: Add Products ───────────────────────────────────── */
const Step2 = ({
    gender,
    selectedIds,
    onToggle,
    onNext,
    onBack,
}: {
    gender: string;
    selectedIds: string[];
    onToggle: (id: string) => void;
    onNext: () => void;
    onBack: () => void;
}) => {
    const supabase = createClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from("products")
            .select("id, name, price, slug, piece_type, gender, imgs")
            .order("created_at", { ascending: false })
            .limit(200);

        if (gender) query = query.eq("gender", gender);
        if (debouncedSearch) query = query.ilike("name", `%${debouncedSearch}%`);

        const { data } = await query;
        setProducts((data ?? []) as Product[]);
        setLoading(false);
    }, [supabase, gender, debouncedSearch]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // Group by piece_type
    const grouped: Record<string, Product[]> = {};
    products.forEach((p) => {
        const key = p.piece_type || "other";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(p);
    });

    const pieceOrder = [
        "top", "tshirt", "shirt", "blouse",
        "hoodie", "sweater", "cardigan", "jacket", "coat", "vest", "outerwear",
        "dress",
        "pants", "jeans", "skirt", "shorts", "bottom",
        "shoes", "sneakers", "boots", "heels", "sandals", "loafers", "flats", "slippers",
        "bag", "backpack", "handbag", "clutch", "tote",
        "watch", "jewelry", "necklace", "bracelet", "ring", "earring",
        "sunglasses", "belt", "wallet", "cap", "hat", "scarf", "socks", "accessories",
        "perfume", "fragrance",
        "other"
    ];
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
        const ai = pieceOrder.indexOf(a);
        const bi = pieceOrder.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    return (
        <div>
            <div className="flex items-start justify-between mb-6 gap-4">
                <h2 className="font-playfair text-2xl text-dark" style={{ letterSpacing: "-0.02em" }}>
                    Add Products
                </h2>
                <span className="text-xs font-light mt-1.5" style={{ color: "#8A8A8A" }}>
                    {selectedIds.length}/20 selected
                </span>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="#8A8A8A" strokeWidth="1.5" />
                    <path d="M21 21l-4.35-4.35" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products…"
                    className="w-full border border-[#E8E4DF] bg-white text-sm font-light text-dark pl-9 pr-4 py-2.5 outline-none focus:border-dark transition-colors duration-200"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-6 h-6 border-2 border-t-dark border-[#E8E4DF] rounded-full animate-spin" />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-16" style={{ color: "#8A8A8A" }}>
                    <p className="text-sm font-light">No products found.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedKeys.map((key) => (
                        <div key={key}>
                            <h3 className="text-xs font-light tracking-[0.2em] uppercase mb-3 pb-2 border-b border-[#E8E4DF]" style={{ color: "#8A8A8A" }}>
                                {PIECE_TYPE_LABELS[key] ?? key}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {grouped[key].map((p) => {
                                    const isSelected = selectedIds.includes(p.id);
                                    const thumb = p.imgs?.previews?.[0];
                                    const atMax = selectedIds.length >= 20 && !isSelected;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => !atMax && onToggle(p.id)}
                                            disabled={atMax}
                                            className="text-left relative border transition-all duration-200 disabled:opacity-40"
                                            style={{
                                                border: isSelected ? "1.5px solid #1A1A1A" : "1px solid #E8E4DF",
                                                background: isSelected ? "#FAFAF9" : "#fff",
                                            }}
                                        >
                                            <div className="aspect-[3/4] bg-[#F6F5F2] overflow-hidden relative">
                                                {thumb ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={thumb} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                            <rect x="3" y="3" width="18" height="18" stroke="#C0C0C0" strokeWidth="1.2" />
                                                            <path d="M3 16l5-5 4 4 3-3 6 6" stroke="#C0C0C0" strokeWidth="1.2" strokeLinecap="round" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {/* Checkbox */}
                                                <div
                                                    className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center transition-all duration-200"
                                                    style={{
                                                        background: isSelected ? "#1A1A1A" : "rgba(255,255,255,0.8)",
                                                        border: isSelected ? "none" : "1px solid #E8E4DF",
                                                    }}
                                                >
                                                    {isSelected && (
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F6F5F2" strokeWidth="3" strokeLinecap="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-2">
                                                <p className="text-[10px] font-light text-dark truncate">{p.name}</p>
                                                <p className="text-[10px] font-medium text-dark mt-0.5">${p.price}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-4 mt-10">
                <button
                    onClick={onBack}
                    className="text-xs font-light tracking-[0.15em] uppercase px-8 py-3 border border-[#E8E4DF] text-dark hover:border-dark transition-colors duration-200"
                >
                    ← Back
                </button>
                <button
                    onClick={onNext}
                    className="text-xs font-light tracking-[0.15em] uppercase px-10 py-3 transition-all duration-300"
                    style={{ background: "#1A1A1A", color: "#F6F5F2" }}
                >
                    Review →
                </button>
            </div>
        </div>
    );
};

/* ─── Step 3: Review & Publish ───────────────────────────────── */
const Step3 = ({
    data,
    selectedCount,
    onBack,
    onSubmit,
    submitting,
    error,
}: {
    data: LookbookData;
    selectedCount: number;
    onBack: () => void;
    onSubmit: (isDraft?: boolean) => void;
    submitting: boolean;
    error: string | null;
}) => (
    <div>
        <h2 className="font-playfair text-2xl text-dark mb-8" style={{ letterSpacing: "-0.02em" }}>
            Review &amp; Publish
        </h2>

        {/* Preview card */}
        <div className="border border-[#E8E4DF] mb-8 overflow-hidden">
            {/* Cover */}
            {data.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.cover_image} alt="Cover" className="w-full h-48 object-cover" />
            ) : (
                <div className="w-full h-32 flex items-center justify-center" style={{ background: "#1A1A1A" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" stroke="white" strokeWidth="1.2" />
                        <rect x="14" y="3" width="7" height="7" stroke="white" strokeWidth="1.2" />
                        <rect x="3" y="14" width="7" height="7" stroke="white" strokeWidth="1.2" />
                        <rect x="14" y="14" width="7" height="7" stroke="white" strokeWidth="1.2" />
                    </svg>
                </div>
            )}
            <div className="p-5 space-y-3">
                {/* Name */}
                <p className="font-playfair text-xl text-dark">{data.name}</p>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-2">
                    {data.gender && (
                        <span className="text-[10px] font-light tracking-[0.12em] uppercase px-2.5 py-1 border border-[#E8E4DF]" style={{ color: "#8A8A8A" }}>
                            {data.gender}
                        </span>
                    )}
                    {data.styles.map((s) => (
                        <span key={s} className="text-[10px] font-light tracking-[0.12em] px-2.5 py-1 border border-[#E8E4DF]" style={{ color: "#8A8A8A" }}>
                            {s}
                        </span>
                    ))}
                    {data.tag && (
                        <span className="text-[10px] font-light px-2.5 py-1 border border-[#E8E4DF]" style={{ color: "#8A8A8A" }}>
                            #{data.tag}
                        </span>
                    )}
                </div>

                {/* Colors */}
                {data.colors.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                        {data.colors.map((c) => (
                            <span
                                key={c}
                                className="w-4 h-4 rounded-full"
                                style={{ background: c, border: c === "#FFFFFF" ? "1px solid #E8E4DF" : "none" }}
                                title={c}
                            />
                        ))}
                    </div>
                )}

                {/* Description */}
                {data.description && (
                    <p className="text-sm font-light" style={{ color: "#6A6A6A" }}>{data.description}</p>
                )}

                {/* Products count */}
                <p className="text-xs font-light" style={{ color: "#8A8A8A" }}>
                    {selectedCount} product{selectedCount !== 1 ? "s" : ""} included
                </p>
            </div>
        </div>

        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

        <div className="flex items-center gap-3">
            <button
                onClick={onBack}
                className="text-xs font-light tracking-[0.15em] uppercase px-8 py-3 border border-[#E8E4DF] text-dark hover:border-dark transition-colors duration-200"
            >
                ← Back
            </button>
            <button
                onClick={() => onSubmit(true)}
                disabled={submitting}
                className="text-xs font-light tracking-[0.15em] uppercase px-8 py-3 border border-[#E8E4DF] text-dark hover:border-dark transition-colors duration-200 disabled:opacity-40"
            >
                Save Draft
            </button>
            <button
                onClick={() => onSubmit(false)}
                disabled={submitting}
                className="flex-1 text-xs font-light tracking-[0.15em] uppercase py-3 transition-all duration-300 disabled:opacity-50"
                style={{ background: "#1A1A1A", color: "#F6F5F2" }}
            >
                {submitting ? "Publishing…" : "Publish Lookbook"}
            </button>
        </div>
    </div>
);

/* ─── Main Wizard ────────────────────────────────────────────── */
const CreateLookbookWizard = () => {
    const router = useRouter();
    const { user } = useCurrentUser();
    const supabase = createClient();

    const [step, setStep] = useState<Step>(1);
    const [data, setData] = useState<LookbookData>({
        name: "",
        description: "",
        cover_image: "",
        gender: "",
        styles: [],
        colors: [],
        tag: "",
    });
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [styleOptions, setStyleOptions] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch style options from style_hub_filters
    useEffect(() => {
        supabase
            .from("style_hub_filters")
            .select("value")
            .eq("category", "style")
            .eq("is_active", true)
            .order("sort_order")
            .then(({ data: rows }) => {
                if (rows && rows.length > 0) setStyleOptions(rows.map((r) => r.value));
                else setStyleOptions(["Casual", "Formal", "Street", "Sporty", "Minimal", "Elegant"]);
            });
    }, [supabase]);

    const update = (d: Partial<LookbookData>) => setData((prev) => ({ ...prev, ...d }));

    const toggleProduct = (id: string) => {
        setSelectedProductIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (isDraft = false) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/v1/lookbooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name.trim(),
                    description: data.description.trim() || undefined,
                    cover_image: data.cover_image || undefined,
                    gender: data.gender || undefined,
                    styles: data.styles.length > 0 ? data.styles : undefined,
                    colors: data.colors.length > 0 ? data.colors : undefined,
                    tag: data.tag.trim() || undefined,
                    is_draft: isDraft,
                    product_ids: selectedProductIds,
                }),
            });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error ?? "Failed to create lookbook");
            }
            const { slug } = await res.json();
            toast.success(isDraft ? "Draft saved!" : "Lookbook published!");
            router.push(`/lookbook/${slug}`);
        } catch (err: unknown) {
            setError((err as Error)?.message ?? "Something went wrong. Please try again.");
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="text-center py-20">
                <p className="font-playfair text-2xl text-dark mb-4">Sign in to create lookbooks</p>
                <Link
                    href="/signin"
                    className="text-xs font-light tracking-[0.15em] uppercase px-8 py-3 inline-block"
                    style={{ background: "#1A1A1A", color: "#F6F5F2" }}
                >
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto px-4 sm:px-8 xl:px-0 pt-[calc(var(--navbar-h)+3rem)] pb-20">
            {/* Header */}
            <div className="mb-10">
                <span className="block text-[10px] font-light tracking-[0.3em] uppercase mb-3" style={{ color: "#8A8A8A" }}>
                    Style Curation
                </span>
                <h1 className="font-playfair font-normal text-4xl text-dark" style={{ letterSpacing: "-0.02em" }}>
                    Create a Lookbook
                </h1>
            </div>

            <StepBar current={step} />

            {step === 1 && (
                <Step1
                    data={data}
                    onChange={update}
                    onNext={() => setStep(2)}
                    styleOptions={styleOptions}
                />
            )}
            {step === 2 && (
                <Step2
                    gender={data.gender}
                    selectedIds={selectedProductIds}
                    onToggle={toggleProduct}
                    onNext={() => setStep(3)}
                    onBack={() => setStep(1)}
                />
            )}
            {step === 3 && (
                <Step3
                    data={data}
                    selectedCount={selectedProductIds.length}
                    onBack={() => setStep(2)}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    error={error}
                />
            )}
        </div>
    );
};

export default CreateLookbookWizard;
