"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { tracking } from "@/lib/queries/tracking";
import { useCurrentUser } from "@/app/context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const QuickViewModal = () => {
  const { isModalOpen, closeModal } = useModalContext();
  const router = useRouter();
  const { user } = useCurrentUser();
  const dispatch = useDispatch<AppDispatch>();
  const product = useAppSelector((state) => state.quickViewReducer.value);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlistAnimating, setWishlistAnimating] = useState(false);

  const isInWishlist = useSelector((state: RootState) =>
    state.wishlistReducer.items.some((w) => w.id === product?.id)
  );

  // Reset state when modal opens with new product
  useEffect(() => {
    if (isModalOpen) {
      setQuantity(1);
      setActiveImage(0);
      setAddedToCart(false);
      // Lock body scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen, product?.id]);

  // ESC key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (isModalOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isModalOpen, closeModal]);

  const handleImageClick = useCallback(() => {
    const slug = product?.slug ?? product?.id;
    if (slug) {
      closeModal();
      router.push(`/products/${slug}`);
    }
  }, [product, closeModal, router]);

  const handleAddToCart = () => {
    dispatch(addItemToCart({ ...product, id: product.id as unknown as string, quantity }));
    tracking.trackCartEvent(product.id as string, user?.id, "add");
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

  const handleWishlist = async () => {
    setWishlistAnimating(true);
    setTimeout(() => setWishlistAnimating(false), 400);
    const itemId = String(product.id);
    const thumb = product.imgs?.thumbnails?.[0] ?? product.imgs?.previews?.[0] ?? "";
    if (isInWishlist) {
      dispatch(removeItemFromWishlist({ item_id: itemId, item_type: "product" }));
      try { const { removeFromWishlist } = await import("@/lib/queries/wishlist"); await removeFromWishlist(itemId, "product"); } catch { }
    } else {
      dispatch(addItemToWishlist({ id: itemId, item_id: itemId, item_type: "product", created_at: new Date().toISOString(), title: product.title, price: product.price, discountedPrice: product.discountedPrice, imageUrl: thumb }));
      try { const { addToWishlist } = await import("@/lib/queries/wishlist"); await addToWishlist(itemId, "product"); } catch { }
    }
  };

  if (!isModalOpen || !product) return null;

  const images = product.imgs?.previews ?? product.imgs?.thumbnails ?? [];
  const currentImage = images[activeImage] ?? "/images/products/product-1-bg-1.png";
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountedPrice!) / product.price) * 100)
    : 0;

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeModal}
      />

      {/* ── Modal ─────────────────────────────────────── */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-[960px] max-h-[90vh] overflow-y-auto no-scrollbar bg-white rounded-sm shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={closeModal}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col sm:flex-row">
            {/* ── LEFT: Image Gallery ─────────────────── */}
            <div className="sm:w-[55%] flex-shrink-0">
              {/* Main Image — click to navigate */}
              <div
                onClick={handleImageClick}
                className="relative aspect-[3/4] bg-[#F6F5F2] cursor-pointer group overflow-hidden"
              >
                <Image
                  src={currentImage}
                  alt={product?.title || (product as any)?.name || "Product Image"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 100vw, 55vw"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs tracking-[0.2em] uppercase bg-black/50 backdrop-blur-sm px-4 py-2">
                    View Full Details →
                  </span>
                </div>
                {/* Discount badge */}
                {discountPct > 0 && (
                  <span className="absolute top-3 left-3 bg-[#0A0A0A] text-white text-[10px] font-medium px-2.5 py-1 tracking-wider uppercase">
                    -{discountPct}%
                  </span>
                )}
              </div>

              {/* Thumbnail row */}
              {images.length > 1 && (
                <div className="flex gap-1.5 p-3 overflow-x-auto no-scrollbar">
                  {images.slice(0, 6).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 w-16 h-20 relative overflow-hidden transition-all duration-200 ${activeImage === i
                        ? "ring-2 ring-[#0A0A0A] ring-offset-1"
                        : "opacity-50 hover:opacity-80"
                        }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Product Info ──────────────────── */}
            <div className="sm:w-[45%] p-6 sm:p-8 flex flex-col justify-between">
              <div>
                {/* Brand */}
                {product.brand && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8A8A8A] font-light mb-1">
                    {product.brand}
                  </p>
                )}

                {/* Title */}
                <h2 className="text-lg sm:text-xl font-medium text-[#0A0A0A] mb-3 leading-snug">
                  {product.title}
                </h2>

                {/* Tags */}
                {(product.gender || product.piece_type) && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {product.gender && (
                      <span className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#8A8A8A] border border-[#E8E4DF] px-2 py-0.5">
                        {product.gender}
                      </span>
                    )}
                    {product.piece_type && (
                      <span className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#8A8A8A] border border-[#E8E4DF] px-2 py-0.5">
                        {product.piece_type}
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2.5 mb-5">
                  {hasDiscount ? (
                    <>
                      <span className="text-2xl font-semibold text-[#0A0A0A]">
                        ${product.discountedPrice}
                      </span>
                      <span className="text-base text-[#8A8A8A] line-through">
                        ${product.price}
                      </span>
                      <span className="text-xs text-emerald-600 font-medium">
                        Save {discountPct}%
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-semibold text-[#0A0A0A]">
                      ${product.price}
                    </span>
                  )}
                </div>

                {/* Description (real, not Lorem Ipsum) */}
                {product.description && (
                  <p className="text-sm text-[#6B6B6B] font-light leading-relaxed mb-5 line-clamp-3">
                    {product.description}
                  </p>
                )}

                {/* Color swatches */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-2">
                      Colors
                    </p>
                    <div className="flex gap-2">
                      {product.colors.slice(0, 6).map((c, i) => (
                        <span
                          key={i}
                          className="w-6 h-6 rounded-full border border-[#E0DDD8]"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {product.size && product.size.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-2">
                      Size
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.size.map((s, i) => (
                        <span
                          key={i}
                          className="text-xs border border-[#E8E4DF] px-3 py-1.5 text-[#4A4A4A] hover:border-[#0A0A0A] hover:text-[#0A0A0A] cursor-pointer transition-colors"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Bottom: Quantity + Actions ─────────── */}
              <div>
                {/* Quantity */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A]">
                    Qty
                  </span>
                  <div className="flex items-center border border-[#E8E4DF]">
                    <button
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors"
                    >
                      <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
                        <path d="M0 1h12" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                    <span className="w-10 h-9 flex items-center justify-center text-sm font-medium text-[#0A0A0A] border-x border-[#E8E4DF]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 text-sm font-medium tracking-wide text-white transition-all duration-200"
                    style={{ background: addedToCart ? "#16a34a" : "#0A0A0A" }}
                  >
                    {addedToCart ? "✓ Added to Cart" : "Add to Cart"}
                  </button>
                  <button
                    onClick={handleWishlist}
                    aria-label="Wishlist"
                    className="w-12 h-12 flex items-center justify-center border border-[#E8E4DF] hover:border-[#0A0A0A] transition-all duration-300"
                    style={{ transform: wishlistAnimating ? "scale(1.15)" : "scale(1)" }}
                  >
                    {isInWishlist ? (
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="#ef4444"><path d="M8 13.4s-6.3-4-6.3-7.5C1.7 3.6 3.2 2 5 2c1 0 2.1.6 3 1.7C8.9 2.6 10 2 11 2c1.8 0 3.3 1.6 3.3 3.9C14.3 9.4 8 13.4 8 13.4z" /></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946Z" fill="#1a1a1a" /></svg>
                    )}
                  </button>
                </div>

                {/* View full page link */}
                <button
                  onClick={handleImageClick}
                  className="w-full mt-3 py-2.5 text-xs tracking-[0.15em] uppercase text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors border border-[#E8E4DF] hover:border-[#0A0A0A]"
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickViewModal;
