"use client";
import React, { useState } from "react";
import Link from "next/link";
import { CategoryWithChildren } from "@/lib/queries/categories";
import { STATIC_CATEGORIES, groupChildren, AnyChild } from "./MegaMenu";

export default function MobileMegaMenu({ categories, onClose }: { categories: CategoryWithChildren[], onClose: () => void }) {
    const [openIndex, setOpenIndex] = useState<number | string | null>(null);

    const toggle = (i: number | string) => {
        setOpenIndex(openIndex === i ? null : i);
    };

    const source = categories?.length > 0 ? categories : STATIC_CATEGORIES;

    return (
        <div className="flex flex-col">
            {/* Home */}
            <div className="border-b border-[#F0EDE8] px-5">
                <Link
                    href="/"
                    onClick={onClose}
                    className="w-full flex items-center justify-between py-3 text-sm font-light text-[#0A0A0A]"
                >
                    Home
                </Link>
            </div>

            {/* This Week */}
            <div className="border-b border-[#F0EDE8] px-5">
                <button
                    onClick={() => toggle('this_week')}
                    className="w-full flex items-center justify-between py-3 text-sm font-light text-[#0A0A0A]"
                >
                    This Week
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8C8C8" strokeWidth="1.5" className={`transition-transform duration-200 ${openIndex === 'this_week' ? "rotate-90" : ""}`}>
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
                {openIndex === 'this_week' && (
                    <div className="pb-3 pl-3 flex flex-col gap-2 animate-in slide-in-from-top-1 fade-in duration-200">
                        <Link href="/this-week" onClick={onClose} className="text-xs font-medium text-dark underline mb-2">View All This Week</Link>

                        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#8A8A8A] mt-1">Collections</p>
                        <Link href="/this-week/trending" onClick={onClose} className="text-xs font-light text-[#4A4A4A] pl-2">Trending</Link>
                        <Link href="/this-week/best-sellers" onClick={onClose} className="text-xs font-light text-[#4A4A4A] pl-2">Best Sellers</Link>
                        <Link href="/this-week/new-arrivals" onClick={onClose} className="text-xs font-light text-[#4A4A4A] pl-2">New Arrivals</Link>

                        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#8A8A8A] mt-2">Personal</p>
                        <Link href="/this-week/recently-viewed" onClick={onClose} className="text-xs font-light text-[#4A4A4A] pl-2">Recently Viewed</Link>
                    </div>
                )}
            </div>

            {source.map((cat, i) => {
                const isOpen = openIndex === i;
                const { clothing, footwear, perfumes, accessories } = groupChildren(cat.children as AnyChild[]);
                const genderRaw = Array.isArray(cat.gender) ? cat.gender[0] : (cat.gender as string | null);
                const genderSlug = genderRaw ?? cat.slug ?? "";
                const isKids = genderSlug === "kids";
                const cols = [
                    { label: "Clothing", items: clothing },
                    { label: "Footwear", items: footwear },
                    { label: "Accessories", items: accessories },
                    ...(!isKids ? [{ label: "Fragrances", items: perfumes }] : []),
                ].filter(c => c.items.length > 0);

                return (
                    <div key={cat.id} className="border-b border-[#F0EDE8] px-5">
                        <button
                            onClick={() => toggle(i)}
                            className="w-full flex items-center justify-between py-3 text-sm font-light text-[#0A0A0A]"
                        >
                            {cat.name}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8C8C8" strokeWidth="1.5" className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}>
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                        {isOpen && (
                            <div className="pb-3 pl-3 animate-in slide-in-from-top-1 fade-in duration-200">
                                <Link
                                    href={`/outfits?gender=${genderSlug}`}
                                    onClick={onClose}
                                    className="block text-xs font-medium text-dark mb-3 underline"
                                >
                                    View All {cat.name}
                                </Link>
                                {cols.map(col => (
                                    <div key={col.label} className="mb-3">
                                        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#8A8A8A] mb-1">{col.label}</p>
                                        <div className="flex flex-col gap-1.5 pl-2">
                                            {col.items.map(sub => (
                                                <Link
                                                    key={sub.id}
                                                    href={`/outfits?gender=${genderSlug}&category=${sub.slug ?? sub.id}`}
                                                    onClick={onClose}
                                                    className="text-xs font-light text-[#4A4A4A]"
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
