"use client";
import React, { useState } from "react";

type Deal = {
    id: number;
    name: string;
    brand: string;
    category: string;
    originalPrice: number;
    salePrice: number;
    discountPct: number;
    tag?: "Hot Deal" | "Limited Time" | "Flash Sale";
    affiliateLink: string;
    gradient: string;
};

const deals: Deal[] = [
    { id: 1, name: "Classic Leather Jacket", brand: "Zara", category: "Jackets", originalPrice: 220, salePrice: 154, discountPct: 30, tag: "Hot Deal", affiliateLink: "#", gradient: "linear-gradient(135deg, #0A0A0A 0%, #2C2C2C 100%)" },
    { id: 2, name: "Slim Fit Chinos", brand: "H&M", category: "Pants", originalPrice: 60, salePrice: 36, discountPct: 40, tag: "Flash Sale", affiliateLink: "#", gradient: "linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)" },
    { id: 3, name: "Premium Cotton Tee", brand: "Uniqlo", category: "T-Shirts", originalPrice: 35, salePrice: 25, discountPct: 28, affiliateLink: "#", gradient: "linear-gradient(135deg, #1A1A1A 0%, #3A3A3A 100%)" },
    { id: 4, name: "Running Sneakers", brand: "Nike", category: "Shoes", originalPrice: 120, salePrice: 84, discountPct: 30, tag: "Limited Time", affiliateLink: "#", gradient: "linear-gradient(135deg, #1A0D0D 0%, #3D1A1A 100%)" },
    { id: 5, name: "Silk Evening Shirt", brand: "Zara", category: "Shirts", originalPrice: 90, salePrice: 54, discountPct: 40, tag: "Hot Deal", affiliateLink: "#", gradient: "linear-gradient(135deg, #2C1810 0%, #6B3A2A 100%)" },
    { id: 6, name: "Minimalist Tote Bag", brand: "H&M", category: "Bags", originalPrice: 45, salePrice: 27, discountPct: 40, affiliateLink: "#", gradient: "linear-gradient(135deg, #1A1A0A 0%, #3A3A2A 100%)" },
    { id: 7, name: "Denim Jacket", brand: "Levi's", category: "Jackets", originalPrice: 100, salePrice: 65, discountPct: 35, tag: "Flash Sale", affiliateLink: "#", gradient: "linear-gradient(135deg, #0A0A1A 0%, #1A1A3D 100%)" },
    { id: 8, name: "Canvas Low-Top Sneakers", brand: "Converse", category: "Shoes", originalPrice: 80, salePrice: 52, discountPct: 35, affiliateLink: "#", gradient: "linear-gradient(135deg, #1A1A1A 0%, #404040 100%)" },
];

const categories = ["All", "T-Shirts", "Shirts", "Pants", "Jackets", "Shoes", "Bags"];

export default function Deals() {
    const [activeCategory, setActiveCategory] = useState("All");

    const filtered =
        activeCategory === "All"
            ? deals
            : deals.filter((d) => d.category === activeCategory);

    return (
        <main style={{ background: "#F6F5F2" }}>
            {/* ── Hero ────────────────────────────────────────────── */}
            <section
                className="flex flex-col items-center justify-center text-center pt-[120px] lg:pt-[180px] pb-20 px-4"
                style={{ background: "#0A0A0A" }}
            >
                <span
                    className="block text-xs font-light tracking-[0.35em] uppercase mb-6"
                    style={{ color: "rgba(246,245,242,0.45)" }}
                >
                    Limited Time Offers
                </span>
                <h1
                    className="font-playfair text-5xl md:text-6xl font-normal mb-5"
                    style={{ color: "#F6F5F2", letterSpacing: "-0.03em" }}
                >
                    Deals &amp; Offers
                </h1>
                <p
                    className="font-light text-sm max-w-md leading-relaxed"
                    style={{ color: "rgba(246,245,242,0.5)" }}
                >
                    Handpicked discounts from top fashion brands — updated daily so you never miss a deal.
                </p>
            </section>

            {/* ── Category Filters ─────────────────────────────────── */}
            <section
                className="sticky top-[72px] z-10"
                style={{ background: "#F6F5F2", borderBottom: "1px solid #E8E4DF" }}
            >
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 py-4 flex gap-2 overflow-x-auto no-scrollbar flex-wrap">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className="flex-shrink-0 px-4 py-1.5 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
                            style={
                                activeCategory === cat
                                    ? { background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }
                                    : { background: "transparent", color: "#8A8A8A", border: "1px solid #C8C4BF" }
                            }
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Products Grid ──────────────────────────────────────── */}
            <section className="py-16">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {filtered.map((deal) => (
                            <div
                                key={deal.id}
                                className="group overflow-hidden"
                                style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}
                            >
                                {/* Visual panel */}
                                <div
                                    className="relative h-52 flex items-end p-4 ease-out duration-500 group-hover:scale-[1.02]"
                                    style={{ background: deal.gradient }}
                                >
                                    {/* Discount tag */}
                                    <div className="absolute top-4 left-4">
                                        <span
                                            className="block text-[9px] font-light tracking-[0.2em] uppercase px-2 py-0.5"
                                            style={{ background: "#F6F5F2", color: "#0A0A0A" }}
                                        >
                                            -{deal.discountPct}%
                                        </span>
                                        {deal.tag && (
                                            <span
                                                className="block text-[9px] font-light tracking-[0.15em] uppercase px-2 py-0.5 mt-1"
                                                style={{ background: "rgba(246,245,242,0.15)", color: "rgba(246,245,242,0.7)", border: "1px solid rgba(246,245,242,0.2)" }}
                                            >
                                                {deal.tag}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <p
                                        className="text-[10px] font-light tracking-[0.1em] uppercase mb-1"
                                        style={{ color: "#8A8A8A" }}
                                    >
                                        {deal.brand} · {deal.category}
                                    </p>
                                    <h3
                                        className="font-light text-sm text-dark mb-3 line-clamp-2"
                                        style={{ letterSpacing: "0.01em" }}
                                    >
                                        {deal.name}
                                    </h3>

                                    <div className="flex items-center gap-2.5 mb-4">
                                        <span className="text-lg font-light text-dark" style={{ letterSpacing: "-0.02em" }}>
                                            ${deal.salePrice}
                                        </span>
                                        <span
                                            className="text-sm font-light line-through"
                                            style={{ color: "#C8C4BF" }}
                                        >
                                            ${deal.originalPrice}
                                        </span>
                                    </div>

                                    <a
                                        href={deal.affiliateLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full py-2.5 text-center text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
                                        style={{ background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#2C2C2C"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0A0A0A"; }}
                                    >
                                        Shop Now
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div
                            className="text-center py-16 text-sm font-light"
                            style={{ color: "#8A8A8A" }}
                        >
                            No deals in this category — check back soon.
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
