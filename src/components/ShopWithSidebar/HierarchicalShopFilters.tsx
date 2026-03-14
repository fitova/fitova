"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useStyleHub } from "@/app/context/StyleHubContext";
import { getCategoryHierarchy, type CategoryWithChildren, type Category } from "@/lib/queries/categories";
import { type ShopFilters } from "@/hooks/useShopFilters";
import { Product } from "@/types/product";

/* ── tiny helpers ──────────────────────────────────────────── */
const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg className={`fill-current transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path fillRule="evenodd" clipRule="evenodd"
            d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
            fill="" />
    </svg>
);

/** A collapsible filter section matching the site aesthetic */
const FilterSection = ({
    title,
    open,
    onToggle,
    children,
    badge,
}: {
    title: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    badge?: number;
}) => (
    <div className="border border-[#E8E4DF] bg-white">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between py-4 px-5 hover:bg-[#FAFAF9] transition-colors duration-200"
        >
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#0A0A0A]">{title}</span>
                {badge != null && badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#0A0A0A] text-white text-[10px] flex items-center justify-center font-light">
                        {badge}
                    </span>
                )}
            </div>
            <ChevronIcon open={open} />
        </button>
        {open && <div className="pb-5 px-5">{children}</div>}
    </div>
);

/** Chip pill button */
const Chip = ({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) => (
    <button
        onClick={onClick}
        className={`px-3.5 py-1.5 text-xs font-light tracking-wide border transition-all duration-200 ${active
            ? "bg-[#0A0A0A] border-[#0A0A0A] text-white"
            : "border-[#E8E4DF] text-[#4A4A4A] hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
            }`}
    >
        {label}
        {count != null && <span className="ml-1.5 opacity-60">({count})</span>}
    </button>
);

/* ── Color circle ──────────────────────────────────────────── */
const ColorChip = ({
    label,
    value,
    active,
    onClick,
}: {
    label: string;
    value: string;
    active: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        title={label}
        className="relative"
        aria-label={label}
    >
        <span
            className="block w-8 h-8 rounded-full border-2 transition-all duration-200"
            style={{
                backgroundColor: value,
                borderColor: active ? "#0A0A0A" : "#E8E4DF",
                boxShadow: active ? "0 0 0 2px #F6F5F2, 0 0 0 4px #0A0A0A" : "none",
            }}
        />
    </button>
);

/* ── piece_type → group mapping (same as MegaMenu) ────────── */
const PIECE_TYPE_TO_GROUP: Record<string, string> = {
    jacket: "clothing", "t-shirt": "clothing", tshirt: "clothing", shirt: "clothing",
    hoodie: "clothing", sweater: "clothing", pants: "clothing", jeans: "clothing",
    shorts: "clothing", coat: "clothing", blazer: "clothing", vest: "clothing",
    dress: "clothing", skirt: "clothing", top: "clothing", blouse: "clothing",
    polo: "clothing", cardigan: "clothing", tracksuit: "clothing", joggers: "clothing",

    sneakers: "footwear", boots: "footwear", shoes: "footwear", sandals: "footwear",
    slippers: "footwear", loafers: "footwear", heels: "footwear", flats: "footwear",
    mules: "footwear",

    bag: "accessories", hat: "accessories", cap: "accessories", scarf: "accessories",
    belt: "accessories", watch: "accessories", sunglasses: "accessories", jewelry: "accessories",
    wallet: "accessories", gloves: "accessories", tie: "accessories", socks: "accessories",
    backpack: "accessories", bracelet: "accessories", necklace: "accessories",
    earrings: "accessories", ring: "accessories",

    perfume: "fragrances", cologne: "fragrances", fragrance: "fragrances",
    "body-spray": "fragrances", "eau-de-toilette": "fragrances",
    "eau-de-parfum": "fragrances",
};

const GROUP_ORDER = ["clothing", "footwear", "accessories", "fragrances"];
const GROUP_LABELS: Record<string, string> = {
    clothing: "Clothing",
    footwear: "Footwear",
    accessories: "Accessories",
    fragrances: "Fragrances",
};

/**
 * Connected shop filter sidebar.
 * Receives `filters` + `setFilters` from useShopFilters via ShopWithSidebar.
 * Receives `products` for computing count badges.
 */
const HierarchicalShopFilters = ({
    filters,
    setFilters,
    products,
}: {
    filters: ShopFilters;
    setFilters: React.Dispatch<React.SetStateAction<ShopFilters>>;
    products: Product[];
}) => {
    /* ── DB data ─────────────────────────────────────────────── */
    const { filterOptions } = useStyleHub();
    const [hierarchy, setHierarchy] = useState<CategoryWithChildren[]>([]);
    const [catLoading, setCatLoading] = useState(true);

    useEffect(() => {
        getCategoryHierarchy()
            .then(setHierarchy)
            .finally(() => setCatLoading(false));
    }, []);

    /* ── Section open state ──────────────────────────────────── */
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => ({
        gender: true,
        category: true,
        style: filters.style.length > 0,
        mood: false,
        occasion: false,
        season: filters.season.length > 0,
        material: filters.material.length > 0,
        brand: filters.brand.length > 0,
        size: filters.size.length > 0,
        color: filters.colors.length > 0,
    }));

    // Auto-open filter sections when their filter value is active (e.g. from URL params)
    useEffect(() => {
        setOpenSections(prev => ({
            ...prev,
            style: prev.style || filters.style.length > 0,
            season: prev.season || filters.season.length > 0,
            material: prev.material || filters.material.length > 0,
            brand: prev.brand || filters.brand.length > 0,
            size: prev.size || filters.size.length > 0,
            color: prev.color || filters.colors.length > 0,
        }));
    }, [
        filters.style.length,
        filters.season.length,
        filters.material.length,
        filters.brand.length,
        filters.size.length,
        filters.colors.length,
    ]);

    const toggleSection = (key: string) =>
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));


    /* ── Helpers ──────────────────────────────────────────────── */
    const opts = (cat: string) => filterOptions.filter((o) => o.category === cat);

    /* ── Group categories by piece_type_group, filtered by gender ─── */
    const groupedCategories = useMemo(() => {
        // Flatten all children from hierarchy
        const allChildren = hierarchy.flatMap((parent) => parent.children);

        const groups: Record<string, Category[]> = {};
        for (const group of GROUP_ORDER) groups[group] = [];

        for (const child of allChildren) {
            // Gender filter: only include if category has no gender restriction,
            // or if the selected gender is in the category's gender array
            if (filters.gender && child.gender && child.gender.length > 0) {
                const genderMatch = child.gender.some(
                    (g) => g.toLowerCase() === filters.gender.toLowerCase()
                );
                if (!genderMatch) continue;
            }

            const pt = child.piece_type ?? child.slug ?? "";
            const group = PIECE_TYPE_TO_GROUP[pt.toLowerCase()] ?? "accessories";
            if (groups[group]) groups[group].push(child);
        }

        // Also add parent categories that have no children (standalone categories)
        for (const parent of hierarchy) {
            if (parent.children.length === 0) {
                // Apply same gender filter
                if (filters.gender && parent.gender && parent.gender.length > 0) {
                    const genderMatch = parent.gender.some(
                        (g) => g.toLowerCase() === filters.gender.toLowerCase()
                    );
                    if (!genderMatch) continue;
                }
                const pt = parent.piece_type ?? parent.slug ?? "";
                const group = PIECE_TYPE_TO_GROUP[pt.toLowerCase()] ?? "accessories";
                if (groups[group]) groups[group].push(parent);
            }
        }

        return groups;
    }, [hierarchy, filters.gender]);

    /* ── Product counts per category ─────────────────────────── */
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const p of products) {
            const catId = p.category_id ?? "";
            if (catId) counts[catId] = (counts[catId] || 0) + 1;

            // Also count by piece_type
            const pt = p.piece_type ?? "";
            if (pt) counts[pt] = (counts[pt] || 0) + 1;
        }
        return counts;
    }, [products]);

    /* ── Group counts (how many products per group) ───────────── */
    const groupCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const p of products) {
            const pt = p.piece_type ?? "";
            const group = PIECE_TYPE_TO_GROUP[pt.toLowerCase()] ?? "";
            if (group) counts[group] = (counts[group] || 0) + 1;
        }
        return counts;
    }, [products]);

    /* ── Per-option product counts ────────────────────────────── */
    const styleCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const p of products) {
            for (const s of (p.styles ?? [])) counts[s] = (counts[s] || 0) + 1;
        }
        return counts;
    }, [products]);

    const seasonCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const p of products) {
            if (p.season) counts[p.season] = (counts[p.season] || 0) + 1;
        }
        return counts;
    }, [products]);

    const brandCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const p of products) {
            if (p.brand) counts[p.brand] = (counts[p.brand] || 0) + 1;
        }
        return counts;
    }, [products]);

    const materialCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const p of products) {
            if (p.material) counts[p.material] = (counts[p.material] || 0) + 1;
        }
        return counts;
    }, [products]);

    const sizeCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const p of products) {
            for (const s of (p.size ?? [])) counts[s] = (counts[s] || 0) + 1;
        }
        return counts;
    }, [products]);

    /* ── Update filter helpers (all multi-select now) ─────────── */

    /** Toggle a value in/out of an array filter */
    function toggleArr<K extends keyof typeof filters>(key: K, value: string) {
        setFilters((prev) => {
            const arr = (prev[key] as string[]);
            return {
                ...prev,
                [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
            };
        });
    }

    const setGender = useCallback((g: string) => {
        setFilters((prev) => ({
            ...prev,
            gender: g === "all" ? "" : g,
            category: [],
            pieceTypeGroup: "",
        }));
    }, [setFilters]);

    const setSize = useCallback((size: string) => {
        toggleArr("size", size);
    }, [setFilters]);

    const toggleCustomColor = useCallback((color: string) => {
        toggleArr("colors", color);
    }, [setFilters]);

    const setPieceTypeGroup = useCallback((group: string) => {
        setFilters((prev) => ({
            ...prev,
            pieceTypeGroup: prev.pieceTypeGroup === group ? "" : group,
        }));
    }, [setFilters]);

    const setCategory = useCallback((slug: string) => {
        toggleArr("category", slug);
    }, [setFilters]);

    const toggleColor = useCallback((color: string) => {
        toggleArr("colors", color);
    }, [setFilters]);

    const setStyle = useCallback((style: string) => {
        toggleArr("style", style);
    }, [setFilters]);

    const setSeason = useCallback((season: string) => {
        toggleArr("season", season);
    }, [setFilters]);

    const setBrand = useCallback((brand: string) => {
        toggleArr("brand", brand);
    }, [setFilters]);

    const setMaterial = useCallback((material: string) => {
        toggleArr("material", material);
    }, [setFilters]);

    /* ── Total active filter count ───────────────────────────── */
    const activeCount =
        (filters.gender ? 1 : 0) +
        filters.category.length +
        (filters.pieceTypeGroup ? 1 : 0) +
        filters.style.length +
        filters.season.length +
        filters.brand.length +
        filters.material.length +
        filters.size.length +
        filters.colors.length;

    const clearAll = useCallback(() => {
        setFilters((prev) => ({
            ...prev,
            gender: "",
            category: [],
            pieceTypeGroup: "",
            style: [],
            season: [],
            brand: [],
            material: [],
            size: [],
            colors: [],
            search: "",
        }));
    }, [setFilters]);

    const visibleGroups = filters.gender === "kids"
        ? GROUP_ORDER.filter((g) => g !== "fragrances")
        : GROUP_ORDER;

    /* ── Available sizes ──────────────────────────────────────── */
    const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL",
        "36", "37", "38", "39", "40", "41", "42", "43", "44",
        "One Size"];

    /* ── Extended color palette (20 colors) ───────────────────── */
    const EXTENDED_COLORS = [
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
        { label: "Yellow", value: "#F1C40F" },
        { label: "Olive", value: "#5D5916" },
        { label: "Teal", value: "#16A085" },
        { label: "Maroon", value: "#7B241C" },
        { label: "Camel", value: "#C19A6B" },
        { label: "Mint", value: "#A8E6CF" },
        { label: "Lavender", value: "#B39DDB" },
        { label: "Coral", value: "#FF6B6B" },
    ];

    /* ────────────────────────────── render ───────────────────── */
    return (
        <div className="flex flex-col gap-0 border-t border-[#E8E4DF]">
            {/* Filters header */}
            <div className="flex items-center justify-between py-4 px-5 bg-white border border-[#E8E4DF] border-b-0">
                <p className="text-xs font-light tracking-[0.2em] uppercase text-[#0A0A0A]">
                    Filters
                    {activeCount > 0 && (
                        <span className="ml-2 text-[10px] text-white bg-[#0A0A0A] rounded-full px-2 py-0.5">
                            {activeCount}
                        </span>
                    )}
                </p>
                {activeCount > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-xs font-light text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors duration-200"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* ── 1. GENDER ─────────────────────────────────────── */}
            <FilterSection
                title="Gender"
                open={openSections.gender}
                onToggle={() => toggleSection("gender")}
                badge={filters.gender ? 1 : 0}
            >
                <div className="flex flex-wrap gap-2 pt-2">
                    {["All", "Men", "Women", "Kids"].map((g) => (
                        <Chip
                            key={g}
                            label={g}
                            active={g === "All" ? !filters.gender : filters.gender === g.toLowerCase()}
                            onClick={() => setGender(g.toLowerCase())}
                        />
                    ))}
                </div>
            </FilterSection>

            {/* ── 2. CATEGORY (grouped by piece_type_group) ──────── */}
            <FilterSection
                title="Category"
                open={openSections.category}
                onToggle={() => toggleSection("category")}
                badge={(filters.pieceTypeGroup ? 1 : 0) + (filters.category ? 1 : 0)}
            >
                {catLoading ? (
                    <div className="space-y-2 pt-2">
                        {[1, 2, 3].map((i) => <div key={i} className="h-3 bg-[#E8E4DF] rounded animate-pulse" />)}
                    </div>
                ) : (
                    <div className="space-y-3 pt-2">
                        {visibleGroups.map((group) => {
                            const cats = groupedCategories[group] ?? [];
                            const isActiveGroup = filters.pieceTypeGroup === group;
                            const count = groupCounts[group] ?? 0;

                            return (
                                <div key={group}>
                                    {/* Group header — clickable to filter by piece_type_group */}
                                    <button
                                        onClick={() => setPieceTypeGroup(group)}
                                        className={`w-full flex items-center justify-between mb-2 group/header ${isActiveGroup ? "text-[#0A0A0A]" : "text-[#8A8A8A] hover:text-[#0A0A0A]"} transition-colors`}
                                    >
                                        <span className={`text-[10px] font-medium tracking-[0.2em] uppercase ${isActiveGroup ? "text-[#0A0A0A]" : ""}`}>
                                            {GROUP_LABELS[group]}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            {count > 0 && (
                                                <span className="text-[10px] font-light text-[#8A8A8A]">({count})</span>
                                            )}
                                            {isActiveGroup && (
                                                <span className="w-4 h-4 bg-[#0A0A0A] text-white text-[9px] flex items-center justify-center rounded-full">✓</span>
                                            )}
                                        </span>
                                    </button>

                                    {/* Subcategories */}
                                    <div className="space-y-1.5 pl-2 border-l border-[#E8E4DF] ml-1">
                                        {cats.map((child) => {
                                            const sel = filters.category.includes(child.slug);
                                            const childCount = categoryCounts[child.id] ?? categoryCounts[child.slug] ?? 0;
                                            return (
                                                <button
                                                    key={child.id}
                                                    onClick={() => setCategory(child.slug)}
                                                    className="group w-full flex items-center justify-between gap-2 text-left py-0.5"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`flex-shrink-0 flex items-center justify-center w-3.5 h-3.5 border transition-colors ${sel ? "border-[#0A0A0A] bg-[#0A0A0A]" : "border-[#E8E4DF] group-hover:border-[#0A0A0A]"}`}>
                                                            {sel && (
                                                                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                                                    <path d="M8.33317 2.5L3.74984 7.08333L1.6665 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className={`text-[13px] capitalize transition-colors ${sel ? "text-[#0A0A0A] font-medium" : "text-[#4A4A4A] group-hover:text-[#0A0A0A]"}`}>
                                                            {child.name}
                                                        </span>
                                                    </div>
                                                    {childCount > 0 && (
                                                        <span className="text-[10px] text-[#8A8A8A] font-light">{childCount}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                        {cats.length === 0 && (
                                            <p className="text-[11px] text-[#B5B5B5] font-light italic">No subcategories</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </FilterSection>

            {/* ── 3. STYLE ─────────────────────────────────────── */}
            {opts("style").length > 0 && (
                <FilterSection
                    title="Style"
                    open={openSections.style}
                    onToggle={() => toggleSection("style")}
                    badge={filters.style.length}
                >
                    <div className="flex flex-wrap gap-2 pt-2">
                        {opts("style").map((o) => (
                            <Chip
                                key={o.id}
                                label={o.label}
                                active={filters.style.includes(o.value)}
                                count={styleCounts[o.value]}
                                onClick={() => setStyle(o.value)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* ── 4. SEASON ────────────────────────────────────── */}
            {opts("season").length > 0 && (
                <FilterSection
                    title="Season"
                    open={openSections.season}
                    onToggle={() => toggleSection("season")}
                    badge={filters.season.length}
                >
                    <div className="flex flex-wrap gap-2 pt-2">
                        {opts("season").map((o) => (
                            <Chip
                                key={o.id}
                                label={o.label}
                                active={filters.season.includes(o.value)}
                                count={seasonCounts[o.value]}
                                onClick={() => setSeason(o.value)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* ── 5. MATERIAL ──────────────────────────────────── */}
            {opts("material").length > 0 && (
                <FilterSection
                    title="Material"
                    open={openSections.material}
                    onToggle={() => toggleSection("material")}
                    badge={filters.material.length}
                >
                    <div className="flex flex-wrap gap-2 pt-2">
                        {opts("material").map((o) => (
                            <Chip
                                key={o.id}
                                label={o.label}
                                active={filters.material.includes(o.value)}
                                count={materialCounts[o.value]}
                                onClick={() => setMaterial(o.value)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* ── 6. BRAND ─────────────────────────────────────── */}
            {opts("brand").length > 0 && (
                <FilterSection
                    title="Brand"
                    open={openSections.brand}
                    onToggle={() => toggleSection("brand")}
                    badge={filters.brand.length}
                >
                    <div className="flex flex-wrap gap-2 pt-2">
                        {opts("brand").map((o) => (
                            <Chip
                                key={o.id}
                                label={o.label}
                                active={filters.brand.includes(o.value)}
                                count={brandCounts[o.value]}
                                onClick={() => setBrand(o.value)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* ── 7. SIZE ──────────────────────────────────────── */}
            <FilterSection
                title="Size"
                open={openSections.size ?? false}
                onToggle={() => toggleSection("size")}
                badge={filters.size.length}
            >
                <div className="flex flex-wrap gap-2 pt-2">
                    {ALL_SIZES.map((s) => (
                        <button
                            key={s}
                            onClick={() => setSize(s)}
                            className={`px-3 py-1.5 text-xs font-light border transition-all duration-200 ${filters.size.includes(s)
                                ? "bg-[#0A0A0A] border-[#0A0A0A] text-white"
                                : "border-[#E8E4DF] text-[#4A4A4A] hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
                                }`}
                        >
                            {s}{sizeCounts[s] ? <span className="ml-1 opacity-50 text-[10px]">({sizeCounts[s]})</span> : null}
                        </button>
                    ))}
                </div>
            </FilterSection>

            {/* ── 8. COLOR ─────────────────────────────────────── */}
            <FilterSection
                title="Color"
                open={openSections.color}
                onToggle={() => toggleSection("color")}
                badge={filters.colors.length}
            >
                {/* Color circles grid — 20 preset colors */}
                <div className="flex flex-wrap gap-2.5 pt-2 mb-4">
                    {EXTENDED_COLORS.map((c) => (
                        <ColorChip
                            key={c.value}
                            label={c.label}
                            value={c.value}
                            active={filters.colors.includes(c.value)}
                            onClick={() => toggleColor(c.value)}
                        />
                    ))}
                </div>
                {/* Custom color wheel */}
                <div className="flex items-center gap-3 pt-2 border-t border-[#E8E4DF]">
                    <span className="text-[11px] font-light text-[#8A8A8A] tracking-wide">Custom</span>
                    <label className="relative cursor-pointer" title="Pick a custom color">
                        <input
                            type="color"
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            onChange={(e) => toggleCustomColor(e.target.value)}
                        />
                        <span
                            className="block w-8 h-8 rounded-full border-2 border-dashed border-[#C8C8C8] hover:border-[#0A0A0A] transition-colors duration-200 flex items-center justify-center"
                            style={{
                                background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                            }}
                        />
                    </label>
                    {/* Show custom-selected colors */}
                    {filters.colors
                        .filter((c) => !EXTENDED_COLORS.find((ec) => ec.value === c))
                        .map((c) => (
                            <ColorChip
                                key={c}
                                label={c}
                                value={c}
                                active
                                onClick={() => toggleColor(c)}
                            />
                        ))}
                </div>
            </FilterSection>
        </div>
    );
};

export default HierarchicalShopFilters;
