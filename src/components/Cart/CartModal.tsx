"use client";
import React from "react";
import Link from "next/link";
import { useCartModal } from "@/app/context/CartModalContext";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeItemFromCart, updateCartItemQuantity } from "@/redux/features/cart-slice";

const CartModal = () => {
    const { isCartOpen, closeCartModal } = useCartModal();
    const cartItems = useAppSelector((state) => state.cartReducer.items);
    const dispatch = useDispatch();

    if (!isCartOpen) return null;

    const subtotal = cartItems.reduce((acc, item) => acc + (item.discountedPrice || item.price) * item.quantity, 0);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-[99998] backdrop-blur-[2px]"
                onClick={closeCartModal}
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
                            Shopping Cart
                        </h2>
                        <p
                            className="text-xs font-light mt-0.5 tracking-[0.05em]"
                            style={{ color: "rgba(246,245,242,0.4)" }}
                        >
                            {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
                        </p>
                    </div>
                    <button
                        onClick={closeCartModal}
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
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm font-light" style={{ color: "rgba(246,245,242,0.4)" }}>
                                Your cart is empty.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 p-3 relative"
                                    style={{ borderBottom: "1px solid rgba(246,245,242,0.08)" }}
                                >
                                    {/* Image */}
                                    <Link href={`/products/${item.id}`} onClick={closeCartModal} className="w-20 h-24 flex-shrink-0 overflow-hidden bg-white/5">
                                        <img src={item.imgs?.thumbnails[0] || item.imgs?.previews[0]} alt={item.title} className="w-full h-full object-cover" />
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                                        <div>
                                            <Link href={`/products/${item.id}`} onClick={closeCartModal} className="text-sm font-light text-[#F6F5F2] hover:underline truncate block">
                                                {item.title}
                                            </Link>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-sm font-medium text-[#F6F5F2]">${item.discountedPrice || item.price}</span>
                                                {item.discountedPrice && item.price !== item.discountedPrice && (
                                                    <span className="text-xs font-light text-white/40 line-through">${item.price}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            {/* Quantity Control */}
                                            <div className="flex items-center border border-white/10 rounded-sm">
                                                <button
                                                    onClick={() => dispatch(updateCartItemQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) }))}
                                                    className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white"
                                                >
                                                    -
                                                </button>
                                                <span className="w-6 text-center text-xs font-light text-[#F6F5F2]">{item.quantity}</span>
                                                <button
                                                    onClick={() => dispatch(updateCartItemQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                                                    className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Remove */}
                                            <button
                                                onClick={() => dispatch(removeItemFromCart(item.id))}
                                                className="text-[10px] font-light text-red-400 uppercase tracking-widest hover:text-red-300 underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Footer ───────────────────────────────────────── */}
                {cartItems.length > 0 && (
                    <div
                        className="px-7 py-5 flex-shrink-0 space-y-4"
                        style={{ borderTop: "1px solid rgba(246,245,242,0.08)" }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-light text-white/60 uppercase tracking-widest">Subtotal</span>
                            <span className="text-lg font-medium text-[#F6F5F2]">${subtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href="/cart"
                                onClick={closeCartModal}
                                className="flex-1 py-3 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200 flex items-center justify-center border text-[#F6F5F2] border-white/20 hover:border-white/60"
                            >
                                View Cart
                            </Link>
                            <Link
                                href="/checkout"
                                onClick={closeCartModal}
                                className="flex-1 py-3 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200 flex items-center justify-center text-[#0A0A0A] bg-[#F6F5F2] hover:bg-[#E8E4DF]"
                            >
                                Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartModal;
