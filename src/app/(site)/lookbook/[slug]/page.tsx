"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getLookbookBySlug, Lookbook, LookbookProduct } from "@/lib/queries/lookbooks";
import { tracking } from "@/lib/queries/tracking";
import ProductGridCard from "@/components/Shop/ProductGridCard";
export default function LookbookDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = React.use(params);
    const [lookbook, setLookbook] = useState<Lookbook | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getLookbookBySlug(slug);
                setLookbook(data);
                const prods = data.lookbook_products
                    .map((cp) => cp.products)
                    .filter(Boolean);
                setProducts(prods);
                setLoading(false);
            } catch (err) {
                setNotFound(true);
                setLoading(false);
            }
        }
        fetchData();
    }, [slug]);

    /* ── Loading ─────────────────────────────────────── */
    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 bg-[#F6F5F2]">
                <div className="text-center">
                    <div className="w-8 h-8 rounded-full animate-spin mx-auto mb-4 border border-[#E8E4DF] border-t-[#0A0A0A]" />
                    <p className="text-sm font-light tracking-[0.1em] text-[#8A8A8A]">
                        Loading lookbook...
                    </p>
                </div>
            </main>
        );
    }

    /* ── Not found ───────────────────────────────────── */
    if (notFound || !lookbook) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 bg-[#F6F5F2]">
                <div className="text-center">
                    <h1 className="font-playfair text-3xl mb-4 text-[#0A0A0A]">
                        Lookbook not found
                    </h1>
                    <Link href="/lookbook" className="text-sm font-light tracking-[0.1em] underline text-[#8A8A8A]">
                        ← Back to Lookbooks
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-[#F6F5F2] min-h-screen">
            {/* ── Hero ─────────────────────────────────────── */}
            <section className="relative overflow-hidden min-h-[420px]">
                {/* Background image or dark fallback */}
                {lookbook.cover_image ? (
                    <img
                        src={lookbook.cover_image}
                        alt={lookbook.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: "brightness(0.55)" }}
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[#0A0A0A]" />
                )}

                {/* Gradient overlay for readability */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)",
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-end h-full min-h-[420px] max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 pb-12 pt-24">
                    {/* Back link */}
                    <Link
                        href="/lookbook"
                        className="inline-flex items-center gap-2 text-[11px] font-light tracking-[0.2em] uppercase mb-8 w-fit"
                        style={{ color: "rgba(246,245,242,0.55)" }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M19 12H5M12 5l-7 7 7 7"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                        Lookbooks
                    </Link>

                    {/* Tag */}
                    {lookbook.tag && (
                        <span
                            className="block text-[10px] font-light tracking-[0.35em] uppercase mb-3"
                            style={{ color: "rgba(246,245,242,0.5)" }}
                        >
                            {lookbook.tag === "AI" ? "AI Generated" : lookbook.tag}
                        </span>
                    )}

                    {/* Title */}
                    <h1
                        className="font-playfair text-4xl sm:text-5xl md:text-6xl font-normal mb-4"
                        style={{ color: "#F6F5F2", letterSpacing: "-0.03em", lineHeight: 1.1 }}
                    >
                        {lookbook.title}
                    </h1>

                    {/* Description */}
                    {lookbook.description && (
                        <p
                            className="text-sm font-light leading-relaxed max-w-lg mb-6"
                            style={{ color: "rgba(246,245,242,0.65)" }}
                        >
                            {lookbook.description}
                        </p>
                    )}

                    {/* Style tags */}
                    {lookbook.tags && lookbook.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {lookbook.tags.map((s) => (
                                <span
                                    key={s}
                                    className="text-[10px] font-light tracking-[0.12em] uppercase px-3 py-1.5"
                                    style={{
                                        border: "1px solid rgba(246,245,242,0.25)",
                                        color: "rgba(246,245,242,0.65)",
                                    }}
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Products ─────────────────────────────────── */}
            <section className="py-16">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
                    {/* Section header */}
                    <div
                        className="flex items-center justify-between pb-8 mb-10 border-b border-[#E8E4DF]"
                    >
                        <div>
                            <p className="text-[10px] font-light tracking-[0.25em] uppercase mb-1 text-[#8A8A8A]">
                                Shop The Look
                            </p>
                            <h2 className="font-playfair text-2xl font-normal text-[#0A0A0A]">
                                {products.length} {products.length === 1 ? "Item" : "Items"} in this Lookbook
                            </h2>
                        </div>
                        <Link
                            href="/lookbook"
                            className="hidden sm:inline-flex items-center gap-2 text-xs font-light tracking-[0.1em] uppercase py-2.5 px-5 border border-[#C8C4BF] text-[#6A6A6A] ease-out duration-200"
                        >
                            ← All Lookbooks
                        </Link>
                    </div>

                    {/* Products grid */}
                    {products.length === 0 ? (
                        <div className="text-center py-24 border border-[#E8E4DF]">
                            <p className="font-playfair text-2xl mb-3 text-[#0A0A0A]">
                                No products yet
                            </p>
                            <p className="text-sm font-light text-[#8A8A8A]">
                                Products from this lookbook will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {products.map((product) => (
                                <ProductGridCard key={product.id} item={product as any} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
