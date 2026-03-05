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

interface Props {
    product: any; // raw DB product with product_images[]
    related: any[];
}

export default function ProductDetailsClient({ product, related }: Props) {
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
    const relatedMapped: Product[] = related.map(mapProductFromDB);

    return (
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-12 pt-[calc(var(--navbar-h)+2rem)]">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-light mb-10" style={{ color: "#8A8A8A" }}>
                <Link href="/" className="hover:text-dark transition-colors">Home</Link>
                <span>/</span>
                {product.categories?.name && (
                    <>
                        <Link
                            href={`/shop-with-sidebar?category=${product.categories?.slug ?? ""}`}
                            className="hover:text-dark transition-colors capitalize"
                        >
                            {product.categories.name}
                        </Link>
                        <span>/</span>
                    </>
                )}
                <span className="text-dark truncate max-w-[200px]">{mapped.title}</span>
            </nav>

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

                    {/* Colors — rendered as circles */}
                    {mapped.colors && mapped.colors.length > 0 && (
                        <div className="mb-5">
                            <p className="text-xs font-light tracking-wide uppercase mb-3" style={{ color: "#8A8A8A" }}>
                                Color: <span className="text-dark capitalize">{selectedColor ?? "Select"}</span>
                            </p>
                            <div className="flex gap-2.5 flex-wrap">
                                {mapped.colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        title={color}
                                        className="w-8 h-8 rounded-full border-2 transition-all duration-200 relative"
                                        style={{
                                            backgroundColor: color,
                                            borderColor: selectedColor === color ? "#1A1A1A" : "#E8E4DF",
                                            boxShadow: selectedColor === color ? "0 0 0 2px #F6F5F2, 0 0 0 4px #1A1A1A" : "none",
                                        }}
                                        aria-label={`Select color ${color}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sizes */}
                    {mapped.size && mapped.size.length > 0 && (
                        <div className="mb-7">
                            <p className="text-xs font-light tracking-wide uppercase mb-3" style={{ color: "#8A8A8A" }}>
                                Size: <span className="text-dark">{selectedSize ?? "Select"}</span>
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                {mapped.size.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedSize(s)}
                                        className="w-10 h-10 text-sm font-light border transition-colors duration-200"
                                        style={{
                                            borderColor: selectedSize === s ? "#1A1A1A" : "#E8E4DF",
                                            background: selectedSize === s ? "#1A1A1A" : "transparent",
                                            color: selectedSize === s ? "#F6F5F2" : "#6A6A6A",
                                        }}
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
                                    <path fillRule="evenodd" clipRule="evenodd" d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946Z" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946ZM7.99992 2.97255C6.45855 1.5935 4.73256 1.40058 3.33376 2.03998C1.85639 2.71528 0.833252 4.28336 0.833252 6.0914C0.833252 7.86842 1.57358 9.22404 2.5444 10.3172C3.32183 11.1926 4.2734 11.9253 5.1138 12.5724C5.30431 12.7191 5.48911 12.8614 5.66486 12.9999C6.00636 13.2691 6.37295 13.5562 6.74447 13.7733C7.11582 13.9903 7.53965 14.1667 7.99992 14.1667C8.46018 14.1667 8.88401 13.9903 9.25537 13.7733C9.62689 13.5562 9.99348 13.2691 10.335 12.9999C10.5107 12.8614 10.6955 12.7191 10.886 12.5724C11.7264 11.9253 12.678 11.1926 13.4554 10.3172C14.4263 9.22404 15.1666 7.86842 15.1666 6.0914C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.5935 7.99992 2.97255Z" fill="currentColor" />
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
                    <div className="border-t border-[#E8E4DF] pt-5 grid grid-cols-2 gap-3">
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

                    {/* Product Tags */}
                    {(product.tags as string[] | null)?.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-[#E8E4DF]">
                            <div className="flex gap-2 flex-wrap">
                                {(product.tags as string[]).map((tag: string) => (
                                    <Link
                                        key={tag}
                                        href={`/shop-with-sidebar?tag=${encodeURIComponent(tag.toLowerCase())}`}
                                        className="text-xs font-light px-3 py-1 border border-[#E8E4DF] hover:border-dark transition-colors duration-200"
                                        style={{ color: "#6A6A6A" }}
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products */}
            {relatedMapped.length > 0 && (
                <div>
                    <div className="mb-8 border-t border-[#E8E4DF] pt-12">
                        <span
                            className="block text-[10px] font-light tracking-[0.3em] uppercase mb-3"
                            style={{ color: "#8A8A8A" }}
                        >
                            You may also like
                        </span>
                        <h2
                            className="font-playfair font-normal text-3xl text-dark"
                            style={{ letterSpacing: "-0.02em" }}
                        >
                            Complete Your Look
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-7.5 gap-y-9">
                        {relatedMapped.map((item, key) => (
                            <ProductItem item={item} key={key} />
                        ))}
                    </div>
                </div>
            )}

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
    );
}
