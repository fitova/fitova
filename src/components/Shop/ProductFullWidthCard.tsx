"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { useCurrentUser } from "@/app/context/AuthContext";
import { tracking } from "@/lib/queries/tracking";
import { Product, mapProductFromDB } from "@/types/product";

const PRESET_COLORS: Record<string, string> = {
    black: "#1a1a1a", white: "#f5f5f5", beige: "#d4b896",
    navy: "#1e2a4a", grey: "#9ca3af", gray: "#9ca3af",
    brown: "#92400e", red: "#ef4444", blue: "#3b82f6",
    green: "#16a34a", pink: "#ec4899", purple: "#9333ea",
    yellow: "#facc15", orange: "#f97316",
};

const ColorSwatch = ({ color }: { color: string }) => {
    const hex = PRESET_COLORS[color.toLowerCase()] ?? "#ccc";
    return (
        <span
            className="inline-block w-3.5 h-3.5 rounded-full border border-[#E0DDD8] flex-shrink-0"
            style={{ background: hex }}
            title={color}
        />
    );
};

const ProductFullWidthCard = ({ item }: { item: Product }) => {
    const { openModal } = useModalContext();
    const { user } = useCurrentUser();
    const dispatch = useDispatch<AppDispatch>();

    const [wishlistAnimating, setWishlistAnimating] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    const isInWishlist = useSelector((state: RootState) =>
        state.wishlistReducer.items.some((w) => w.id === item.id)
    );

    const mapped = item.imgs ? item : mapProductFromDB(item as any);

    const thumb = mapped.imgs?.thumbnails?.[0] ?? mapped.imgs?.previews?.[0] ?? "/images/products/product-1-bg-1.png";
    const hover = mapped.imgs?.previews?.[1] ?? mapped.imgs?.previews?.[0] ?? thumb;

    const hasDiscount = mapped.discountedPrice && mapped.discountedPrice < mapped.price;
    const discountPct = hasDiscount && mapped.price > 0
        ? Math.round(((mapped.price - mapped.discountedPrice!) / mapped.price) * 100)
        : 0;

    const swatches = (mapped.colors ?? []).slice(0, 6);
    const tags = (mapped.tags ?? []).slice(0, 4);

    const handleAddToCart = (e?: React.MouseEvent) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        dispatch(addItemToCart({ ...item, id: item.id, quantity: 1 }));
        tracking.trackCartEvent(item.id, user?.id, "add");
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleWishlist = async (e?: React.MouseEvent) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        setWishlistAnimating(true);
        setTimeout(() => setWishlistAnimating(false), 400);
        if (isInWishlist) {
            dispatch(removeItemFromWishlist({ item_id: String(item.id), item_type: "product" }));
            try { const { removeFromWishlist } = await import("@/lib/queries/wishlist"); await removeFromWishlist(String(item.id), "product"); } catch { }
        } else {
            dispatch(addItemToWishlist({ id: String(item.id), item_id: String(item.id), item_type: "product", created_at: new Date().toISOString(), title: item.title, price: item.price, discountedPrice: item.discountedPrice, imageUrl: thumb }));
            try { const { addToWishlist } = await import("@/lib/queries/wishlist"); await addToWishlist(String(item.id), "product"); } catch { }
        }
    };

    return (
        <div className="group flex gap-5 border-b border-[#E8E4DF] py-5 last:border-b-0 hover:bg-[#FAF9F7] transition-colors duration-200 px-3 cursor-pointer">
            {/* Image */}
            <Link href={`/products/${mapped.slug ?? mapped.id}`} scroll={false} className="relative flex-shrink-0 w-36 sm:w-44 overflow-hidden bg-[#F6F5F2]" style={{ aspectRatio: "3/4" }}>
                <Image src={thumb} alt={mapped.title} fill className="object-cover transition-transform duration-500 ease-out group-hover:-translate-x-full" sizes="176px" loading="lazy" />
                <Image src={hover} alt={mapped.title} fill className="object-cover absolute inset-0 translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0" sizes="176px" loading="lazy" />
                {discountPct > 0 && (
                    <span className="absolute top-2 left-2 bg-dark text-white text-[10px] font-medium px-2 py-0.5 rounded z-10">
                        -{discountPct}%
                    </span>
                )}
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                            {mapped.brand && (
                                <p className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-light mb-0.5">{mapped.brand}</p>
                            )}
                            <Link href={`/products/${mapped.slug ?? mapped.id}`} scroll={false}>
                                <h3 className="font-medium text-dark text-sm sm:text-base hover:opacity-60 transition-opacity truncate">{mapped.title}</h3>
                            </Link>
                        </div>
                        {/* Wishlist */}
                        <button
                            onClick={handleWishlist}
                            aria-label="Wishlist"
                            className="flex-shrink-0 w-8 h-8 rounded-full border border-[#E8E4DF] flex items-center justify-center transition-all duration-300"
                            style={{ transform: wishlistAnimating ? "scale(1.3)" : "scale(1)" }}
                        >
                            {isInWishlist ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="none"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                            )}
                        </button>
                    </div>

                    {/* Unified Tags Row */}
                    {(mapped.gender || mapped.piece_type || swatches.length > 0) && (
                        <div className="flex flex-wrap items-center gap-2 mb-3 mt-1">
                            {mapped.gender && (
                                <span className="text-[10px] uppercase text-[#8A8A8A] font-medium tracking-wider">
                                    {mapped.gender}
                                </span>
                            )}
                            {(mapped.gender && mapped.piece_type) && <span className="text-[#8A8A8A] text-xs">|</span>}
                            {mapped.piece_type && (
                                <span className="text-[10px] uppercase text-[#8A8A8A] font-medium tracking-wider">
                                    {mapped.piece_type.toLowerCase() === "long-sleeve-shirt" ? "L/S Shirt" :
                                        mapped.piece_type.toLowerCase() === "short-sleeve-shirt" ? "S/S Shirt" :
                                            mapped.piece_type.replace(/-/g, ' ')}
                                </span>
                            )}

                            {((mapped.gender || mapped.piece_type) && swatches.length > 0) && <span className="text-[#8A8A8A] text-xs ml-1 mr-1">|</span>}

                            {swatches.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    {swatches.map((c, i) => (
                                        <span key={i} className={`flex items-center gap-1.5 ${i === 0 ? 'mr-1' : ''}`}>
                                            <ColorSwatch color={c} />
                                            {i === 0 && <span className="text-[10px] uppercase text-[#8A8A8A] font-medium tracking-wider leading-none">{c}</span>}
                                        </span>
                                    ))}
                                    {(mapped.colors?.length ?? 0) > 6 && (
                                        <span className="text-[10px] text-[#8A8A8A] leading-none ml-1">+{(mapped.colors?.length ?? 0) - 6}</span>
                                    )}
                                </div>
                            )}

                            {(mapped.tags && mapped.tags.length > 0) && <span className="text-[#8A8A8A] text-xs ml-1 mr-1">|</span>}
                            {(mapped.tags || []).slice(0, 4).map((tag, i) => (
                                <span key={i} className="text-[10px] bg-[#E8E4DF] px-1.5 py-0.5 mt-0.5 rounded text-[#4A4A4A] tracking-wider uppercase font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price + Actions */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 font-medium text-lg">
                        {hasDiscount ? (
                            <>
                                <span className="text-dark">${mapped.discountedPrice}</span>
                                <span className="text-dark-4 line-through">${mapped.price}</span>
                                <span className="text-[10px] text-emerald-600 font-medium ml-1">Save {discountPct}%</span>
                            </>
                        ) : (
                            <span className="text-dark">${mapped.price}</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { openModal(); dispatch(updateQuickView({ ...item })); }}
                            className="text-[11px] border border-[#E8E4DF] text-dark px-3 py-1.5 rounded hover:bg-[#F0EDE8] transition-colors duration-200"
                        >
                            Quick View
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className="text-[11px] px-4 py-1.5 rounded text-white font-medium transition-all duration-200"
                            style={{ background: addedToCart ? "#16a34a" : "#0A0A0A" }}
                        >
                            {addedToCart ? "✓ Added" : "Add to Cart"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ProductFullWidthCard);
