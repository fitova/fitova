"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCollections, Collection } from "@/lib/queries/collections";

/* ─── Skeleton card ─────────────────────────────────────────── */
const SkeletonCard = () => (
    <div className="animate-pulse block overflow-hidden" aria-hidden="true">
        <div className="aspect-[3/4] w-full bg-[#E8E4DF]" />
        <div className="p-3">
            <div className="h-2.5 w-1/3 bg-[#E8E4DF] rounded mb-2" />
            <div className="h-3 w-2/3 bg-[#E8E4DF] rounded" />
        </div>
    </div>
);

/* ─── Creator badge ──────────────────────────────────────────── */
const CreatorBadge = ({ creator }: { creator: Collection["creator"] }) => {
    if (!creator?.full_name) return null;
    return (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2 py-1 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.45)", borderRadius: 2 }}
        >
            {creator.avatar_url ? (
                <img
                    src={creator.avatar_url}
                    alt={creator.full_name}
                    className="w-5 h-5 rounded-full object-cover"
                />
            ) : (
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium"
                    style={{ background: "#2C2C2C", color: "#F6F5F2" }}
                >
                    {creator.full_name.charAt(0).toUpperCase()}
                </div>
            )}
            <span className="text-[10px] font-light tracking-wide" style={{ color: "rgba(246,245,242,0.85)" }}>
                {creator.full_name}
            </span>
        </div>
    );
};

const LookbookPreview = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getCollections(4)
            .then((data) => setCollections(data))
            .catch(() => setCollections([]))
            .finally(() => setLoaded(true));
    }, []);

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
                    {!loaded
                        ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                        : collections.map((col, i) => (
                            <Link
                                key={col.id}
                                href={`/lookbook/${col.slug}`}
                                className="group relative overflow-hidden block"
                            >
                                {/* Creator badge */}
                                <CreatorBadge creator={col.creator} />

                                {/* Image or gradient bg */}
                                <div
                                    className="aspect-[3/4] w-full relative overflow-hidden"
                                    style={{
                                        background: col.cover_image
                                            ? undefined
                                            : [
                                                "linear-gradient(135deg, #0A0A0A 0%, #2C2C2C 100%)",
                                                "linear-gradient(135deg, #2C1810 0%, #7A4028 100%)",
                                                "linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)",
                                                "linear-gradient(135deg, #1A1A1A 0%, #404040 100%)",
                                            ][i % 4],
                                    }}
                                >
                                    {col.cover_image && (
                                        <Image
                                            src={col.cover_image}
                                            alt={col.name}
                                            fill
                                            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                                        />
                                    )}
                                </div>

                                {/* Text overlay at bottom */}
                                <div
                                    className="absolute inset-0 flex flex-col justify-end p-5"
                                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)" }}
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
                                <div className="absolute inset-0 border border-white/0 ease-out duration-300 group-hover:border-white/30" />
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
