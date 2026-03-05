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

const ProductGridCard = ({ item }: { item: Product }) => {
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
        <div className="group relative flex flex-col">
            {/* ── Image container ── */}
            <Link href={`/products/${item.slug ?? item.id}`} scroll={false} className="relative overflow-hidden rounded-lg bg-[#F6F5F2] aspect-[3/4] mb-3 block">

                {/* Slide-in second image from the right on hover */}
                <Image
                    src={thumb}
                    alt={item.title}
                    fill
                    sizes="(max-width:640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:-translate-x-full"
                    loading="lazy"
                />
                <Image
                    src={hover}
                    alt={item.title}
                    fill
                    sizes="(max-width:640px) 50vw, 25vw"
                    className="object-cover absolute inset-0 translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0"
                    loading="lazy"
                />

                {/* Discount badge */}
                {discountPct > 0 && (
                    <span className="absolute top-2.5 left-2.5 z-10 bg-dark text-white text-[10px] font-medium px-2 py-0.5 rounded">
                        -{discountPct}%
                    </span>
                )}

                {/* Wishlist button always visible top-right */}
                <button
                    onClick={handleWishlist}
                    aria-label="Wishlist"
                    className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-300"
                    style={{ transform: wishlistAnimating ? "scale(1.3)" : "scale(1)" }}
                >
                    {isInWishlist ? (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="#ef4444"><path d="M8 13.4s-6.3-4-6.3-7.5C1.7 3.6 3.2 2 5 2c1 0 2.1.6 3 1.7C8.9 2.6 10 2 11 2c1.8 0 3.3 1.6 3.3 3.9C14.3 9.4 8 13.4 8 13.4z" /></svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946Z" fill="#1a1a1a" /></svg>
                    )}
                </button>

                {/* Bottom quick actions (slide up on hover) */}
                <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 py-2 text-[11px] font-medium tracking-wide rounded text-white transition-all duration-200"
                        style={{ background: addedToCart ? "#16a34a" : "#0A0A0A" }}
                    >
                        {addedToCart ? "✓ Added" : "Add to Cart"}
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openModal(); dispatch(updateQuickView({ ...item })); }}
                        className="w-9 h-9 rounded bg-white/90 backdrop-blur-sm flex items-center justify-center text-dark hover:bg-white transition-colors"
                        aria-label="Quick view"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                </div>
            </Link>

            {/* ── Text info ── */}
            <div>
                <Link href={`/products/${item.slug ?? item.id}`} className="block">
                    {/* Tags line injected right below brand name or integrated if brand exists */}
                    {item.brand ? (
                        <p className="text-[11px] text-[#8A8A8A] font-light uppercase tracking-wider mb-1 truncate">
                            {item.brand}
                            {(item.gender || item.piece_type || (item.colors && item.colors.length > 0)) && (
                                <span className="inline-flex items-center gap-1.5 ml-1.5 normal-case font-normal text-[11px] md:text-xs">
                                    ·
                                    {item.gender && (
                                        <span className="capitalize">{item.gender}</span>
                                    )}
                                    {(item.gender && item.piece_type) && <span>·</span>}
                                    {item.piece_type && (
                                        <span className="capitalize">
                                            {item.piece_type.toLowerCase() === "long-sleeve-shirt" ? "L/S Shirt" :
                                                item.piece_type.toLowerCase() === "short-sleeve-shirt" ? "S/S Shirt" :
                                                    item.piece_type.replace(/-/g, ' ')}
                                        </span>
                                    )}
                                    {((item.gender || item.piece_type) && item.colors && item.colors[0]) && <span>·</span>}
                                    {item.colors && item.colors[0] && (
                                        <span className="flex items-center gap-1 capitalize">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full border border-[#E8E4DF]"
                                                style={{
                                                    backgroundColor: item.colors[0].toLowerCase() === 'black' ? '#1a1a1a' :
                                                        item.colors[0].toLowerCase() === 'white' ? '#f5f5f5' :
                                                            item.colors[0].toLowerCase() === 'beige' ? '#d4b896' :
                                                                item.colors[0].toLowerCase() === 'navy' ? '#1e2a4a' :
                                                                    item.colors[0].toLowerCase() === 'grey' || item.colors[0].toLowerCase() === 'gray' ? '#9ca3af' :
                                                                        item.colors[0].toLowerCase() === 'brown' ? '#92400e' :
                                                                            item.colors[0].toLowerCase() === 'red' ? '#ef4444' :
                                                                                item.colors[0].toLowerCase() === 'blue' ? '#3b82f6' :
                                                                                    item.colors[0].toLowerCase() === 'green' ? '#16a34a' :
                                                                                        item.colors[0].toLowerCase() === 'pink' ? '#ec4899' :
                                                                                            item.colors[0].toLowerCase() === 'purple' ? '#9333ea' :
                                                                                                item.colors[0].toLowerCase() === 'yellow' ? '#facc15' :
                                                                                                    item.colors[0].toLowerCase() === 'orange' ? '#f97316' : '#ccc'
                                                }}
                                            />
                                            {item.colors[0]}
                                        </span>
                                    )}
                                </span>
                            )}
                        </p>
                    ) : (
                        <div className="text-[11px] md:text-xs text-[#8A8A8A] font-light mb-1 truncate flex items-center gap-1.5">
                            {item.gender && (
                                <span className="capitalize">{item.gender}</span>
                            )}
                            {(item.gender && item.piece_type) && <span>·</span>}
                            {item.piece_type && (
                                <span className="capitalize">
                                    {item.piece_type.toLowerCase() === "long-sleeve-shirt" ? "L/S Shirt" :
                                        item.piece_type.toLowerCase() === "short-sleeve-shirt" ? "S/S Shirt" :
                                            item.piece_type.replace(/-/g, ' ')}
                                </span>
                            )}
                            {((item.gender || item.piece_type) && item.colors && item.colors[0]) && <span>·</span>}
                            {item.colors && item.colors[0] && (
                                <span className="flex items-center gap-1 capitalize">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full border border-[#E8E4DF]"
                                        style={{
                                            backgroundColor: item.colors[0].toLowerCase() === 'black' ? '#1a1a1a' :
                                                item.colors[0].toLowerCase() === 'white' ? '#f5f5f5' :
                                                    item.colors[0].toLowerCase() === 'beige' ? '#d4b896' :
                                                        item.colors[0].toLowerCase() === 'navy' ? '#1e2a4a' :
                                                            item.colors[0].toLowerCase() === 'grey' || item.colors[0].toLowerCase() === 'gray' ? '#9ca3af' :
                                                                item.colors[0].toLowerCase() === 'brown' ? '#92400e' :
                                                                    item.colors[0].toLowerCase() === 'red' ? '#ef4444' :
                                                                        item.colors[0].toLowerCase() === 'blue' ? '#3b82f6' :
                                                                            item.colors[0].toLowerCase() === 'green' ? '#16a34a' :
                                                                                item.colors[0].toLowerCase() === 'pink' ? '#ec4899' :
                                                                                    item.colors[0].toLowerCase() === 'purple' ? '#9333ea' :
                                                                                        item.colors[0].toLowerCase() === 'yellow' ? '#facc15' :
                                                                                            item.colors[0].toLowerCase() === 'orange' ? '#f97316' : '#ccc'
                                        }}
                                    />
                                    {item.colors[0]}
                                </span>
                            )}
                        </div>
                    )}
                    <h3 className="text-sm font-medium text-dark truncate hover:opacity-60 transition-opacity duration-200 mb-1.5">
                        {item.title}
                    </h3>
                </Link>
                <div className="flex items-center gap-2 mb-2">
                    {hasDiscount ? (
                        <>
                            <span className="text-sm font-semibold text-dark">${item.discountedPrice}</span>
                            <span className="text-xs text-[#8A8A8A] line-through">${item.price}</span>
                        </>
                    ) : (
                        <span className="text-sm font-semibold text-dark">${item.price}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(ProductGridCard);
