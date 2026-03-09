"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import PageCoverHeader from "@/components/Common/PageCoverHeader";
import { getProducts, Product } from "@/lib/queries/products";
import { mapProductFromDB } from "@/types/product";

// ─── Countdown helper ────────────────────────────────────────────────────────
function useCountdown(endDate: string) {
    const calc = useCallback(() => {
        const delta = Math.max(0, new Date(endDate).getTime() - Date.now());
        const d = Math.floor(delta / 86400000);
        const h = Math.floor((delta % 86400000) / 3600000);
        const m = Math.floor((delta % 3600000) / 60000);
        const s = Math.floor((delta % 60000) / 1000);
        return { d, h, m, s, expired: delta === 0 };
    }, [endDate]);

    const [time, setTime] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    }, [calc]);
    return time;
}

// ─── Deal Card ───────────────────────────────────────────────────────────────
const DealCard = ({ item }: { item: Product & { product_images?: { url: string; type: string; sort_order: number }[] } }) => {
    const dispatch = useDispatch<AppDispatch>();
    const isInWishlist = useSelector((state: RootState) =>
        state.wishlistReducer.items.some((w) => w.id === String(item.id))
    );
    const [animating, setAnimating] = useState(false);

    const mapped = (item as any).imgs ? item as any : mapProductFromDB(item as any);
    const thumb = mapped.imgs?.previews?.[0] ?? "/images/products/product-1-bg-1.png";

    const hasDiscount = item.discounted_price && item.discounted_price < item.price;
    const discountPct = hasDiscount
        ? Math.round(((item.price - item.discounted_price!) / item.price) * 100)
        : 0;

    const handleWishlist = async () => {
        setAnimating(true);
        setTimeout(() => setAnimating(false), 400);
        if (isInWishlist) {
            dispatch(removeItemFromWishlist({ item_id: String(item.id), item_type: "product" }));
            try { const { removeFromWishlist } = await import("@/lib/queries/wishlist"); await removeFromWishlist(String(item.id), "product"); } catch { }
        } else {
            dispatch(addItemToWishlist({ id: String(item.id), item_id: String(item.id), item_type: "product", created_at: new Date().toISOString(), title: item.name, price: item.price, discountedPrice: item.discounted_price ?? undefined, imageUrl: thumb }));
            try { const { addToWishlist } = await import("@/lib/queries/wishlist"); await addToWishlist(String(item.id), "product"); } catch { }
        }
    };

    return (
        <div className="group bg-white border border-[#E8E4DF] overflow-hidden hover:shadow-md transition-shadow duration-300">
            {/* Image */}
            <div className="relative overflow-hidden bg-[#F6F5F2]" style={{ aspectRatio: "4/3" }}>
                <Image
                    src={thumb}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width:640px) 100vw, 300px"
                    loading="lazy"
                />
                {/* Discount badge */}
                {discountPct > 0 && (
                    <span className="absolute top-3 left-3 bg-[#0A0A0A] text-white text-[10px] font-medium tracking-wider px-2.5 py-1">
                        -{discountPct}%
                    </span>
                )}
                {/* Deal tag badge */}
                {item.deal_tag && (
                    <span className="absolute top-3 right-3 text-[9px] font-light tracking-[0.15em] uppercase px-2 py-0.5"
                        style={{ background: "rgba(0,0,0,0.6)", color: "#F6F5F2", backdropFilter: "blur(4px)" }}>
                        {item.deal_tag}
                    </span>
                )}
                {/* Wishlist button */}
                <button
                    onClick={handleWishlist}
                    aria-label="Wishlist"
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
                    style={{ transform: animating ? "scale(1.3)" : "scale(1)" }}
                >
                    {isInWishlist ? (
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="#ef4444"><path d="M8 13.4s-6.3-4-6.3-7.5C1.7 3.6 3.2 2 5 2c1 0 2.1.6 3 1.7C8.9 2.6 10 2 11 2c1.8 0 3.3 1.6 3.3 3.9C14.3 9.4 8 13.4 8 13.4z" /></svg>
                    ) : (
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C6.28395 12.2146 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C10.3058 11.7564 11.142 11.1118 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946Z" fill="#1a1a1a" /></svg>
                    )}
                </button>
            </div>

            {/* Info */}
            <div className="p-4">
                {item.brand && (
                    <p className="text-[10px] font-light tracking-[0.2em] uppercase text-[#8A8A8A] mb-1">{item.brand}</p>
                )}
                <h3 className="font-light text-sm text-dark line-clamp-2 mb-3 leading-snug">{item.name}</h3>

                <div className="flex items-center gap-2.5 mb-4">
                    <span className="text-lg font-light text-dark" style={{ letterSpacing: "-0.02em" }}>
                        ${hasDiscount ? item.discounted_price : item.price}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm font-light line-through text-[#C8C4BF]">${item.price}</span>
                    )}
                </div>

                <Link
                    href={item.affiliate_link ?? `/products/${item.slug ?? item.id}`}
                    target={item.affiliate_link ? "_blank" : undefined}
                    rel={item.affiliate_link ? "noopener noreferrer" : undefined}
                    className="block w-full py-2.5 text-center text-xs font-light tracking-[0.15em] uppercase transition-colors duration-200 bg-[#0A0A0A] text-white hover:bg-[#2C2C2C]"
                >
                    Shop Now
                </Link>
            </div>
        </div>
    );
};

// ─── Main Deals page ─────────────────────────────────────────────────────────
const DEAL_CATEGORIES = ["All", "T-Shirts", "Shirts", "Pants", "Jackets", "Shoes", "Accessories"];

export default function Deals() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Promo deal end date for hero countdown
    const countdown = useCountdown("2026-12-31T23:59:59");

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const data = await getProducts({ isDeal: true, limit: 24 });
                setProducts(data);
            } catch {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = activeCategory === "All" ? products : products.filter(p =>
        (p.piece_type ?? "").toLowerCase().includes(activeCategory.toLowerCase()) ||
        (p.tags ?? []).some((t: string) => t.toLowerCase().includes(activeCategory.toLowerCase()))
    );

    return (
        <main style={{ background: "#F6F5F2" }}>
            <PageCoverHeader
                title="Deals & Offers"
                preTitle="Limited Time Offers"
                subtitle="Handpicked discounts from top fashion brands — updated daily."
                breadcrumbPages={["deals"]}
            >
                {/* Countdown */}
                {!countdown.expired && (
                    <div className="flex items-center justify-center gap-3">
                        {[
                            { label: "Days", val: countdown.d },
                            { label: "Hours", val: countdown.h },
                            { label: "Mins", val: countdown.m },
                            { label: "Secs", val: countdown.s },
                        ].map(({ label, val }, i) => (
                            <React.Fragment key={label}>
                                <div className="flex flex-col items-center">
                                    <span className="font-playfair text-3xl font-normal text-white"
                                        style={{ letterSpacing: "-0.04em", minWidth: "2ch", textAlign: "center" }}>
                                        {String(val).padStart(2, "0")}
                                    </span>
                                    <span className="text-[9px] tracking-[0.2em] uppercase mt-1"
                                        style={{ color: "rgba(246,245,242,0.35)" }}>
                                        {label}
                                    </span>
                                </div>
                                {i < 3 && <span className="font-playfair text-2xl text-white/30 mb-4">:</span>}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </PageCoverHeader>

            {/* ── Category Filters ─────────────────────────────────── */}
            <section className="sticky top-[72px] z-10 bg-[#F6F5F2] border-b border-[#E8E4DF]">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 py-4 flex gap-2 overflow-x-auto no-scrollbar">
                    {DEAL_CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className="flex-shrink-0 px-4 py-1.5 text-xs font-light tracking-[0.12em] uppercase transition-all duration-200"
                            style={activeCategory === cat
                                ? { background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }
                                : { background: "transparent", color: "#8A8A8A", border: "1px solid #C8C4BF" }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Products Grid ──────────────────────────────────────── */}
            <section className="py-16">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="animate-pulse bg-white border border-[#E8E4DF]">
                                    <div className="aspect-[4/3] bg-[#E8E4DF]" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-2.5 bg-[#E8E4DF] rounded w-1/3" />
                                        <div className="h-3 bg-[#E8E4DF] rounded w-full" />
                                        <div className="h-3 bg-[#E8E4DF] rounded w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="font-playfair text-2xl text-[#0A0A0A] mb-2">No deals available</p>
                            <p className="text-sm font-light text-[#8A8A8A]">
                                {products.length === 0
                                    ? "Add products with \"is_deal = true\" in the database to show them here."
                                    : "No deals in this category — try another."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {filtered.map(item => (
                                <DealCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
