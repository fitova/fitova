"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, mapProductFromDB } from "@/types/product";
import { getTrendingProducts } from "@/lib/queries/trending";
import { getBestSellers } from "@/lib/queries/bestSellers";
import { getNewArrivals } from "@/lib/queries/products";
import SingleItem from "../BestSeller/SingleItem";
import { useCurrentUser } from "@/app/context/AuthContext";

// ─── Category Group Cards (same layout system as other homepage sections) ──────
const CATEGORY_GROUPS = [
    { label: "Clothing", slug: "clothing", bg: "#1a1a1a" },
    { label: "Footwear", slug: "footwear", bg: "#2c2c2c" },
    { label: "Accessories", slug: "accessories", bg: "#3a3a3a" },
    { label: "Fragrances", slug: "fragrances", bg: "#4a4a3a" },
];

// SVG icons per group so they work without images
const GROUP_ICONS: Record<string, React.ReactNode> = {
    clothing: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
        </svg>
    ),
    footwear: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h15l2 4H2z" /><path d="M2 12L5 6h6l2 6" /><circle cx="6" cy="17" r="1.5" /><circle cx="14" cy="17" r="1.5" />
        </svg>
    ),
    accessories: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="3" /><path d="M12 5V3M12 21v-2M5 12H3M21 12h-2" />
        </svg>
    ),
    fragrances: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3h6v4H9zM7 7h10v13a2 2 0 01-2 2H9a2 2 0 01-2-2V7z" /><path d="M12 3V1M9 1h6" />
        </svg>
    ),
};

const CategoryGroupCard = ({ group }: { group: typeof CATEGORY_GROUPS[0] }) => (
    <Link
        href={`/outfits?piece_type_group=${group.slug}`}
        className="group relative flex flex-col items-center justify-center overflow-hidden rounded-sm p-6 text-center transition-all duration-300 hover:shadow-lg"
        style={{ background: group.bg, minHeight: "140px" }}
    >
        {/* Icon */}
        <div className="mb-3 transition-transform duration-300 group-hover:scale-110">
            {GROUP_ICONS[group.slug]}
        </div>
        {/* Label */}
        <p className="text-white font-medium text-xs tracking-[0.2em] uppercase">{group.label}</p>
        {/* Hover arrow */}
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-white/60 text-[10px] tracking-wide">Shop Now</span>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Link>
);

type Tab = "trending" | "best_sellers" | "new_arrivals";

const ThisWeek = () => {
    const [activeTab, setActiveTab] = useState<Tab>("trending");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useCurrentUser();

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            try {
                let data: Product[] = [];
                if (activeTab === "trending") {
                    data = await getTrendingProducts(8);
                } else if (activeTab === "best_sellers") {
                    data = await getBestSellers(8);
                } else if (activeTab === "new_arrivals") {
                    const raw = await getNewArrivals(8);
                    data = raw.map(mapProductFromDB);
                }
                setProducts(data);
            } catch (error) {
                console.error("Error loading this week products:", error);
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, [activeTab, user]);

    return (
        <section className="overflow-hidden py-14 bg-white">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">

                {/* ── Category Image Row (same layout system) ────────────── */}
                <div className="mb-10">
                    <span className="flex items-center gap-2.5 text-xs font-light tracking-[0.2em] uppercase text-dark-4 mb-3">
                        Browse Styles
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {CATEGORY_GROUPS.map(group => (
                            <CategoryGroupCard key={group.slug} group={group} />
                        ))}
                    </div>
                </div>

                {/* ── Tab Header ─────────────────────────────────────────── */}
                <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <span className="flex items-center gap-2.5 text-xs font-light tracking-[0.2em] uppercase text-dark-4 mb-3">
                            Overview
                        </span>
                        <h2 className="font-playfair font-normal text-3xl xl:text-4xl text-dark mb-1">
                            This Week
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("trending")}
                            className={`font-medium text-sm tracking-wide pb-2 border-b-2 transition-colors duration-300 ${activeTab === "trending"
                                ? "border-dark text-dark"
                                : "border-transparent text-dark-4 hover:text-dark"
                                }`}
                        >
                            Trending (7 Days)
                        </button>
                        <button
                            onClick={() => setActiveTab("best_sellers")}
                            className={`font-medium text-sm tracking-wide pb-2 border-b-2 transition-colors duration-300 ${activeTab === "best_sellers"
                                ? "border-dark text-dark"
                                : "border-transparent text-dark-4 hover:text-dark"
                                }`}
                        >
                            Best Sellers
                        </button>
                        <button
                            onClick={() => setActiveTab("new_arrivals")}
                            className={`font-medium text-sm tracking-wide pb-2 border-b-2 transition-colors duration-300 ${activeTab === "new_arrivals"
                                ? "border-dark text-dark"
                                : "border-transparent text-dark-4 hover:text-dark"
                                }`}
                        >
                            New Arrivals
                        </button>
                    </div>

                    {/* View All button */}
                    <Link
                        href="/outfits"
                        className="hidden sm:inline-flex items-center gap-2 font-light text-xs tracking-[0.15em] uppercase border border-dark text-dark px-5 py-2 ease-out duration-300 hover:bg-dark hover:text-white"
                    >
                        View All
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>

                {/* ── Product Grid ───────────────────────────────────────── */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7.5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-100 aspect-[3/4] rounded-sm mb-3" />
                                    <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7.5">
                            {products.map((item, key) => (
                                <SingleItem item={item} key={key} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-full min-h-[400px]">
                            <p className="text-dark-4 font-light">
                                {`No products found for ${activeTab.replace("_", " ")}.`}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ThisWeek;
