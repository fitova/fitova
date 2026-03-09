"use client";
import React from "react";
import Link from "next/link";
import { useWishlistModal } from "@/app/context/WishlistModalContext";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import toast from "react-hot-toast";

const WishlistModal = () => {
    const { isWishlistOpen, closeWishlistModal } = useWishlistModal();
    const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
    const dispatch = useDispatch();

    if (!isWishlistOpen) return null;

    const handleAddToCart = (item: any) => {
        dispatch(
            addItemToCart({
                ...item,
                quantity: 1,
                imgs: {
                    previews: [item.imageUrl || item.coverImage],
                    thumbnails: [item.imageUrl || item.coverImage],
                },
            })
        );
        toast.success(`${item.title} added to cart!`);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-[99998] backdrop-blur-[2px]"
                onClick={closeWishlistModal}
            />

            {/* Drawer panel */}
            <div
                className="fixed bottom-0 sm:top-0 right-0 h-[85dvh] sm:h-[100dvh] w-full sm:max-w-[400px] rounded-t-3xl sm:rounded-none z-[99999] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300"
                style={{ background: "#0A0A0A" }}
            >
                {/* ── Header ───────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-7 py-6 flex-shrink-0"
                    style={{ borderBottom: "1px solid rgba(246,245,242,0.08)" }}
                >
                    <div>
                        <h2
                            className="font-playfair text-lg font-normal tracking-wide"
                            style={{ color: "#F6F5F2" }}
                        >
                            Your Wishlist
                        </h2>
                        <p
                            className="text-xs font-light mt-0.5 tracking-[0.05em]"
                            style={{ color: "rgba(246,245,242,0.4)" }}
                        >
                            {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"} saved
                        </p>
                    </div>
                    <button
                        onClick={closeWishlistModal}
                        className="flex items-center justify-center w-8 h-8 ease-out duration-200"
                        style={{ border: "1px solid rgba(246,245,242,0.15)", color: "rgba(246,245,242,0.6)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(246,245,242,0.1)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* ── Content ───────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-5 py-5">
                    {wishlistItems.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm font-light" style={{ color: "rgba(246,245,242,0.4)" }}>
                                Your wishlist is empty.
                            </p>
                            <Link href="/shop-with-sidebar" onClick={closeWishlistModal} className="mt-4 inline-block text-xs uppercase tracking-widest text-[#F6F5F2] border-b border-transparent hover:border-[#F6F5F2] transition-colors pb-1">
                                Discover Fashion
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {wishlistItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 p-3 relative"
                                    style={{ borderBottom: "1px solid rgba(246,245,242,0.08)" }}
                                >
                                    {/* Image */}
                                    <Link
                                        href={item.item_type === 'product' ? `/products/${item.itemSlug || item.id}` : `/lookbook/${item.collectionSlug || item.id}`}
                                        onClick={closeWishlistModal}
                                        className="w-20 h-24 flex-shrink-0 overflow-hidden bg-white/5"
                                    >
                                        <img src={item.imageUrl || item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <Link
                                                    href={item.item_type === 'product' ? `/products/${item.itemSlug || item.id}` : `/lookbook/${item.collectionSlug || item.id}`}
                                                    onClick={closeWishlistModal}
                                                    className="text-sm font-light text-[#F6F5F2] hover:underline pr-2 line-clamp-2"
                                                >
                                                    {item.title}
                                                </Link>
                                                <button
                                                    onClick={() => dispatch(removeItemFromWishlist(item.id))}
                                                    className="text-white/40 hover:text-white"
                                                    aria-label="Remove"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                                </button>
                                            </div>

                                            {item.item_type === 'product' ? (
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="text-sm font-medium text-[#F6F5F2]">${item.discountedPrice || item.price}</span>
                                                    {item.discountedPrice && item.price !== item.discountedPrice && (
                                                        <span className="text-xs font-light text-white/40 line-through">${item.price}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] mt-1 inline-block">Outfit Collection</span>
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            {item.item_type === 'product' ? (
                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    className="w-full py-2 text-[10px] font-light tracking-[0.1em] uppercase border border-white/20 text-[#F6F5F2] hover:bg-white/10 transition-colors flex justify-center items-center gap-2"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="9" cy="21" r="1.5" stroke="currentColor" strokeWidth="1.5" /><circle cx="20" cy="21" r="1.5" stroke="currentColor" strokeWidth="1.5" /></svg>
                                                    Add to Cart
                                                </button>
                                            ) : (
                                                <Link
                                                    href={`/lookbook/${item.collectionSlug || item.id}`}
                                                    onClick={closeWishlistModal}
                                                    className="flex w-full py-2 text-[10px] font-light tracking-[0.1em] uppercase border border-white/20 text-[#F6F5F2] hover:bg-white/10 transition-colors justify-center items-center gap-2"
                                                >
                                                    Shop This Look
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Footer ───────────────────────────────────────── */}
                <div
                    className="px-7 py-5 flex-shrink-0"
                    style={{ borderTop: "1px solid rgba(246,245,242,0.08)" }}
                >
                    <Link
                        href="/wishlist"
                        onClick={closeWishlistModal}
                        className="w-full py-3 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200 flex items-center justify-center text-[#0A0A0A] bg-[#F6F5F2] hover:bg-[#E8E4DF]"
                    >
                        View Full Wishlist
                    </Link>
                </div>
            </div>
        </>
    );
};

export default WishlistModal;
