"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
    getProductReviews,
    submitProductReview,
    type ProductReview,
} from "@/lib/queries/products";
import { useCurrentUser } from "@/app/context/AuthContext";

interface ProductReviewsProps {
    productId: string;
    avgRating?: number;
    reviewCount?: number;
}

/* ─── Star row ─────────────────────────────────────────────────── */
const Stars = ({
    rating,
    interactive = false,
    onSelect,
}: {
    rating: number;
    interactive?: boolean;
    onSelect?: (r: number) => void;
}) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type={interactive ? "button" : undefined}
                onClick={() => interactive && onSelect?.(star)}
                className={interactive ? "cursor-pointer" : "cursor-default pointer-events-none"}
                aria-label={interactive ? `Rate ${star}` : undefined}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={star <= rating ? "#1A1A1A" : "none"} stroke="#1A1A1A" strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            </button>
        ))}
    </div>
);

/* ─── Single review card ───────────────────────────────────────── */
const ReviewCard = ({ review }: { review: ProductReview }) => {
    const name = review.profiles?.full_name ?? "Anonymous";
    const avatar = review.profiles?.avatar_url;
    const date = new Date(review.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <div className="border-b border-[#E8E4DF] pb-6 mb-6 last:border-0 last:mb-0">
            <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div className="w-9 h-9 flex-shrink-0 overflow-hidden" style={{ borderRadius: "50%" }}>
                    {avatar ? (
                        <Image src={avatar} alt={name} width={36} height={36} className="object-cover w-full h-full" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: "#1A1A1A" }}>
                            {name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                {/* Meta */}
                <div>
                    <p className="text-sm font-light text-dark">{name}</p>
                    <p className="text-[10px] font-light" style={{ color: "#8A8A8A" }}>{date}</p>
                </div>
                {/* Stars */}
                <div className="ml-auto">
                    <Stars rating={review.rating} />
                </div>
            </div>
            {review.comment && (
                <p className="text-sm font-light leading-relaxed" style={{ color: "#6A6A6A" }}>
                    {review.comment}
                </p>
            )}
        </div>
    );
};

/* ─── Submit form ──────────────────────────────────────────────── */
const ReviewForm = ({
    productId,
    onSubmitted,
}: {
    productId: string;
    onSubmitted: () => void;
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) { setError("Please select a rating."); return; }
        setSubmitting(true);
        setError(null);
        try {
            await submitProductReview(productId, rating, comment);
            setSuccess(true);
            setTimeout(() => { setSuccess(false); onSubmitted(); }, 1500);
        } catch (err: any) {
            setError(err?.message ?? "Failed to submit review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t border-[#E8E4DF] pt-8 mt-8">
            <h3 className="font-playfair text-xl text-dark mb-6" style={{ letterSpacing: "-0.01em" }}>
                Write a Review
            </h3>
            {/* Star picker */}
            <div className="mb-5">
                <p className="text-xs font-light tracking-wide uppercase mb-2" style={{ color: "#8A8A8A" }}>Your Rating</p>
                <Stars rating={rating} interactive onSelect={setRating} />
            </div>
            {/* Comment */}
            <div className="mb-5">
                <label className="text-xs font-light tracking-wide uppercase mb-2 block" style={{ color: "#8A8A8A" }}>
                    Your Review <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    className="w-full border border-[#E8E4DF] bg-white text-sm font-light text-dark px-4 py-3 outline-none resize-none focus:border-dark transition-colors duration-200"
                    style={{ color: "#1A1A1A" }}
                />
            </div>
            {error && <p className="text-xs text-red-500 mb-4">{error}</p>}
            {success && <p className="text-xs mb-4" style={{ color: "#6A6A6A" }}>Review submitted! ✓</p>}
            <button
                type="submit"
                disabled={submitting}
                className="text-xs font-light tracking-[0.15em] uppercase px-8 py-3 transition-all duration-300 disabled:opacity-50"
                style={{ background: "#1A1A1A", color: "#F6F5F2" }}
            >
                {submitting ? "Submitting..." : "Submit Review"}
            </button>
        </form>
    );
};

/* ─── Main component ───────────────────────────────────────────── */
const ProductReviews = ({ productId, avgRating = 0, reviewCount = 0 }: ProductReviewsProps) => {
    const { user } = useCurrentUser();
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [total, setTotal] = useState(reviewCount);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);

    const fetchReviews = useCallback(async (p: number, replace = false) => {
        setLoading(true);
        try {
            const { reviews: fetched, count } = await getProductReviews(productId, p, 10);
            setReviews((prev) => replace ? fetched : [...prev, ...fetched]);
            setTotal(count);
            setHasMore((replace ? fetched.length : reviews.length + fetched.length) < count);
        } catch { }
        finally { setLoading(false); }
    }, [productId, reviews.length]);

    useEffect(() => { fetchReviews(0, true); }, [productId]);

    const handleLoadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchReviews(next, false);
    };

    return (
        <section className="border-t border-[#E8E4DF] pt-12 mt-12">
            {/* Header */}
            <div className="flex items-end justify-between mb-10">
                <div>
                    <span className="block text-[10px] font-light tracking-[0.3em] uppercase mb-3" style={{ color: "#8A8A8A" }}>
                        Customer Feedback
                    </span>
                    <h2 className="font-playfair font-normal text-3xl text-dark" style={{ letterSpacing: "-0.02em" }}>
                        Reviews & Ratings
                    </h2>
                </div>
                {avgRating > 0 && (
                    <div className="text-right">
                        <p className="font-playfair text-4xl text-dark mb-1">{avgRating.toFixed(1)}</p>
                        <Stars rating={Math.round(avgRating)} />
                        <p className="text-xs font-light mt-1" style={{ color: "#8A8A8A" }}>{total} {total === 1 ? "review" : "reviews"}</p>
                    </div>
                )}
            </div>

            {/* Loading skeleton */}
            {loading && reviews.length === 0 && (
                <div className="space-y-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse border-b border-[#E8E4DF] pb-6">
                            <div className="flex gap-3 mb-3">
                                <div className="w-9 h-9 rounded-full bg-[#E8E4DF]" />
                                <div className="flex-1">
                                    <div className="h-3 w-24 bg-[#E8E4DF] rounded mb-2" />
                                    <div className="h-2 w-16 bg-[#E8E4DF] rounded" />
                                </div>
                            </div>
                            <div className="h-3 w-2/3 bg-[#E8E4DF] rounded" />
                        </div>
                    ))}
                </div>
            )}

            {/* Reviews list */}
            {!loading && reviews.length === 0 && (
                <p className="text-sm font-light" style={{ color: "#8A8A8A" }}>
                    No reviews yet. Be the first to share your thoughts!
                </p>
            )}

            <div>
                {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
            </div>

            {/* Load more */}
            {hasMore && (
                <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="mt-4 text-xs font-light tracking-[0.2em] uppercase border border-dark text-dark px-8 py-3 hover:bg-dark hover:text-white transition-all duration-300 disabled:opacity-50"
                >
                    {loading ? "Loading..." : "Load More Reviews"}
                </button>
            )}

            {/* Submit form — only for authenticated users */}
            {user && (
                <ReviewForm
                    productId={productId}
                    onSubmitted={() => fetchReviews(0, true)}
                />
            )}
            {!user && (
                <p className="border-t border-[#E8E4DF] pt-8 mt-8 text-sm font-light" style={{ color: "#8A8A8A" }}>
                    <a href="/signin" className="underline text-dark hover:opacity-60 transition-opacity">Sign in</a> to leave a review.
                </p>
            )}
        </section>
    );
};

export default ProductReviews;
