"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CategoryWithChildren } from "@/lib/queries/categories";

interface MegaMenuProps {
    categories: CategoryWithChildren[];
    stickyMenu?: boolean;
}

/**
 * MegaMenu — shows on hover over Men/Women/Kids categories.
 * Splits subcategories into two columns:
 *   Left: Clothing (tshirt, shirt, jacket, pants, top, skirt, dress)
 *   Right: Footwear & More (shoes, accessories, perfume)
 */
const CLOTHING_TYPES = ["tshirt", "shirt", "jacket", "pants", "top", "skirt", "dress", "blouse"];
const FOOTWEAR_TYPES = ["shoes", "accessories", "perfume", "bag", "belt"];

const MegaMenu = ({ categories, stickyMenu }: MegaMenuProps) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = (i: number) => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setActiveIndex(i);
    };

    const handleMouseLeave = () => {
        closeTimer.current = setTimeout(() => setActiveIndex(null), 150);
    };

    useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

    if (!categories || categories.length === 0) return null;

    return (
        <>
            {categories.map((cat, i) => {
                const isOpen = activeIndex === i;
                const clothing = cat.children.filter(
                    (c) => c.piece_type && CLOTHING_TYPES.includes(c.piece_type)
                );
                const footwear = cat.children.filter(
                    (c) => c.piece_type && FOOTWEAR_TYPES.includes(c.piece_type)
                );
                // Items without piece_type go to a "More" bucket
                const other = cat.children.filter(
                    (c) => !c.piece_type || (!CLOTHING_TYPES.includes(c.piece_type) && !FOOTWEAR_TYPES.includes(c.piece_type))
                );

                return (
                    <li
                        key={cat.id}
                        className="group relative before:w-0 before:h-[2px] before:bg-dark before:absolute before:left-0 before:top-0 before:rounded-b-[2px] before:ease-out before:duration-200 hover:before:w-full"
                        onMouseEnter={() => handleMouseEnter(i)}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Parent label */}
                        <button
                            aria-haspopup="true"
                            aria-expanded={isOpen}
                            className={`flex items-center gap-1 text-custom-sm font-light tracking-wide text-dark hover:text-dark-2 ${stickyMenu ? "xl:py-4" : "xl:py-6"}`}
                        >
                            {cat.name}
                            <svg
                                width="10"
                                height="6"
                                viewBox="0 0 10 6"
                                fill="none"
                                className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            >
                                <path
                                    d="M1 1L5 5L9 1"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        {/* Mega dropdown panel */}
                        <div
                            aria-hidden={!isOpen}
                            className={`absolute left-0 top-full w-[480px] bg-white border border-[#E8E4DF] shadow-lg z-50 transition-all duration-200 ease-out ${isOpen
                                ? "opacity-100 translate-y-0 pointer-events-auto"
                                : "opacity-0 -translate-y-2 pointer-events-none"
                                }`}
                        >
                            <div className="p-6 grid grid-cols-2 gap-8">
                                {/* Column 1: Clothing */}
                                <div>
                                    <p className="text-[10px] font-light tracking-[0.3em] uppercase mb-4" style={{ color: "#8A8A8A" }}>
                                        Clothing
                                    </p>
                                    <ul className="flex flex-col gap-2">
                                        {clothing.map((sub) => (
                                            <li key={sub.id}>
                                                <Link
                                                    href={`/shop-with-sidebar?category=${sub.slug}`}
                                                    className="text-sm font-light text-dark hover:opacity-50 transition-opacity duration-200"
                                                    onClick={() => setActiveIndex(null)}
                                                >
                                                    {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                        {other.map((sub) => (
                                            <li key={sub.id}>
                                                <Link
                                                    href={`/shop-with-sidebar?category=${sub.slug}`}
                                                    className="text-sm font-light text-dark hover:opacity-50 transition-opacity duration-200"
                                                    onClick={() => setActiveIndex(null)}
                                                >
                                                    {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Column 2: Footwear & More */}
                                <div>
                                    <p className="text-[10px] font-light tracking-[0.3em] uppercase mb-4" style={{ color: "#8A8A8A" }}>
                                        Footwear & More
                                    </p>
                                    <ul className="flex flex-col gap-2">
                                        {footwear.map((sub) => (
                                            <li key={sub.id}>
                                                <Link
                                                    href={`/shop-with-sidebar?category=${sub.slug}`}
                                                    className="text-sm font-light text-dark hover:opacity-50 transition-opacity duration-200"
                                                    onClick={() => setActiveIndex(null)}
                                                >
                                                    {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* View All link */}
                                    <Link
                                        href={`/shop-with-sidebar?gender=${cat.slug}`}
                                        className="inline-block mt-6 text-[10px] font-light tracking-[0.2em] uppercase border-b border-dark pb-0.5 text-dark hover:opacity-50 transition-opacity duration-200"
                                        onClick={() => setActiveIndex(null)}
                                    >
                                        View All {cat.name}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </li>
                );
            })}
        </>
    );
};

export default MegaMenu;
