"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { removeItemFromWishlist, type WishlistEntry } from "@/redux/features/wishlist-slice";
import { removeFromWishlist } from "@/lib/queries/wishlist";
import { addItemToCart } from "@/redux/features/cart-slice";

const ProductCard = ({ item }: { item: WishlistEntry }) => {
    const dispatch = useDispatch<AppDispatch>();

    const imageUrl = item.imageUrl ?? "/images/products/product-1-bg-1.png";
    const price = item.discountedPrice ?? item.price ?? 0;

    const handleRemove = async () => {
        // Optimistic
        dispatch(removeItemFromWishlist({ item_id: item.item_id, item_type: "product" }));
        try {
            await removeFromWishlist(item.item_id, "product");
        } catch {
            // Could re-add if needed — for now just ignore (UI already updated)
        }
    };

    const handleAddToCart = () => {
        dispatch(addItemToCart({
            id: item.item_id,
            title: item.title ?? "",
            price: item.price ?? 0,
            discountedPrice: item.discountedPrice ?? item.price ?? 0,
            quantity: 1,
            imgs: { thumbnails: [imageUrl], previews: [imageUrl] },
        }));
    };

    return (
        <div className="group relative flex flex-col" style={{ backgroundColor: "#F6F5F2" }}>
            {/* Remove button */}
            <button
                onClick={handleRemove}
                aria-label="Remove from wishlist"
                className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
                style={{ borderRadius: "2px" }}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>

            {/* Product image */}
            <Link href={`/shop-details/${item.item_id}`} className="block overflow-hidden">
                <div className="relative w-full" style={{ aspectRatio: "3 / 4", backgroundColor: "#E8E4DF" }}>
                    <Image
                        src={imageUrl}
                        alt={item.title ?? "Product"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/products/product-1-bg-1.png";
                        }}
                    />
                </div>
            </Link>

            {/* Product info */}
            <div className="pt-4 pb-2 flex flex-col gap-3">
                {item.brand && (
                    <span className="text-[10px] font-light tracking-[0.2em] uppercase" style={{ color: "#8A8A8A" }}>
                        {item.brand}
                    </span>
                )}
                <Link href={`/shop-details/${item.item_id}`}>
                    <h3 className="text-sm font-light text-dark leading-snug hover:opacity-60 transition-opacity duration-200 line-clamp-2">
                        {item.title}
                    </h3>
                </Link>
                <p className="text-sm font-medium text-dark">${price.toFixed(2)}</p>

                {/* Add to Bag */}
                <button
                    onClick={handleAddToCart}
                    className="w-full text-xs font-light tracking-[0.15em] uppercase py-3 border border-dark text-dark hover:bg-dark hover:text-white transition-all duration-300 mt-1"
                >
                    Add to Bag
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
