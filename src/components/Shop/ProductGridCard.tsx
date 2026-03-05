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

    const handleAddToCart = () => {
        dispatch(addItemToCart({ ...item, id: item.id, quantity: 1 }));
        tracking.trackCartEvent(item.id, user?.id, "add");
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleWishlist = async () => {
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
            <div className="relative overflow-hidden rounded-lg bg-[#F6F5F2] aspect-[3/4] mb-3">

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
                        onClick={() => { openModal(); dispatch(updateQuickView({ ...item })); }}
                        className="w-9 h-9 rounded bg-white/90 backdrop-blur-sm flex items-center justify-center"
                        aria-label="Quick view"
                    >
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M8 5.5C6.619 5.5 5.5 6.619 5.5 8S6.619 10.5 8 10.5 10.5 9.381 10.5 8 9.381 5.5 8 5.5zm-1.5 2.5a1.5 1.5 0 013 0 1.5 1.5 0 01-3 0z" fill="#1a1a1a" /><path fillRule="evenodd" clipRule="evenodd" d="M8 2.167C5 2.167 2.964 3.969 1.787 5.498l-.021.028c-.266.345-.511.663-.677 1.04C.91 6.969.833 7.408.833 8s.077 1.031.256 1.434c.166.377.411.695.677 1.04l.021.027C2.964 12.031 5 13.833 8 13.833c3 0 5.036-1.802 6.213-3.332l.021-.027c.266-.345.511-.663.678-1.04.178-.403.255-.842.255-1.434s-.077-1.031-.255-1.434c-.167-.377-.412-.695-.678-1.04l-.021-.028C13.036 3.97 11 2.167 8 2.167z" fill="#1a1a1a" /></svg>
                    </button>
                </div>
            </div>

            {/* ── Text info ── */}
            <div>
                <Link href={`/shop-details/${item.slug ?? item.id}`} className="block">
                    <p className="text-[11px] text-[#8A8A8A] font-light uppercase tracking-wider mb-1">
                        {item.brand ?? ""}
                    </p>
                    <h3 className="text-sm font-medium text-dark truncate hover:opacity-60 transition-opacity duration-200 mb-1.5">
                        {item.title}
                    </h3>
                </Link>
                <div className="flex items-center gap-2">
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
