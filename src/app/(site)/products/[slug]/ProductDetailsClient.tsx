"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
    addItemToWishlist,
    removeItemFromWishlist,
    selectIsWishlisted,
} from "@/redux/features/wishlist-slice";
import { addToWishlist, removeFromWishlist } from "@/lib/queries/wishlist";
import { addItemToCart } from "@/redux/features/cart-slice";
import { tracking } from "@/lib/queries/tracking";
import { useCurrentUser } from "@/app/context/AuthContext";
import { Product, mapProductFromDB } from "@/types/product";
import ProductItem from "@/components/Common/ProductItem";
import ProductReviews from "@/components/ShopDetails/ProductReviews";
import AddToLookbookModal from "@/components/Common/AddToLookbookModal";
import PageCoverHeader from "@/components/Common/PageCoverHeader";
import ProductTabs from "./ProductTabs";

interface Props {
    product: any; // raw DB product with product_images[]
    related: any[];
    crossSell?: any[];
}

export default function ProductDetailsClient({ product, related = [], crossSell = [] }: Props) {
    const router = useRouter();
    const { user } = useCurrentUser();
    const dispatch = useDispatch<AppDispatch>();

    const mapped = mapProductFromDB(product);

    const isWishlisted = useSelector(
        selectIsWishlisted(String(product.id), "product")
    );

    const [activeImg, setActiveImg] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [lookbookModalOpen, setLookbookModalOpen] = useState(false);

    /* ── real avg_rating from DB trigger ───────────────────────── */
    const avgRating: number = product.avg_rating ?? 0;
    const reviewCount: number = product.review_count ?? 0;

    /* ── View tracking ──────────────────────────────────────────── */
    useEffect(() => {
        tracking.trackProductView?.(product.id, user?.id);
    }, [product.id, user?.id]);

    /* ── Images ─────────────────────────────────────────────────── */
    const images: string[] = mapped.imgs?.previews?.length
        ? mapped.imgs.previews
        : ["/images/products/product-1-bg-1.png"];

    /* ── Add to cart ─────────────────────────────────────────────── */
    const handleAddToCart = () => {
        dispatch(
            addItemToCart({
                ...mapped,
                id: mapped.id as unknown as string,
                quantity: 1,
            })
        );
        tracking.trackCartEvent(product.id, user?.id, "add");
    };

    /* ── Wishlist toggle ─────────────────────────────────────────── */
    const handleWishlistToggle = async () => {
        if (!user) {
            router.push("/auth/signin");
            return;
        }
        if (isWishlisted) {
            dispatch(removeItemFromWishlist({ item_id: String(product.id), item_type: "product" }));
            try {
                await removeFromWishlist(String(product.id), "product");
            } catch {
                dispatch(addItemToWishlist({
                    id: String(product.id), item_id: String(product.id), item_type: "product",
                    created_at: new Date().toISOString(), title: mapped.title,
                    price: mapped.price, discountedPrice: mapped.discountedPrice,
                    imageUrl: images[0],
                }));
            }
        } else {
            dispatch(addItemToWishlist({
                id: String(product.id), item_id: String(product.id), item_type: "product",
                created_at: new Date().toISOString(), title: mapped.title,
                price: mapped.price, discountedPrice: mapped.discountedPrice,
                imageUrl: images[0],
            }));
            try {
                await addToWishlist(String(product.id), "product");
            } catch {
                dispatch(removeItemFromWishlist({ item_id: String(product.id), item_type: "product" }));
            }
        }
    };

    /* ── Affiliate link click ──────────────────────────────────── */
    const handleAffiliateClick = () => {
        if (!product.affiliate_link) return;
        tracking.trackAffiliateClick?.(product.id);
        window.open(product.affiliate_link, "_blank", "noopener,noreferrer");
    };

    /* ── Share ───────────────────────────────────────────────────── */
    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: mapped.title, url });
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    /* ── Related products as mapped ────────────────────────────── */
    const relatedMapped: Product[] = (related || []).map(mapProductFromDB);
    const crossSellMapped: Product[] = (crossSell || []).map(mapProductFromDB);

    return (
        <main className="bg-[#F6F5F2] min-h-screen">
            <PageCoverHeader
                title={mapped.title ?? "Product Details"}
                subtitle={mapped.description?.substring(0, 150) + ((mapped.description?.length ?? 0) > 150 ? "..." : "") || "Shop premium fashion items curated for your unique style."}
                breadcrumbPages={[
                    ...(product.categories?.name ? [product.categories.name] : ["products"]),
                    ...(mapped.brand ? [mapped.brand] : []),
                    mapped.title ?? ""
                ]}
            />

            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-16">

                {/* Main layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 xl:gap-16 mb-20">

                    {/* Left: images */}
                    <div>
                        {/* Main image */}
                        <div
                            className="relative w-full overflow-hidden mb-4 bg-[#F6F5F2]"
                            style={{ aspectRatio: "4/5" }}
                        >
                            <Image
                                src={images[activeImg]}
                                alt={mapped.title}
                                fill
                                className="object-contain object-center transition-opacity duration-300"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {images.map((src, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImg(i)}
                                        className="flex-shrink-0 w-16 h-20 relative overflow-hidden border-2 transition-colors duration-200"
                                        style={{
                                            borderColor: activeImg === i ? "#1A1A1A" : "#E8E4DF",
                                            backgroundColor: "#F6F5F2",
                                        }}
                                        aria-label={`View image ${i + 1}`}
                                    >
                                        <Image src={src} alt="" fill className="object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: product info */}
                    <div className="flex flex-col">

                        {/* Brand */}
                        {mapped.brand && (
                            <span
                                className="text-[10px] font-light tracking-[0.3em] uppercase mb-3"
                                style={{ color: "#8A8A8A" }}
                            >
                                {mapped.brand}
                            </span>
                        )}

                        {/* Product name */}
                        <h1
                            className="font-playfair font-normal text-2xl sm:text-3xl xl:text-4xl text-dark mb-4 leading-snug"
                            style={{ letterSpacing: "-0.02em" }}
                        >
                            {mapped.title}
                        </h1>

                        {/* Stars — pulled from avg_rating DB cache */}
                        <div className="flex items-center gap-2 mb-5">
                            <div className="flex items-center gap-0.5" aria-label={`${avgRating.toFixed(1)} out of 5`}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg key={star} width="14" height="14" viewBox="0 0 24 24"
                                        fill={star <= Math.round(avgRating) ? "#1A1A1A" : "none"}
                                        stroke="#1A1A1A" strokeWidth="1.5">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-xs font-light" style={{ color: "#8A8A8A" }}>
                                {reviewCount > 0 ? `(${reviewCount} ${reviewCount === 1 ? "review" : "reviews"})` : "No reviews yet"}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-playfair font-normal text-2xl text-dark">
                                ${mapped.discountedPrice}
                            </span>
                            {mapped.price !== mapped.discountedPrice && (
                                <span className="text-dark-4 line-through text-base font-light">
                                    ${mapped.price}
                                </span>
                            )}
                            {mapped.commission != null && (
                                <span
                                    className="text-[10px] font-light tracking-wide py-1 px-2"
                                    style={{ background: "#F6F5F2", color: "#8A8A8A", border: "1px solid #E8E4DF" }}
                                >
                                    {mapped.commission}% commission
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        {mapped.description && (
                            <p
                                className="text-sm font-light leading-relaxed mb-7 max-w-sm"
                                style={{ color: "#6A6A6A" }}
                            >
                                {mapped.description}
                            </p>
                        )}

                        {/* Color selector */}
                        {mapped.colors && mapped.colors.length > 0 && (
                            <div className="mb-6">
                                <h4
                                    className="text-xs font-light tracking-[0.2em] uppercase mb-3"
                                    style={{ color: "#8A8A8A" }}
                                >
                                    Color
                                    {selectedColor && (
                                        <span className="ml-2 normal-case tracking-normal capitalize text-dark">
                                            — {selectedColor}
                                        </span>
                                    )}
                                </h4>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {mapped.colors.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setSelectedColor(c)}
                                            title={c}
                                            className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${selectedColor === c
                                                ? "border-dark scale-110"
                                                : "border-transparent hover:border-dark/40"
                                                }`}
                                            style={{ backgroundColor: c.toLowerCase() }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size selector */}
                        {mapped.size && mapped.size.length > 0 && (
                            <div className="mb-8">
                                <h4
                                    className="text-xs font-light tracking-[0.2em] uppercase mb-3"
                                    style={{ color: "#8A8A8A" }}
                                >
                                    Size
                                </h4>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {mapped.size.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSize(s)}
                                            className={`px-4 py-2 text-xs font-light tracking-[0.1em] uppercase border transition-all duration-200 ${selectedSize === s
                                                ? "border-dark bg-dark text-white"
                                                : "border-[#E8E4DF] text-dark hover:border-dark"
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            {/* Shop now (affiliate) */}
                            {product.affiliate_link ? (
                                <button
                                    onClick={handleAffiliateClick}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-8 text-sm font-light tracking-[0.1em] uppercase transition-colors duration-300"
                                    style={{ background: "#1A1A1A", color: "#F6F5F2" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0A0A0A"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#1A1A1A"; }}
                                >
                                    Shop Now
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 py-3.5 px-8 text-sm font-light tracking-[0.1em] uppercase transition-colors duration-300"
                                    style={{ background: "#1A1A1A", color: "#F6F5F2" }}
                                >
                                    Add to Cart
                                </button>
                            )}

                            {/* Wishlist */}
                            <button
                                onClick={handleWishlistToggle}
                                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                className="flex items-center justify-center w-12 h-12 border transition-colors duration-200 flex-shrink-0"
                                style={{
                                    borderColor: isWishlisted ? "#1A1A1A" : "#E8E4DF",
                                    background: isWishlisted ? "#1A1A1A" : "transparent",
                                    color: isWishlisted ? "#F6F5F2" : "#1A1A1A",
                                }}
                            >
                                {isWishlisted ? (
                                    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.36520 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.26590 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946Z" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.36520 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.5935 7.99992 2.97255Z" fill="currentColor" />
                                    </svg>
                                )}
                            </button>

                            {/* Share */}
                            <button
                                onClick={handleShare}
                                aria-label="Share product"
                                className="flex items-center justify-center w-12 h-12 border border-[#E8E4DF] text-dark hover:border-dark transition-colors duration-200 flex-shrink-0"
                            >
                                {copied ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                                        <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                                        <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Add to Lookbook */}
                        <button
                            onClick={() => setLookbookModalOpen(true)}
                            className="flex items-center gap-2 text-xs font-light tracking-wide border border-[#E8E4DF] py-2.5 px-4 w-fit mb-8 hover:border-dark transition-colors duration-200"
                            style={{ color: "#6A6A6A" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                            Add to Lookbook
                        </button>

                        {/* Meta info */}
                        <div className="border-t border-[#E8E4DF] pt-5 grid grid-cols-2 gap-3 mb-6">
                            {mapped.affiliate_program && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#8A8A8A" }}>Partner</p>
                                    <p className="text-sm font-light text-dark">{mapped.affiliate_program}</p>
                                </div>
                            )}
                            {mapped.material && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#8A8A8A" }}>Material</p>
                                    <p className="text-sm font-light text-dark">{mapped.material}</p>
                                </div>
                            )}
                            {mapped.gender && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#8A8A8A" }}>Gender</p>
                                    <p className="text-sm font-light text-dark capitalize">{mapped.gender}</p>
                                </div>
                            )}
                            {mapped.deal_tag && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#8A8A8A" }}>Deal</p>
                                    <p className="text-sm font-light text-dark">{mapped.deal_tag}</p>
                                </div>
                            )}
                        </div>

                        {/* Product Styles & Tags */}
                        {((product.styles as string[] | null)?.length || 0) > 0 || ((product.tags as string[] | null)?.length || 0) > 0 ? (
                            <div className="pt-4 border-t border-[#E8E4DF]">
                                <div className="flex gap-2 flex-wrap">
                                    {(product.styles as string[] || []).map((style: string) => (
                                        <Link
                                            key={style}
                                            href={`/shop-with-sidebar?style=${encodeURIComponent(style)}`}
                                            className="text-xs font-light px-4 py-1.5 rounded-full bg-[#F6F5F2] hover:bg-[#0A0A0A] hover:text-white border border-[#E8E4DF] transition-colors duration-200"
                                            style={{ color: "#6A6A6A" }}
                                        >
                                            {style}
                                        </Link>
                                    ))}
                                    {(product.tags as string[] || []).map((tag: string) => (
                                        <Link
                                            key={tag}
                                            href={`/shop-with-sidebar?search=${encodeURIComponent(tag.toLowerCase())}`}
                                            className="text-xs font-light px-4 py-1.5 rounded-full bg-[#F6F5F2] hover:bg-[#0A0A0A] hover:text-white border border-[#E8E4DF] transition-colors duration-200"
                                            style={{ color: "#6A6A6A" }}
                                        >
                                            #{tag}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Complete Your Look (Moved to Right Column) */}
                        <div className="mt-12 pt-8 border-t border-[#E8E4DF]">
                            <span
                                className="block text-[10px] sm:text-xs font-light tracking-[0.25em] uppercase mb-2"
                                style={{ color: "#8A8A8A" }}
                            >
                                You may also like
                            </span>
                            <h2
                                className="font-playfair font-normal text-xl sm:text-2xl text-dark mb-6"
                                style={{ letterSpacing: "-0.02em" }}
                            >
                                Complete Your Look
                            </h2>
                            {crossSellMapped.length > 0 ? (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                    {crossSellMapped.map((item, key) => (
                                        <ProductItem item={item} key={key} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm font-light italic" style={{ color: "#8A8A8A" }}>
                                    No complementary items found at the moment.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <ProductTabs product={product} />

                {/* Related Products */}
                <div className="mb-16">
                    <div className="mb-8 border-t border-[#E8E4DF] pt-12">
                        <span
                            className="block text-xs font-light tracking-[0.25em] uppercase mb-2"
                            style={{ color: "#8A8A8A" }}
                        >
                            Similar Items
                        </span>
                        <h2
                            className="font-playfair font-normal text-2xl xl:text-3xl text-dark"
                            style={{ letterSpacing: "-0.02em" }}
                        >
                            Related Pieces
                        </h2>
                    </div>
                    {relatedMapped.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-7.5 gap-y-9">
                            {relatedMapped.map((item, key) => (
                                <ProductItem item={item} key={key} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm font-light italic" style={{ color: "#8A8A8A" }}>
                            No similar pieces found at the moment.
                        </p>
                    )}
                </div>

                {/* Reviews Section */}
                <ProductReviews
                    productId={String(product.id)}
                    avgRating={avgRating}
                    reviewCount={reviewCount}
                />

                {/* Add to Lookbook Modal */}
                {lookbookModalOpen && (
                    <AddToLookbookModal
                        productId={String(product.id)}
                        onClose={() => setLookbookModalOpen(false)}
                    />
                )}
            </div>
        </main>
    );
}
