"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryWithChildren, CategoryImage } from "@/lib/queries/categories";

interface MegaMenuProps {
    categories: CategoryWithChildren[];
    categoryImages?: CategoryImage[];
    stickyMenu?: boolean;
    isTransparent?: boolean;
}

// ─── Static fallback (shown when DB is empty / loading) ──────────────────────
export type StaticChild = { id: string; name: string; slug: string; piece_type: string };
export type StaticCat = { id: string; name: string; slug: string; gender: string[]; image_url: null; children: StaticChild[] };

export const STATIC_CATEGORIES: StaticCat[] = [
    {
        id: "static-men", name: "Men", slug: "men", gender: ["men"], image_url: null,
        children: [
            // CLOTHING
            { id: "s1", name: "T-Shirts", slug: "men-tshirts", piece_type: "tshirt" },
            { id: "s2", name: "Shirts", slug: "men-shirts", piece_type: "shirt" },
            { id: "s3", name: "Hoodies", slug: "men-hoodies", piece_type: "hoodie" },
            { id: "s4", name: "Jackets", slug: "men-jackets", piece_type: "jacket" },
            { id: "s5", name: "Pants", slug: "men-pants", piece_type: "pants" },
            { id: "s6", name: "Jeans", slug: "men-jeans", piece_type: "jeans" },
            { id: "s7", name: "Shorts", slug: "men-shorts", piece_type: "shorts" },
            // FOOTWEAR
            { id: "s8", name: "Sneakers", slug: "men-sneakers", piece_type: "sneakers" },
            { id: "s9", name: "Boots", slug: "men-boots", piece_type: "boots" },
            { id: "s10", name: "Sandals", slug: "men-sandals", piece_type: "sandals" },
            // ACCESSORIES
            { id: "s11", name: "Watches", slug: "men-watches", piece_type: "watch" },
            { id: "s12", name: "Belts", slug: "men-belts", piece_type: "belt" },
            { id: "s13", name: "Hats & Caps", slug: "men-hats", piece_type: "cap" },
            { id: "s14", name: "Bags", slug: "men-bags", piece_type: "bag" },
            { id: "s15", name: "Sunglasses", slug: "men-sunglasses", piece_type: "sunglasses" },
            { id: "s16", name: "Wallets", slug: "men-wallets", piece_type: "wallet" },
            // FRAGRANCES
            { id: "s17", name: "Fragrances", slug: "men-perfumes", piece_type: "perfume" },
        ],
    },
    {
        id: "static-women", name: "Women", slug: "women", gender: ["women"], image_url: null,
        children: [
            // CLOTHING
            { id: "w1", name: "Dresses", slug: "women-dresses", piece_type: "dress" },
            { id: "w2", name: "Tops", slug: "women-tops", piece_type: "top" },
            { id: "w3", name: "Skirts", slug: "women-skirts", piece_type: "skirt" },
            { id: "w4", name: "Jackets", slug: "women-jackets", piece_type: "jacket" },
            { id: "w5", name: "Pants", slug: "women-pants", piece_type: "pants" },
            { id: "w6", name: "Outerwear", slug: "women-outerwear", piece_type: "outerwear" },
            // FOOTWEAR
            { id: "w7", name: "Heels", slug: "women-heels", piece_type: "heels" },
            { id: "w8", name: "Sneakers", slug: "women-sneakers", piece_type: "sneakers" },
            { id: "w9", name: "Boots", slug: "women-boots", piece_type: "boots" },
            // ACCESSORIES
            { id: "w10", name: "Bags", slug: "women-bags", piece_type: "bag" },
            { id: "w11", name: "Jewelry", slug: "women-jewelry", piece_type: "jewelry" },
            { id: "w12", name: "Scarves", slug: "women-scarves", piece_type: "scarf" },
            { id: "w13", name: "Sunglasses", slug: "women-sunglasses", piece_type: "sunglasses" },
            { id: "w14", name: "Hats", slug: "women-hats", piece_type: "cap" },
            { id: "w15", name: "Wallets", slug: "women-wallets", piece_type: "wallet" },
            { id: "w16", name: "Belts", slug: "women-belts", piece_type: "belt" },
            // FRAGRANCES
            { id: "w17", name: "Fragrances", slug: "women-perfumes", piece_type: "perfume" },
        ],
    },
    {
        id: "static-kids", name: "Kids", slug: "kids", gender: ["kids"], image_url: null,
        children: [
            // CLOTHING
            { id: "k1", name: "Tops", slug: "kids-tops", piece_type: "top" },
            { id: "k2", name: "Pants", slug: "kids-pants", piece_type: "pants" },
            { id: "k3", name: "Dresses", slug: "kids-dresses", piece_type: "dress" },
            { id: "k4", name: "Shorts", slug: "kids-shorts", piece_type: "shorts" },
            // FOOTWEAR
            { id: "k5", name: "Sneakers", slug: "kids-sneakers", piece_type: "sneakers" },
            { id: "k6", name: "Sandals", slug: "kids-sandals", piece_type: "sandals" },
            // ACCESSORIES
            { id: "k7", name: "Bags", slug: "kids-bags", piece_type: "bag" },
            { id: "k8", name: "Hats & Caps", slug: "kids-hats", piece_type: "cap" },
            { id: "k9", name: "Socks", slug: "kids-socks", piece_type: "socks" },
            { id: "k10", name: "Sunglasses", slug: "kids-sunglasses", piece_type: "sunglasses" },
        ],
    },
];

// ─── Piece type → column (STRICT, no overlap) ────────────────────────────────
// CLOTHING: wearable garments
const PIECE_CLOTHING = new Set([
    "tshirt", "shirt", "hoodie", "jacket", "pants", "jeans", "shorts", "dress", "top",
    "skirt", "outerwear", "blouse", "bottom", "cardigan", "sweater", "coat", "vest",
]);
// FOOTWEAR: anything worn on feet
const PIECE_FOOTWEAR = new Set([
    "sneakers", "boots", "sandals", "heels", "shoes", "loafers", "flats", "slippers",
]);
// FRAGRANCES
const PIECE_PERFUMES = new Set(["perfume", "fragrance"]);
// ACCESSORIES: everything else explicitly named
const PIECE_ACCESSORIES = new Set([
    "watch", "belt", "cap", "bag", "sunglasses", "wallet", "jewelry", "scarf", "socks",
    "hat", "bracelet", "necklace", "ring", "earring", "backpack", "handbag", "clutch",
    "tote", "accessories", // generic fallback
]);

export type AnyChild = { id: string | number; name: string; slug?: string | null; piece_type?: string | null };

// Map column label → URL query value for piece_type_group
export const GROUP_TO_SLUG: Record<string, string> = {
    "Clothing": "clothing",
    "Footwear": "footwear",
    "Accessories": "accessories",
    "Fragrances": "fragrances",
};

// Infer piece_type from slug when piece_type is null
// e.g. "men-jackets" → "jacket", "women-shoes" → "shoes"
const SLUG_TO_TYPE: Record<string, string> = {
    "jackets": "jacket", "jacket": "jacket",
    "pants": "pants",
    "shirts": "shirt", "shirt": "shirt",
    "tshirts": "tshirt", "tshirt": "tshirt",
    "hoodies": "hoodie", "hoodie": "hoodie",
    "jeans": "jeans",
    "shorts": "shorts",
    "dresses": "dress", "dress": "dress",
    "tops": "top", "top": "top",
    "skirts": "skirt", "skirt": "skirt",
    "outerwear": "outerwear",
    "activewear": "tshirt",
    // Footwear
    "shoes": "shoes",
    "sneakers": "sneakers",
    "boots": "boots",
    "sandals": "sandals",
    "heels": "heels",
    // Accessories
    "watches": "watch",
    "belts": "belt",
    "bags": "bag",
    "sunglasses": "sunglasses",
    "wallets": "wallet",
    "hats": "cap",
    "jewelry": "jewelry",
    "scarves": "scarf",
    "socks": "socks",
    // Fragrances
    "perfumes": "perfume", "perfume": "perfume",
    "fragrances": "perfume",
};

export function inferType(c: AnyChild): string {
    // Use piece_type if it exists and isn't "null" string
    const pt = c.piece_type?.toLowerCase();
    if (pt && pt !== "null") return pt;
    // Fallback: derive from slug (e.g. "men-jackets" → "jackets" → "jacket")
    if (c.slug) {
        const lastPart = c.slug.split("-").pop() ?? "";
        if (SLUG_TO_TYPE[lastPart]) return SLUG_TO_TYPE[lastPart];
    }
    // Last resort: try matching lowercase name
    const nameLower = c.name.toLowerCase();
    for (const [key, val] of Object.entries(SLUG_TO_TYPE)) {
        if (nameLower.includes(key)) return val;
    }
    return "unknown";
}

export function groupChildren(children: AnyChild[]) {
    const clothing: AnyChild[] = [];
    const footwear: AnyChild[] = [];
    const perfumes: AnyChild[] = [];
    const accessories: AnyChild[] = [];

    for (const c of children) {
        const type = inferType(c);
        if (PIECE_CLOTHING.has(type)) clothing.push(c);
        else if (PIECE_FOOTWEAR.has(type)) footwear.push(c);
        else if (PIECE_PERFUMES.has(type)) perfumes.push(c);
        else if (PIECE_ACCESSORIES.has(type)) accessories.push(c);
        else clothing.push(c); // truly unknown → clothing
    }

    if (!clothing.length && !footwear.length && !perfumes.length && !accessories.length) {
        return { clothing: children, footwear: [], perfumes: [], accessories: [] };
    }
    return { clothing, footwear, perfumes, accessories };
}


// ─── Inline auto-slider ───────────────────────────────────────────────────────
type SliderImage = { src: string; group?: string | null };

const NavSlider = ({
    images,
    alt,
    hoveredGroup,
}: {
    images: SliderImage[];
    alt: string;
    hoveredGroup: string | null;
}) => {
    const [current, setCurrent] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Filter images: if hoveredGroup set and some images match, show only those; else show all
    const visibleImages: SliderImage[] = (() => {
        if (!hoveredGroup) return images;
        const filtered = images.filter(img => img.group === hoveredGroup);
        return filtered.length > 0 ? filtered : images;
    })();

    const start = useCallback(() => {
        timerRef.current = setInterval(() => setCurrent(p => (p + 1) % visibleImages.length), 3500);
    }, [visibleImages.length]);

    // Reset to first image whenever visible set changes
    useEffect(() => {
        setCurrent(0);
        if (timerRef.current) clearInterval(timerRef.current);
        if (visibleImages.length > 1) start();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [visibleImages.length, start, hoveredGroup]);

    if (!visibleImages.length) return (
        <div className="w-full rounded-sm bg-[#F0EDE8] flex items-center justify-center" style={{ aspectRatio: "3/4" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" opacity="0.15">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#000" strokeWidth="1.5" />
                <path d="M3 15l5-5 4 4 3-3 6 6" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        </div>
    );

    return (
        <div className="relative overflow-hidden rounded-sm" style={{ aspectRatio: "3/4" }}
            onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
            onMouseLeave={start}>
            {visibleImages.map((img, i) => (
                <div key={i} className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}>
                    <Image src={img.src} alt={`${alt} ${i + 1}`} fill className="object-cover" sizes="160px" loading="lazy" />
                </div>
            ))}
            {/* Group label overlay */}
            {hoveredGroup && (
                <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-black/60 to-transparent px-2 py-2">
                    <p className="text-[8px] font-medium tracking-[0.2em] uppercase text-white/90">{hoveredGroup}</p>
                </div>
            )}
        </div>
    );
};

// ─── Category column ──────────────────────────────────────────────────────────
const CategoryColumn = ({
    label, items, genderSlug, onClose, onGroupHover
}: {
    label: string;
    items: AnyChild[];
    genderSlug: string;
    onClose: () => void;
    onGroupHover: (group: string | null) => void;
}) => {
    if (!items.length) return null;
    const groupSlug = GROUP_TO_SLUG[label];
    const groupHref = groupSlug ? `/outfits?gender=${genderSlug}&piece_type_group=${groupSlug}` : undefined;

    return (
        <div
            className="min-w-0"
            onMouseEnter={() => onGroupHover(groupSlug ?? null)}
            onMouseLeave={() => onGroupHover(null)}
        >
            {/* Group header — clickable link if mapping exists */}
            {groupHref ? (
                <Link
                    href={groupHref}
                    onClick={onClose}
                    className="group/lbl inline-flex items-center gap-1 text-[9px] font-medium tracking-[0.28em] uppercase mb-2.5 text-[#8A8A8A] hover:text-dark transition-colors duration-200 cursor-pointer"
                >
                    {label}
                    <svg
                        width="7" height="7" viewBox="0 0 24 24" fill="none"
                        className="opacity-0 group-hover/lbl:opacity-100 transition-opacity duration-200 shrink-0"
                    >
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
            ) : (
                <p className="text-[9px] font-medium tracking-[0.28em] uppercase mb-2.5 text-[#8A8A8A]">{label}</p>
            )}
            <ul className="flex flex-col gap-1.5">
                {items.map(sub => (
                    <li key={sub.id}>
                        <Link
                            href={`/outfits?gender=${genderSlug}&category=${sub.slug ?? sub.id}`}
                            className="text-[13px] font-light text-dark hover:opacity-50 transition-opacity duration-200 block"
                            onClick={onClose}
                        >
                            {sub.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// ─── Main MegaMenu ────────────────────────────────────────────────────────────
const MegaMenu = ({ categories, categoryImages = [], stickyMenu, isTransparent = false }: MegaMenuProps) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const open = (i: number) => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setActiveIndex(i);
    };
    const close = () => {
        closeTimer.current = setTimeout(() => { setActiveIndex(null); setHoveredGroup(null); }, 200);
    };
    const closeNow = () => { setActiveIndex(null); setHoveredGroup(null); };
    useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

    const source: (CategoryWithChildren | StaticCat)[] =
        categories?.length > 0 ? categories : STATIC_CATEGORIES;

    return (
        <>
            {source.map((cat, i) => {
                const isOpen = activeIndex === i;
                const { clothing, footwear, perfumes, accessories } = groupChildren(cat.children as AnyChild[]);
                const genderRaw = Array.isArray(cat.gender) ? cat.gender[0] : (cat.gender as string | null);
                const genderSlug = genderRaw ?? cat.slug ?? "";

                // Build slider images — try backend categoryImages first, else fallback to cat.image_url
                const genderImages = categoryImages.filter(ci => ci.gender_id.toString() === cat.id);
                let sliderImages: SliderImage[] = [];
                if (genderImages.length > 0) {
                    sliderImages = genderImages.map(ci => ({ src: ci.image_url, group: ci.piece_type_group }));
                } else {
                    const catTyped = cat as CategoryWithChildren & { image_url?: string | null };
                    if (catTyped.image_url) {
                        sliderImages = [{ src: catTyped.image_url }];
                    }
                }

                // Determine columns to show (skip empty; Kids never shows Fragrances)
                const isKids = genderSlug === "kids";
                const cols = [
                    { label: "Clothing", items: clothing },
                    { label: "Footwear", items: footwear },
                    { label: "Accessories", items: accessories },
                    ...(!isKids ? [{ label: "Fragrances", items: perfumes }] : []),
                ].filter(c => c.items.length > 0);

                return (
                    <li
                        key={cat.id}
                        className="group relative before:w-0 before:h-[2px] before:bg-dark before:absolute before:left-0 before:top-0 before:rounded-b-[2px] before:ease-out before:duration-200 hover:before:w-full"
                        onMouseEnter={() => open(i)}
                        onMouseLeave={close}
                    >
                        {/* Nav button */}
                        <button
                            aria-haspopup="true"
                            aria-expanded={isOpen}
                            className={`flex items-center gap-1 text-custom-sm font-light tracking-wide transition-colors duration-300 ${stickyMenu ? "xl:py-4" : "xl:py-6"} ${isTransparent ? "text-white hover:text-white/70" : "text-dark hover:text-dark-2"}`}
                        >
                            {cat.name}
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                                className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {/* Dropdown panel */}
                        <div
                            aria-hidden={!isOpen}
                            className={`xl:absolute left-0 top-full bg-white xl:border border-[#E8E4DF] xl:shadow-lg z-50 transition-all duration-200 ease-out ${isOpen ? "opacity-100 translate-y-0 h-auto pointer-events-auto" : "opacity-0 -translate-y-2 h-0 overflow-hidden pointer-events-none xl:h-auto"} xl:max-w-[calc(100vw-2rem)] xl:min-w-[520px] xl:w-max w-full`}
                        >
                            {/* View All */}
                            <div className="px-6 pt-4 pb-3 border-b border-[#E8E4DF]">
                                <Link
                                    href={`/outfits?gender=${genderSlug}`}
                                    className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-dark hover:opacity-60 transition-opacity duration-200"
                                    onClick={closeNow}
                                >
                                    View All {cat.name}
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Body: columns + optional slider */}
                            <div className="p-5 flex flex-col xl:flex-row gap-6 items-start overflow-hidden">
                                {/* Columns — each in its own box */}
                                <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 flex-shrink-0 w-full xl:w-auto">
                                    {cols.map(col => (
                                        <CategoryColumn
                                            key={col.label}
                                            label={col.label}
                                            items={col.items}
                                            genderSlug={genderSlug}
                                            onClose={closeNow}
                                            onGroupHover={setHoveredGroup}
                                        />
                                    ))}
                                </div>

                                {/* Slider (xl only) */}
                                <div className="hidden xl:block w-[140px] flex-shrink-0">
                                    <NavSlider images={sliderImages} alt={cat.name} hoveredGroup={isOpen ? hoveredGroup : null} />
                                </div>
                            </div>
                        </div>
                    </li>
                );
            })}

            {/* ─── Static "This Week" MegaMenu ─────────────────────────────────────────── */}
            <li
                className="group relative before:w-0 before:h-[2px] before:bg-dark before:absolute before:left-0 before:top-0 before:rounded-b-[2px] before:ease-out before:duration-200 hover:before:w-full"
                onMouseEnter={() => open(999)}
                onMouseLeave={close}
            >
                {/* Nav button */}
                <button
                    aria-haspopup="true"
                    aria-expanded={activeIndex === 999}
                    className={`flex items-center gap-1 text-custom-sm font-light tracking-wide transition-colors duration-300 ${stickyMenu ? "xl:py-4" : "xl:py-6"} ${isTransparent ? "text-white hover:text-white/70" : "text-dark hover:text-dark-2"}`}
                >
                    This Week
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                        className={`transition-transform duration-200 ${activeIndex === 999 ? "rotate-180" : ""}`}>
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Dropdown panel */}
                <div
                    aria-hidden={activeIndex !== 999}
                    className={`xl:absolute left-0 top-full bg-white xl:border border-[#E8E4DF] xl:shadow-lg z-50 transition-all duration-200 ease-out ${activeIndex === 999 ? "opacity-100 translate-y-0 h-auto pointer-events-auto" : "opacity-0 -translate-y-2 h-0 overflow-hidden pointer-events-none xl:h-auto"} xl:max-w-[calc(100vw-2rem)] xl:min-w-[420px] xl:w-max w-full`}
                >
                    <div className="px-6 pt-4 pb-3 border-b border-[#E8E4DF]">
                        <Link
                            href="/this-week"
                            className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-dark hover:opacity-60 transition-opacity duration-200"
                            onClick={closeNow}
                        >
                            View All This Week
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    </div>

                    <div className="p-5 flex flex-col xl:flex-row gap-6 items-start overflow-hidden">
                        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 flex-shrink-0 w-full xl:w-auto">
                            <div className="min-w-0">
                                <h3 className="group/lbl inline-flex items-center gap-1 text-[9px] font-medium tracking-[0.28em] uppercase mb-2.5 text-[#8A8A8A] hover:text-dark transition-colors duration-200 cursor-pointer">
                                    Collections
                                </h3>
                                <ul className="flex flex-col gap-3">
                                    <li>
                                        <Link href="/this-week/trending" className="text-[13px] font-light text-dark hover:opacity-50 transition-opacity duration-200 block" onClick={closeNow}>
                                            Trending
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/this-week/best-sellers" className="text-[13px] font-light text-dark hover:opacity-50 transition-opacity duration-200 block" onClick={closeNow}>
                                            Best Sellers
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/this-week/new-arrivals" className="text-[13px] font-light text-dark hover:opacity-50 transition-opacity duration-200 block" onClick={closeNow}>
                                            New Arrivals
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div className="min-w-0">
                                <h3 className="group/lbl inline-flex items-center gap-1 text-[9px] font-medium tracking-[0.28em] uppercase mb-2.5 text-[#8A8A8A] hover:text-dark transition-colors duration-200 cursor-pointer">
                                    Personal
                                </h3>
                                <ul className="flex flex-col gap-3">
                                    <li>
                                        <Link href="/this-week/recently-viewed" className="text-[13px] font-light text-dark hover:opacity-50 transition-opacity duration-200 block" onClick={closeNow}>
                                            Recently Viewed
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Slider (xl only) */}
                        <div className="hidden xl:block w-[140px] flex-shrink-0">
                            <NavSlider images={[{ src: "/images/categories/categories-04.png", group: "clothing" }]} alt="This Week" hoveredGroup={null} />
                        </div>
                    </div>
                </div>
            </li>
        </>
    );
};

export default MegaMenu;
