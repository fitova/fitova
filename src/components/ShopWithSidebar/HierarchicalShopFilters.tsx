"use client";
import React, { useEffect, useState } from "react";
import { useStyleHub } from "@/app/context/StyleHubContext";
import { getCategoryHierarchy, type CategoryWithChildren } from "@/lib/queries/categories";

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
const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-3.5 py-1.5 text-xs font-light tracking-wide border transition-all duration-200 ${active
            ? "bg-[#0A0A0A] border-[#0A0A0A] text-white"
            : "border-[#E8E4DF] text-[#4A4A4A] hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
            }`}
    >
        {label}
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

/**
 * Complete shop filter sidebar with:
 *  - Gender pills
 *  - Hierarchical Category accordion (from DB)
 *  - Style, Mood, Occasion, Season, Material, Brand chips (from StyleHubContext / DB)
 *  - Color circles (from StyleHubContext / DB)
 */
const HierarchicalShopFilters = ({
    onFiltersChange,
}: {
    onFiltersChange?: (f: ShopFilterState) => void;
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

    /* ── Local filter state ──────────────────────────────────── */
    const [gender, setGender] = useState("all");
    const [selectedCats, setSelectedCats] = useState<string[]>([]);
    const [selectedStyle, setSelectedStyle] = useState<string[]>([]);
    const [selectedMood, setSelectedMood] = useState<string[]>([]);
    const [selectedOccasion, setSelectedOccasion] = useState<string[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<string[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState<string[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);

    /* ── Section open state ──────────────────────────────────── */
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        gender: true,
        category: true,
        style: false,
        mood: false,
        occasion: false,
        season: false,
        material: false,
        brand: false,
        color: false,
    });

    const toggleSection = (key: string) =>
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

    /* ── Helper to toggle array values ──────────────────────── */
    const toggleArr = (
        arr: string[],
        val: string,
        setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

    /* ── Filter options grouped by category ─────────────────── */
    const opts = (cat: string) => filterOptions.filter((o) => o.category === cat);

    /* ── Visible categories based on selected gender ─────────── */
    const visibleCats = hierarchy.filter((parent) => {
        if (gender === "all") return true;
        const g = parent.gender ?? [];
        return g.includes(gender) || g.includes("unisex") || parent.slug === gender;
    });

    /* ── Total active filter count ───────────────────────────── */
    const activeCount =
        (gender !== "all" ? 1 : 0) +
        selectedCats.length +
        selectedStyle.length +
        selectedMood.length +
        selectedOccasion.length +
        selectedSeason.length +
        selectedMaterial.length +
        selectedBrand.length +
        selectedColors.length;

    const clearAll = () => {
        setGender("all");
        setSelectedCats([]);
        setSelectedStyle([]);
        setSelectedMood([]);
        setSelectedOccasion([]);
        setSelectedSeason([]);
        setSelectedMaterial([]);
        setSelectedBrand([]);
        setSelectedColors([]);
    };

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
                badge={gender !== "all" ? 1 : 0}
            >
                <div className="flex flex-wrap gap-2 pt-2">
                    {["All", "Men", "Women", "Kids"].map((g) => (
                        <Chip
                            key={g}
                            label={g}
                            active={gender === g.toLowerCase()}
                            onClick={() => setGender(g.toLowerCase())}
                        />
                    ))}
                </div>
            </FilterSection>

            {/* ── 2. CATEGORY (hierarchical from DB) ───────────── */}
            <FilterSection
                title="Category"
                open={openSections.category}
                onToggle={() => toggleSection("category")}
                badge={selectedCats.length}
            >
                {catLoading ? (
                    <div className="space-y-2 pt-2">
                        {[1, 2, 3].map((i) => <div key={i} className="h-3 bg-[#E8E4DF] rounded animate-pulse" />)}
                    </div>
                ) : (
                    <div className="space-y-4 pt-2">
                        {visibleCats.map((parent) => (
                            <div key={parent.id}>
                                <p className="text-[10px] font-light tracking-[0.2em] uppercase text-[#8A8A8A] mb-2">
                                    {parent.name}
                                </p>
                                <div className="space-y-2">
                                    {parent.children.map((child) => {
                                        const sel = selectedCats.includes(child.slug);
                                        return (
                                            <button
                                                key={child.id}
                                                onClick={() => toggleArr(selectedCats, child.slug, setSelectedCats)}
                                                className="group w-full flex items-center gap-2.5 text-left"
                                            >
                                                <div className={`flex-shrink-0 flex items-center justify-center w-4 h-4 border transition-colors ${sel ? "border-[#0A0A0A] bg-[#0A0A0A]" : "border-[#E8E4DF] group-hover:border-[#0A0A0A]"}`}>
                                                    {sel && (
                                                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                                                            <path d="M8.33317 2.5L3.74984 7.08333L1.6665 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className={`text-sm capitalize transition-colors ${sel ? "text-[#0A0A0A] font-medium" : "text-[#4A4A4A] group-hover:text-[#0A0A0A]"}`}>
                                                    {child.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                    {parent.children.length === 0 && (
                                        <button
                                            onClick={() => toggleArr(selectedCats, parent.slug, setSelectedCats)}
                                            className="group w-full flex items-center gap-2.5 text-left"
                                        >
                                            <div className={`flex-shrink-0 flex items-center justify-center w-4 h-4 border transition-colors ${selectedCats.includes(parent.slug) ? "border-[#0A0A0A] bg-[#0A0A0A]" : "border-[#E8E4DF] group-hover:border-[#0A0A0A]"}`}>
                                                {selectedCats.includes(parent.slug) && (
                                                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                                                        <path d="M8.33317 2.5L3.74984 7.08333L1.6665 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-sm capitalize text-[#4A4A4A] group-hover:text-[#0A0A0A] transition-colors">
                                                {parent.name}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {visibleCats.length === 0 && (
                            <p className="text-sm text-[#8A8A8A] font-light">No categories found</p>
                        )}
                    </div>
                )}
            </FilterSection>

            {/* ── 3. STYLE ─────────────────────────────────────── */}
            {opts("style").length > 0 && (
                <FilterSection
                    title="Style"
                    open={openSections.style}
                    onToggle={() => toggleSection("style")}
                    badge={selectedStyle.length}
                >
                    <div className="flex flex-wrap gap-2 pt-2">
                        {opts("style").map((o) => (
                            <Chip
                                key={o.id}
                                label={o.label}
                                active={selectedStyle.includes(o.value)}
                                onClick={() => toggleArr(selectedStyle, o.value, setSelectedStyle)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* ── 4. MOOD ──────────────────────────────────────── */}
            {opts("mood").length > 0 && (
                <FilterSection
                    title="Mood"
                    open={openSections.mood}
                    onToggle={() => toggleSection("mood")}
                    badge={selectedMood.length}
                >
                    <div className="flex flex-wrap gap-2 pt-2">
                        {opts("mood").map((o) => (
                            <Chip
                                key={o.id}
                                label={o.label}
                                active={selectedMood.includes(o.value)}
                                onClick={() => toggleArr(selectedMood, o.value, setSelectedMood)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* ── 5. OCCASION ──────────────────────────────────── */}
            {opts("occasion").length > 0 && (
                <FilterSection
                    title="Occasion"
                    open={openSections.occasion}
                    onToggle={() => toggleSection("occasion")}
                    badge={selectedOccasion.length}
                >
                    <div className="flex flex-wrap gap-2 pt-2">
                        {opts("occasion").map((o) => (
                            <Chip
                                key={o.id}
                                label={o.label}
                                active={selectedOccasion.includes(o.value)}
                                onClick={() => toggleArr(selectedOccasion, o.value, setSelectedOccasion)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* ── 6. SEASON ────────────────────────────────────── */}
            {opts("season").length > 0 && (
                <FilterSection
                    title="Season"
                    open={openSections.season}
                    onToggle={() => toggleSection("season")}
                    badge={selectedSeason.length}
                >
                    <div className="flex flex-wrap gap-2 pt-2">
                        {opts("season").map((o) => (
                            <Chip
                                key={o.id}
                                label={o.label}
                                active={selectedSeason.includes(o.value)}
                                onClick={() => toggleArr(selectedSeason, o.value, setSelectedSeason)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* ── 7. MATERIAL ──────────────────────────────────── */}
            {opts("material").length > 0 && (
                <FilterSection
                    title="Material"
                    open={openSections.material}
                    onToggle={() => toggleSection("material")}
                    badge={selectedMaterial.length}
                >
                    <div className="flex flex-wrap gap-2 pt-2">
                        {opts("material").map((o) => (
                            <Chip
                                key={o.id}
                                label={o.label}
                                active={selectedMaterial.includes(o.value)}
                                onClick={() => toggleArr(selectedMaterial, o.value, setSelectedMaterial)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* ── 8. BRAND ─────────────────────────────────────── */}
            {opts("brand").length > 0 && (
                <FilterSection
                    title="Brand"
                    open={openSections.brand}
                    onToggle={() => toggleSection("brand")}
                    badge={selectedBrand.length}
                >
                    <div className="flex flex-wrap gap-2 pt-2">
                        {opts("brand").map((o) => (
                            <Chip
                                key={o.id}
                                label={o.label}
                                active={selectedBrand.includes(o.value)}
                                onClick={() => toggleArr(selectedBrand, o.value, setSelectedBrand)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* ── 9. COLOR ─────────────────────────────────────── */}
            {opts("color").length > 0 && (
                <FilterSection
                    title="Color"
                    open={openSections.color}
                    onToggle={() => toggleSection("color")}
                    badge={selectedColors.length}
                >
                    <div className="flex flex-wrap gap-3 pt-2">
                        {opts("color").map((o) => (
                            <ColorChip
                                key={o.id}
                                label={o.label}
                                value={o.value}
                                active={selectedColors.includes(o.value)}
                                onClick={() => toggleArr(selectedColors, o.value, setSelectedColors)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}
        </div>
    );
};

// Export the filter state type for external use
export type ShopFilterState = {
    gender: string;
    categories: string[];
    style: string[];
    mood: string[];
    occasion: string[];
    season: string[];
    material: string[];
    brand: string[];
    colors: string[];
};

export default HierarchicalShopFilters;
