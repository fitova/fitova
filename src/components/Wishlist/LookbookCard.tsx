"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { removeItemFromWishlist, type WishlistEntry } from "@/redux/features/wishlist-slice";
import { removeFromWishlist } from "@/lib/queries/wishlist";

const LookbookCard = ({ item }: { item: WishlistEntry }) => {
    const dispatch = useDispatch<AppDispatch>();

    const coverImage = item.coverImage ?? null;
    const slug = item.collectionSlug ?? "";

    const handleRemove = async () => {
        dispatch(removeItemFromWishlist({ item_id: item.item_id, item_type: "lookbook" }));
        try {
            await removeFromWishlist(item.item_id, "lookbook");
        } catch {
            // ignore
        }
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

            {/* Cover image */}
            <Link href={`/collections/${slug}`} className="block overflow-hidden">
                <div
                    className="relative w-full overflow-hidden"
                    style={{
                        aspectRatio: "3 / 4",
                        backgroundColor: "#1A1A1A",
                    }}
                >
                    {coverImage ? (
                        <Image
                            src={coverImage}
                            alt={item.collectionName ?? "Look"}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        /* editorial gradient fallback */
                        <div
                            className="absolute inset-0"
                            style={{
                                background: "linear-gradient(135deg, #1A1A1A 0%, #3A3A3A 50%, #2A2A2A 100%)",
                            }}
                        />
                    )}

                    {/* "Look" badge */}
                    <div className="absolute bottom-3 left-3">
                        <span
                            className="text-[10px] font-light tracking-[0.2em] uppercase px-2.5 py-1"
                            style={{ backgroundColor: "rgba(246,245,242,0.9)", color: "#0A0A0A" }}
                        >
                            Curated Look
                        </span>
                    </div>
                </div>
            </Link>

            {/* Info */}
            <div className="pt-4 pb-2 flex flex-col gap-3">
                <Link href={`/collections/${slug}`}>
                    <h3 className="text-sm font-light text-dark leading-snug hover:opacity-60 transition-opacity duration-200 line-clamp-2">
                        {item.collectionName ?? "Curated Look"}
                    </h3>
                </Link>

                <Link
                    href={`/collections/${slug}`}
                    className="w-full text-center text-xs font-light tracking-[0.15em] uppercase py-3 border border-dark text-dark hover:bg-dark hover:text-white transition-all duration-300 mt-1"
                >
                    View Look →
                </Link>
            </div>
        </div>
    );
};

export default LookbookCard;
