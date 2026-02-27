"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase/client";
import { tracking } from "@/lib/queries/tracking";

type ProductImage = { url: string; type: string; sort_order: number };

type Product = {
    id: string;
    name: string;
    slug: string;
    price: number;
    discounted_price?: number | null;
    brand?: string | null;
    affiliate_link: string;
    deal_tag?: string | null;
    product_images?: ProductImage[];
};

type Collection = {
    id: string;
    name: string;
    slug: string;
    description?: string;
    tag?: string;
    styles?: string[];
    cover_image?: string;
    collection_products?: { product_id: string; products: Product }[];
};

export default function LookbookDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = React.use(params);
    const [collection, setCollection] = useState<Collection | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        async function fetchData() {
            const { data, error } = await supabase
                .from("collections")
                .select(
                    `*, collection_products(product_id, products(*, product_images(url, type, sort_order)))`
                )
                .eq("slug", slug)
                .single();

            if (error || !data) {
                setNotFound(true);
            } else {
                setCollection(data as Collection);
                const prods = (
                    (data as Collection).collection_products || []
                )
                    .map((cp) => cp.products)
                    .filter(Boolean) as Product[];
                setProducts(prods);
            }
            setLoading(false);
        }

        fetchData();
    }, [slug]);

    /* ── Loading ─────────────────────────────────────── */
    if (loading) {
        return (
            <main
                className="min-h-screen flex items-center justify-center"
                style={{ background: "#F6F5F2" }}
            >
                <div className="text-center">
                    <div
                        className="w-8 h-8 rounded-full animate-spin mx-auto mb-4"
                        style={{ border: "1px solid #E8E4DF", borderTopColor: "#0A0A0A" }}
                    />
                    <p
                        className="text-sm font-light tracking-[0.1em]"
                        style={{ color: "#8A8A8A" }}
                    >
                        Loading collection...
                    </p>
                </div>
            </main>
        );
    }

    /* ── Not found ───────────────────────────────────── */
    if (notFound || !collection) {
        return (
            <main
                className="min-h-screen flex items-center justify-center"
                style={{ background: "#F6F5F2" }}
            >
                <div className="text-center">
                    <h1
                        className="font-playfair text-3xl mb-4"
                        style={{ color: "#0A0A0A" }}
                    >
                        Collection not found
                    </h1>
                    <Link
                        href="/lookbook"
                        className="text-sm font-light tracking-[0.1em] underline"
                        style={{ color: "#8A8A8A" }}
                    >
                        ← Back to Lookbook
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main style={{ background: "#F6F5F2", minHeight: "100vh" }}>
            {/* ── Hero ─────────────────────────────────────── */}
            <section className="relative overflow-hidden" style={{ minHeight: 420 }}>
                {/* Background image or dark fallback */}
                {collection.cover_image ? (
                    <img
                        src={collection.cover_image}
                        alt={collection.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: "brightness(0.55)" }}
                    />
                ) : (
                    <div className="absolute inset-0" style={{ background: "#0A0A0A" }} />
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
                        Lookbook
                    </Link>

                    {/* Tag */}
                    {collection.tag && (
                        <span
                            className="block text-[10px] font-light tracking-[0.35em] uppercase mb-3"
                            style={{ color: "rgba(246,245,242,0.5)" }}
                        >
                            {collection.tag === "AI" ? "AI Generated" : collection.tag}
                        </span>
                    )}

                    {/* Title */}
                    <h1
                        className="font-playfair text-4xl sm:text-5xl md:text-6xl font-normal mb-4"
                        style={{ color: "#F6F5F2", letterSpacing: "-0.03em", lineHeight: 1.1 }}
                    >
                        {collection.name}
                    </h1>

                    {/* Description */}
                    {collection.description && (
                        <p
                            className="text-sm font-light leading-relaxed max-w-lg mb-6"
                            style={{ color: "rgba(246,245,242,0.65)" }}
                        >
                            {collection.description}
                        </p>
                    )}

                    {/* Style tags */}
                    {collection.styles && collection.styles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {collection.styles.map((s) => (
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
                        className="flex items-center justify-between pb-8 mb-10"
                        style={{ borderBottom: "1px solid #E8E4DF" }}
                    >
                        <div>
                            <p
                                className="text-[10px] font-light tracking-[0.25em] uppercase mb-1"
                                style={{ color: "#8A8A8A" }}
                            >
                                Shop The Look
                            </p>
                            <h2
                                className="font-playfair text-2xl font-normal"
                                style={{ color: "#0A0A0A" }}
                            >
                                {products.length}{" "}
                                {products.length === 1 ? "Item" : "Items"} in this
                                Collection
                            </h2>
                        </div>
                        <Link
                            href="/lookbook"
                            className="hidden sm:inline-flex items-center gap-2 text-xs font-light tracking-[0.1em] uppercase py-2.5 px-5 ease-out duration-200"
                            style={{ border: "1px solid #C8C4BF", color: "#6A6A6A" }}
                        >
                            ← All Lookbooks
                        </Link>
                    </div>

                    {/* Products grid */}
                    {products.length === 0 ? (
                        <div
                            className="text-center py-24 border"
                            style={{ borderColor: "#E8E4DF" }}
                        >
                            <p
                                className="font-playfair text-2xl mb-3"
                                style={{ color: "#0A0A0A" }}
                            >
                                No products yet
                            </p>
                            <p
                                className="text-sm font-light"
                                style={{ color: "#8A8A8A" }}
                            >
                                Products from this collection will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {products.map((product) => {
                                const thumbnail =
                                    product.product_images?.find(
                                        (img) => img.type === "thumbnail"
                                    ) || product.product_images?.[0];

                                const hasDiscount =
                                    product.discounted_price != null &&
                                    product.discounted_price < product.price;

                                const discountPct = hasDiscount
                                    ? Math.round(
                                        ((product.price -
                                            product.discounted_price!) /
                                            product.price) *
                                        100
                                    )
                                    : null;

                                return (
                                    <div
                                        key={product.id}
                                        className="group flex flex-col"
                                        style={{
                                            border: "1px solid #E8E4DF",
                                            background: "#FFFFFF",
                                        }}
                                    >
                                        {/* Image */}
                                        <div
                                            className="relative w-full overflow-hidden flex-shrink-0"
                                            style={{
                                                paddingTop: "133%",
                                                background: "#F0EDE8",
                                            }}
                                        >
                                            <div className="absolute inset-0">
                                                {thumbnail ? (
                                                    <img
                                                        src={thumbnail.url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover ease-out duration-500 group-hover:scale-[1.04]"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <svg
                                                            width="28"
                                                            height="28"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            style={{ color: "#D8D4CF" }}
                                                        >
                                                            <rect
                                                                x="3"
                                                                y="3"
                                                                width="18"
                                                                height="18"
                                                                rx="2"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                            />
                                                            <path
                                                                d="M3 9l4-4 4 4 4-6 6 6"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Discount badge */}
                                            {discountPct && (
                                                <div
                                                    className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[9px] font-medium tracking-wide"
                                                    style={{
                                                        background: "#0A0A0A",
                                                        color: "#F6F5F2",
                                                    }}
                                                >
                                                    −{discountPct}%
                                                </div>
                                            )}

                                            {/* Deal badge */}
                                            {product.deal_tag && (
                                                <div
                                                    className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[9px] font-light tracking-wide"
                                                    style={{
                                                        background: "#C0392B",
                                                        color: "#FFFFFF",
                                                    }}
                                                >
                                                    {product.deal_tag}
                                                </div>
                                            )}
                                        </div>

                                        {/* Body */}
                                        <div className="p-3 sm:p-4 flex flex-col flex-1">
                                            {product.brand && (
                                                <p
                                                    className="text-[9px] sm:text-[10px] font-light tracking-[0.18em] uppercase mb-1"
                                                    style={{ color: "#A0A0A0" }}
                                                >
                                                    {product.brand}
                                                </p>
                                            )}
                                            <h3
                                                className="text-xs sm:text-sm font-light leading-snug mb-3 flex-1"
                                                style={{ color: "#1A1A1A" }}
                                            >
                                                {product.name}
                                            </h3>

                                            {/* Price */}
                                            <div className="flex items-baseline gap-2 mb-3">
                                                {hasDiscount ? (
                                                    <>
                                                        <span
                                                            className="text-sm font-medium"
                                                            style={{ color: "#0A0A0A" }}
                                                        >
                                                            $
                                                            {product.discounted_price!.toFixed(
                                                                2
                                                            )}
                                                        </span>
                                                        <span
                                                            className="text-[11px] font-light line-through"
                                                            style={{ color: "#C0BAB3" }}
                                                        >
                                                            ${product.price.toFixed(2)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span
                                                        className="text-sm font-medium"
                                                        style={{ color: "#0A0A0A" }}
                                                    >
                                                        ${product.price.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Shop button */}
                                            <a
                                                href={product.affiliate_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full py-2.5 text-center text-[10px] sm:text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
                                                onClick={() => {
                                                    if (product.id) {
                                                        tracking.trackAffiliateClick(product.id as string);
                                                    }
                                                }}
                                                style={{
                                                    background: "#0A0A0A",
                                                    color: "#F6F5F2",
                                                    border: "1px solid #0A0A0A",
                                                }}
                                                onMouseEnter={(e) => {
                                                    (
                                                        e.currentTarget as HTMLElement
                                                    ).style.background = "#2C2C2C";
                                                }}
                                                onMouseLeave={(e) => {
                                                    (
                                                        e.currentTarget as HTMLElement
                                                    ).style.background = "#0A0A0A";
                                                }}
                                            >
                                                Shop Now →
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
