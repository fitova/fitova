"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCollections, Collection } from "@/lib/queries/collections";

const FALLBACK_GRADIENTS = [
    "linear-gradient(135deg, #0A0A0A 0%, #2C2C2C 100%)",
    "linear-gradient(135deg, #2C1810 0%, #7A4028 100%)",
    "linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)",
    "linear-gradient(135deg, #1A1A1A 0%, #404040 100%)",
];

const LookbookPreview = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getCollections(4)
            .then((data) => setCollections(data))
            .catch(() => setCollections([]))
            .finally(() => setLoaded(true));
    }, []);

    // Don't render until data is ready — avoid scroll observer timing issue
    if (!loaded) return null;
    if (collections.length === 0) return null;

    return (
        <section className="py-20" style={{ borderBottom: "1px solid #E8E4DF" }}>
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">

                {/* Section header */}
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <span
                            className="flex items-center gap-2.5 text-xs font-light tracking-[0.25em] uppercase mb-3"
                            style={{ color: "#8A8A8A" }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" stroke="#8A8A8A" strokeWidth="1.5" />
                                <rect x="14" y="3" width="7" height="7" stroke="#8A8A8A" strokeWidth="1.5" />
                                <rect x="3" y="14" width="7" height="7" stroke="#8A8A8A" strokeWidth="1.5" />
                                <rect x="14" y="14" width="7" height="7" stroke="#8A8A8A" strokeWidth="1.5" />
                            </svg>
                            Lookbook
                        </span>
                        <h2
                            className="font-playfair font-normal text-3xl xl:text-4xl text-dark"
                            style={{ letterSpacing: "-0.02em" }}
                        >
                            Curated Collections
                        </h2>
                    </div>
                    <Link
                        href="/lookbook"
                        className="hidden sm:inline-flex items-center gap-2 font-light text-xs tracking-[0.15em] uppercase border border-dark text-dark px-6 py-2.5 ease-out duration-300 hover:bg-dark hover:text-white"
                    >
                        View All
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>

                {/* Collections grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {collections.map((col, i) => (
                        <Link
                            key={col.id}
                            href="/lookbook"
                            className="group relative overflow-hidden block"
                        >
                            {/* Image or gradient */}
                            <div
                                className="h-72 w-full relative overflow-hidden"
                                style={{
                                    background: col.cover_image
                                        ? undefined
                                        : FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length],
                                    backgroundColor: col.cover_image ? "#1A1A1A" : undefined,
                                }}
                            >
                                {col.cover_image && (
                                    <Image
                                        src={col.cover_image}
                                        alt={col.name}
                                        fill
                                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                )}
                            </div>

                            {/* Text overlay */}
                            <div
                                className="absolute inset-0 flex flex-col justify-end p-5"
                                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)" }}
                            >
                                {col.tag && (
                                    <span
                                        className="block text-[9px] font-light tracking-[0.25em] uppercase mb-1.5"
                                        style={{ color: "rgba(246,245,242,0.55)" }}
                                    >
                                        {col.generated_by_ai ? "AI Curated" : col.tag}
                                    </span>
                                )}
                                <h3
                                    className="font-playfair text-base font-normal group-hover:opacity-80 transition-opacity duration-200"
                                    style={{ color: "#F6F5F2" }}
                                >
                                    {col.name}
                                </h3>
                            </div>

                            {/* Border hover */}
                            <div className="absolute inset-0 border border-white/0 ease-out duration-300 group-hover:border-white/20" />
                        </Link>
                    ))}
                </div>

                {/* Mobile view all */}
                <div className="text-center mt-8 sm:hidden">
                    <Link
                        href="/lookbook"
                        className="inline-flex items-center gap-2 font-light text-xs tracking-[0.15em] uppercase border border-dark text-dark px-8 py-3 ease-out duration-300 hover:bg-dark hover:text-white"
                    >
                        View All Looks
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default LookbookPreview;
