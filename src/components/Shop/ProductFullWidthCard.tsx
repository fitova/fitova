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
import { Product } from "@/types/product";

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

    const thumb = item.imgs?.thumbnails?.[0] ?? item.imgs?.previews?.[0] ?? "/images/products/product-1-bg-1.png";
    const hover = item.imgs?.previews?.[1] ?? item.imgs?.previews?.[0] ?? thumb;

    const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;
    const discountPct = hasDiscount
        ? Math.round(((item.price - item.discountedPrice!) / item.price) * 100)
        : 0;

    const swatches = (item.colors ?? []).slice(0, 6);
    const tags = (item.tags ?? []).slice(0, 4);

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
        <div className="group flex gap-5 border-b border-[#E8E4DF] py-5 last:border-b-0 hover:bg-[#FAF9F7] transition-colors duration-200 rounded-lg px-3 cursor-pointer">
            {/* Image */}
            <Link href={`/products/${item.slug ?? item.id}`} className="relative flex-shrink-0 w-36 sm:w-44 rounded-lg overflow-hidden bg-[#F6F5F2]" style={{ aspectRatio: "3/4" }}>
                <Image src={thumb} alt={item.title} fill className="object-cover transition-transform duration-500 ease-out group-hover:-translate-x-full" sizes="176px" loading="lazy" />
                <Image src={hover} alt={item.title} fill className="object-cover absolute inset-0 translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0" sizes="176px" loading="lazy" />
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
                            {item.brand && (
                                <p className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-light mb-0.5">{item.brand}</p>
                            )}
                            <Link href={`/products/${item.slug ?? item.id}`}>
                                <h3 className="font-medium text-dark text-sm sm:text-base hover:opacity-60 transition-opacity truncate">{item.title}</h3>
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
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="#ef4444"><path d="M8 13.4s-6.3-4-6.3-7.5C1.7 3.6 3.2 2 5 2c1 0 2.1.6 3 1.7C8.9 2.6 10 2 11 2c1.8 0 3.3 1.6 3.3 3.9C14.3 9.4 8 13.4 8 13.4z" /></svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946Z" fill="#1a1a1a" /></svg>
                            )}
                        </button>
                    </div>

                    {/* Unified Tags Row */}
                    {(item.gender || item.piece_type || swatches.length > 0) && (
                        <div className="flex flex-wrap items-center gap-2 mb-3 mt-1">
                            {item.gender && (
                                <span className="text-[10px] uppercase text-[#8A8A8A] font-medium tracking-wider">
                                    {item.gender}
                                </span>
                            )}
                            {(item.gender && item.piece_type) && <span className="text-[#8A8A8A] text-xs">|</span>}
                            {item.piece_type && (
                                <span className="text-[10px] uppercase text-[#8A8A8A] font-medium tracking-wider">
                                    {item.piece_type.toLowerCase() === "long-sleeve-shirt" ? "L/S Shirt" :
                                        item.piece_type.toLowerCase() === "short-sleeve-shirt" ? "S/S Shirt" :
                                            item.piece_type.replace(/-/g, ' ')}
                                </span>
                            )}

                            {((item.gender || item.piece_type) && swatches.length > 0) && <span className="text-[#8A8A8A] text-xs ml-1 mr-1">|</span>}

                            {swatches.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    {swatches.map((c, i) => (
                                        <span key={i} className={`flex items-center gap-1.5 ${i === 0 ? 'mr-1' : ''}`}>
                                            <ColorSwatch color={c} />
                                            {i === 0 && <span className="text-[10px] uppercase text-[#8A8A8A] font-medium tracking-wider leading-none">{c}</span>}
                                        </span>
                                    ))}
                                    {(item.colors?.length ?? 0) > 6 && (
                                        <span className="text-[10px] text-[#8A8A8A] leading-none ml-1">+{(item.colors?.length ?? 0) - 6}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Price + Actions */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        {hasDiscount ? (
                            <>
                                <span className="text-base font-semibold text-dark">${item.discountedPrice}</span>
                                <span className="text-xs text-[#8A8A8A] line-through">${item.price}</span>
                                <span className="text-[10px] text-emerald-600 font-medium">Save {discountPct}%</span>
                            </>
                        ) : (
                            <span className="text-base font-semibold text-dark">${item.price}</span>
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
