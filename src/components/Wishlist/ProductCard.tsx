"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { removeItemFromWishlist, type WishlistEntry } from "@/redux/features/wishlist-slice";
import { removeFromWishlist } from "@/lib/queries/wishlist";
import { addItemToCart } from "@/redux/features/cart-slice";

import { updateQuickView } from "@/redux/features/quickView-slice";
import { useModalContext } from "@/app/context/QuickViewModalContext";

const ProductCard = ({ item }: { item: WishlistEntry }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { openModal } = useModalContext();

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
            <div className="relative block overflow-hidden">
                <div className="relative w-full group/image" style={{ aspectRatio: "3 / 4", backgroundColor: "#E8E4DF" }}>
                    <Link href={`/products/${item.itemSlug ?? item.item_id}`} className="block w-full h-full">
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
                    </Link>

                    {/* Quick View Button */}
                    <div className="absolute left-0 bottom-0 translate-y-full w-full flex justify-center pb-4 ease-linear duration-200 group-hover:translate-y-0 z-20">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                dispatch(updateQuickView({
                                    id: item.item_id,
                                    name: item.title ?? "",
                                    price: item.price ?? 0,
                                    discounted_price: item.discountedPrice ?? item.price ?? 0,
                                    slug: item.itemSlug ?? item.item_id,
                                    imgs: { thumbnails: [imageUrl], previews: [imageUrl] },
                                }));
                                openModal();
                            }}
                            aria-label="Quick View"
                            className="flex items-center justify-center w-8 h-8 rounded-[5px] shadow-1"
                            style={{ background: "#0A0A0A", color: "#F6F5F2" }}
                        >
                            <svg className="fill-current w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M8.00016 5.5C6.61945 5.5 5.50016 6.61929 5.50016 8C5.50016 9.38071 6.61945 10.5 8.00016 10.5C9.38087 10.5 10.5002 9.38071 10.5002 8C10.5002 6.61929 9.38087 5.5 8.00016 5.5ZM6.50016 8C6.50016 7.17157 7.17174 6.5 8.00016 6.5C8.82859 6.5 9.50016 7.17157 9.50016 8C9.50016 8.82842 8.82859 9.5 8.00016 9.5C7.17174 9.5 6.50016 8.82842 6.50016 8Z" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M8.00016 2.16666C4.99074 2.16666 2.96369 3.96946 1.78721 5.49791L1.76599 5.52546C1.49992 5.87102 1.25487 6.18928 1.08862 6.5656C0.910592 6.96858 0.833496 7.40779 0.833496 8C0.833496 8.5922 0.910592 9.03142 1.08862 9.4344C1.25487 9.81072 1.49992 10.129 1.76599 10.4745L1.78721 10.5021C2.96369 12.0305 4.99074 13.8333 8.00016 13.8333C11.0096 13.8333 13.0366 12.0305 14.2131 10.5021L14.2343 10.4745C14.5004 10.129 14.7455 9.81072 14.9117 9.4344C15.0897 9.03142 15.1668 8.5922 15.1668 8C15.1668 7.40779 15.0897 6.96858 14.9117 6.5656C14.7455 6.18927 14.5004 5.87101 14.2343 5.52545L14.2131 5.49791C13.0366 3.96946 11.0096 2.16666 8.00016 2.16666ZM2.57964 6.10786C3.66592 4.69661 5.43374 3.16666 8.00016 3.16666C10.5666 3.16666 12.3344 4.69661 13.4207 6.10786C13.7131 6.48772 13.8843 6.7147 13.997 6.9697C14.1023 7.20801 14.1668 7.49929 14.1668 8C14.1668 8.50071 14.1023 8.79199 13.997 9.0303C13.8843 9.28529 13.7131 9.51227 13.4207 9.89213C12.3344 11.3034 10.5666 12.8333 8.00016 12.8333C5.43374 12.8333 3.66592 11.3034 2.57964 9.89213C2.28725 9.51227 2.11599 9.28529 2.00334 9.0303C1.89805 8.79199 1.8335 8.50071 1.8335 8C1.8335 7.49929 1.89805 7.20801 2.00334 6.9697C2.11599 6.7147 2.28725 6.48772 2.57964 6.10786Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Product info */}
            <div className="pt-4 flex flex-col min-w-0" style={{ backgroundColor: "#F6F5F2" }}>
                {item.brand && (
                    <span className="block text-[10px] uppercase tracking-widest mb-1 truncate" style={{ color: "#8A8A8A" }}>
                        {item.brand}
                    </span>
                )}
                <Link href={`/products/${item.itemSlug ?? item.item_id}`}>
                    <h3
                        className="text-sm font-medium mb-1 truncate hover:opacity-70 transition-opacity"
                        style={{ color: "#0A0A0A" }}
                        title={item.title}
                    >
                        {item.title}
                    </h3>
                </Link>
                <p className="text-sm font-medium text-dark">${price.toFixed(2)}</p>

                <button
                    onClick={handleAddToCart}
                    className="w-full text-xs font-light tracking-[0.15em] uppercase py-3 border border-dark text-dark hover:bg-dark hover:text-white transition-all duration-300 mt-1"
                >
                    Add to Bag
                </button>
            </div>

        </div >
    );
};

export default ProductCard;
