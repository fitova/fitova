"use client";
import React from "react";
import Link from "next/link";
import { tracking } from "@/lib/queries/tracking";

type ProductImage = { url: string; type: string; sort_order: number };

type Product = {
    id: string;
    name: string;
    slug: string;
    price: number;
    discounted_price?: number | null;
    brand?: string | null;
    piece_type?: string | null;
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
    colors?: string[];
    cover_image?: string;
};

type Props = {
    collection: Collection;
    products: Product[];
};

export default function LookbookDetailClient({ collection, products }: Props) {
    return (
        <main style={{ background: "#F6F5F2", minHeight: "100vh" }}>
            {/* ── Hero ──────────────────────────── */}
            <section
                className="relative flex flex-col items-center justify-center text-center py-20 px-4"
                style={{
                    background: collection.cover_image
                        ? undefined
                        : "#0A0A0A",
                    backgroundImage: collection.cover_image
                        ? `url(${collection.cover_image})`
                        : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />

                <div className="relative z-10">
                    <Link
                        href="/lookbook"
                        className="inline-flex items-center gap-1.5 text-xs font-light tracking-[0.15em] uppercase mb-6 ease-out duration-200"
                        style={{ color: "rgba(246,245,242,0.5)" }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Back to Lookbook
                    </Link>

                    {collection.tag && (
                        <span
                            className="block text-[10px] font-light tracking-[0.3em] uppercase mb-4"
                            style={{ color: "rgba(246,245,242,0.5)" }}
                        >
                            {collection.tag === "AI" ? "AI Generated" : collection.tag}
                        </span>
                    )}

                    <h1
                        className="font-playfair text-4xl md:text-5xl font-normal mb-4"
                        style={{ color: "#F6F5F2", letterSpacing: "-0.02em" }}
                    >
                        {collection.name}
                    </h1>

                    {collection.description && (
                        <p
                            className="text-sm font-light max-w-md leading-relaxed mb-6"
                            style={{ color: "rgba(246,245,242,0.6)" }}
                        >
                            {collection.description}
                        </p>
                    )}

                    {/* Style tags */}
                    {collection.styles && collection.styles.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2">
                            {collection.styles.map((s) => (
                                <span
                                    key={s}
                                    className="text-[10px] font-light tracking-[0.1em] uppercase px-3 py-1"
                                    style={{ border: "1px solid rgba(246,245,242,0.3)", color: "rgba(246,245,242,0.6)" }}
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Products Grid ─────────────────── */}
            <section className="py-16">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
                    {/* Header */}
                    <div className="flex items-baseline justify-between mb-10">
                        <div>
                            <p
                                className="text-xs font-light tracking-[0.2em] uppercase mb-1"
                                style={{ color: "#8A8A8A" }}
                            >
                                Shop The Look
                            </p>
                            <h2
                                className="font-playfair text-2xl font-normal"
                                style={{ color: "#0A0A0A" }}
                            >
                                {products.length} {products.length === 1 ? "Item" : "Items"} in this Collection
                            </h2>
                        </div>
                    </div>

                    {products.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="font-playfair text-xl text-dark mb-2">No products yet</p>
                            <p className="text-sm font-light text-dark-4">
                                Products from this collection will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => {
                                const thumbnail = product.product_images
                                    ?.find((img) => img.type === "thumbnail") ||
                                    product.product_images?.[0];

                                const hasDiscount =
                                    product.discounted_price != null &&
                                    product.discounted_price < product.price;

                                const discountPct = hasDiscount
                                    ? Math.round(
                                        ((product.price - product.discounted_price!) /
                                            product.price) *
                                        100
                                    )
                                    : null;

                                return (
                                    <div
                                        key={product.id}
                                        className="group"
                                        style={{ border: "1px solid #E8E4DF", background: "#FFFFFF" }}
                                    >
                                        {/* Image */}
                                        <div
                                            className="relative overflow-hidden"
                                            style={{ aspectRatio: "3/4", background: "#F0EDE8" }}
                                        >
                                            {thumbnail ? (
                                                <img
                                                    src={thumbnail.url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover ease-out duration-500 group-hover:scale-[1.04]"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: "#C8C4BF" }}>
                                                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                                        <path d="M3 9l4-4 4 4 4-6 4 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Discount badge */}
                                            {discountPct && (
                                                <div
                                                    className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-medium tracking-wide"
                                                    style={{ background: "#0A0A0A", color: "#F6F5F2" }}
                                                >
                                                    −{discountPct}%
                                                </div>
                                            )}

                                            {/* Deal tag */}
                                            {product.deal_tag && (
                                                <div
                                                    className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-light tracking-wide"
                                                    style={{ background: "#C0392B", color: "#FFFFFF" }}
                                                >
                                                    {product.deal_tag}
                                                </div>
                                            )}
                                        </div>

                                        {/* Body */}
                                        <div className="p-4">
                                            {product.brand && (
                                                <p className="text-[10px] font-light tracking-[0.15em] uppercase mb-1" style={{ color: "#8A8A8A" }}>
                                                    {product.brand}
                                                </p>
                                            )}
                                            <h3 className="text-sm font-light leading-snug mb-3" style={{ color: "#0A0A0A" }}>
                                                {product.name}
                                            </h3>

                                            {/* Price */}
                                            <div className="flex items-center gap-2 mb-4">
                                                {hasDiscount ? (
                                                    <>
                                                        <span className="text-sm font-medium" style={{ color: "#0A0A0A" }}>
                                                            ${product.discounted_price!.toFixed(2)}
                                                        </span>
                                                        <span className="text-xs font-light line-through" style={{ color: "#C8C4BF" }}>
                                                            ${product.price.toFixed(2)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm font-medium" style={{ color: "#0A0A0A" }}>
                                                        ${product.price.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Shop button */}
                                            <a
                                                href={product.affiliate_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full py-2.5 text-center text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
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
                                                    (e.currentTarget as HTMLElement).style.background = "#2C2C2C";
                                                }}
                                                onMouseLeave={(e) => {
                                                    (e.currentTarget as HTMLElement).style.background = "#0A0A0A";
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
