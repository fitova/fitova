"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/app/context/AuthContext";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
    addItemToWishlist,
    removeItemFromWishlist,
    selectLookbookWishlist,
} from "@/redux/features/wishlist-slice";
import { addToWishlist, removeFromWishlist } from "@/lib/queries/wishlist";
import {
    getLookbooks,
    addLookbookToCart,
    forkLookbook,
    getLookbookProductPreviews,
    Lookbook,
} from "@/lib/queries/lookbooks";
import toast from "react-hot-toast";

/* ── Gradient fallbacks ──────────────────────────────────────── */
const bgGradients = [
    "linear-gradient(135deg, #0A0A0A 0%, #2C2C2C 100%)",
    "linear-gradient(135deg, #2C1810 0%, #6B3A2A 100%)",
    "linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)",
    "linear-gradient(135deg, #1A1A1A 0%, #3A3A2A 100%)",
    "linear-gradient(135deg, #1A0D0D 0%, #3D1A1A 100%)",
    "linear-gradient(135deg, #1B1B0A 0%, #3B3B1A 100%)",
];

/* ── Hover preview (lazy-load 2×3 product images) ────────────── */
function HoverPreview({ lookbookId }: { lookbookId: string }) {
    const [thumbs, setThumbs] = useState<string[]>([]);
    const [fetched, setFetched] = useState(false);

    const load = async () => {
        if (fetched) return;
        setFetched(true);
        const urls = await getLookbookProductPreviews(lookbookId, 6);
        setThumbs(urls);
    };

    return (
        <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            onMouseEnter={load}
        >
            {thumbs.length >= 2 && (
                <div className="grid grid-cols-3 grid-rows-2 h-full">
                    {[0, 1, 2, 3, 4, 5].map((i) =>
                        thumbs[i] ? (
                            <img
                                key={i}
                                src={thumbs[i]}
                                alt=""
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div key={i} className="w-full h-full" style={{ background: "#1A1A1A" }} />
                        )
                    )}
                </div>
            )}
        </div>
    );
}

/* ── Main component ──────────────────────────────────────────── */
export default function Lookbook() {
    const [activeTag, setActiveTag] = useState<string>("All");
    const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState<string | null>(null);
    const [forking, setForking] = useState<string | null>(null);

    const { user } = useCurrentUser();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const lookbookWishlist = useAppSelector(selectLookbookWishlist);
    const savedIds = lookbookWishlist.map((item) => item.item_id);

    const fetchLookbooks = async () => {
        setLoading(true);
        try {
            const data = await getLookbooks(activeTag);
            setLookbooks(data);
        } catch (err) {
            console.error("Error fetching lookbooks:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLookbooks();
    }, [activeTag]);

    /* ── Wishlist toggle ─────────────────────────────────────── */
    const toggleSave = async (look: Lookbook) => {
        if (!user) { router.push("/signin"); return; }
        const isSaved = savedIds.includes(look.id);
        try {
            if (isSaved) {
                await removeFromWishlist(look.id, "lookbook");
                dispatch(removeItemFromWishlist({ item_id: look.id, item_type: "lookbook" }));
            } else {
                await addToWishlist(look.id, "lookbook");
                dispatch(addItemToWishlist({
                    id: look.id,
                    item_id: look.id,
                    item_type: "lookbook",
                    created_at: new Date().toISOString(),
                    collectionName: look.title,
                    collectionSlug: look.slug,
                    coverImage: look.cover_image ?? undefined,
                }));
            }
        } catch (err: any) {
            console.error("Lookbook wishlist err:", err.message || err);
        }
    };

    /* ── Add all to cart ─────────────────────────────────────── */
    const handleAddToCart = async (look: Lookbook) => {
        if (!user) { router.push("/signin"); return; }
        setAddingToCart(look.id);
        try {
            const { added, skipped } = await addLookbookToCart(look.id, user.id);
            if (added > 0) toast.success(`${added} item${added !== 1 ? "s" : ""} added to cart!`);
            if (skipped.length > 0) toast(`Skipped (out of stock): ${skipped.join(", ")}`, { icon: "⚠️" });
            if (added === 0) toast("All items are out of stock", { icon: "⚠️" });
        } catch {
            toast.error("Failed to add to cart");
        }
        setAddingToCart(null);
    };

    /* ── Fork (Modify) ───────────────────────────────────────── */
    const handleModify = async (look: Lookbook) => {
        if (!user) { router.push("/signin"); return; }
        setForking(look.id);
        try {
            const fork = await forkLookbook(look.id, user.id);
            toast.success("Your copy was created!");
            router.push(`/lookbook/create?fork=${fork.id}`);
        } catch {
            toast.error("Failed to fork lookbook");
        }
        setForking(null);
    };

    const tags = ["All", "AI", "Trending", "User"];

    return (
        <main>
            {/* ── Hero ─────────────────────────────────────────────── */}
            <section
                className="relative flex flex-col items-center justify-center text-center pt-[120px] lg:pt-[180px] pb-20 px-4"
                style={{ background: "#0A0A0A" }}
            >
                <span className="block text-xs font-light tracking-[0.35em] uppercase mb-6" style={{ color: "rgba(246,245,242,0.45)" }}>
                    Curated Collections
                </span>
                <h1 className="font-playfair text-5xl md:text-6xl font-normal mb-5" style={{ color: "#F6F5F2", letterSpacing: "-0.03em" }}>
                    Lookbook
                </h1>
                <p className="font-light text-sm max-w-md leading-relaxed mb-8" style={{ color: "rgba(246,245,242,0.5)" }}>
                    Discover complete outfit ideas crafted by AI, popular trends, or our style team. Every look links directly to shoppable items.
                </p>
                {user && (
                    <button
                        onClick={() => router.push("/lookbook/create")}
                        className="px-6 py-3 border border-white/20 text-white hover:bg-white hover:text-black transition uppercase text-xs tracking-wider"
                    >
                        Create Your Lookbook
                    </button>
                )}
            </section>

            {/* ── Tag Filters ──────────────────────────────────────── */}
            <section
                className="sticky top-[72px] z-10"
                style={{ background: "#F6F5F2", borderBottom: "1px solid #E8E4DF" }}
            >
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 py-4 flex gap-2 flex-wrap">
                    {tags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className="px-4 py-1.5 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
                            style={
                                activeTag === tag
                                    ? { background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }
                                    : { background: "transparent", color: "#8A8A8A", border: "1px solid #C8C4BF" }
                            }
                        >
                            {tag === "AI" ? "AI Generated" : tag === "Trending" ? "Trending" : tag === "User" ? "User Created" : "All"}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Grid ─────────────────────────────────────────────── */}
            <section className="py-16">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-56 bg-[#E8E4DF] mb-4" />
                                    <div className="h-4 bg-[#E8E4DF] rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-[#E8E4DF] rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : lookbooks.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="font-playfair text-2xl text-[#0A0A0A] mb-3">No Lookbooks yet</p>
                            <p className="font-light text-sm text-[#8A8A8A]">
                                {user ? 'Be the first — click "Create Your Lookbook" above.' : "Sign in to create your own lookbook."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {lookbooks.map((look, index) => {
                                const bg = look.cover_image ? undefined : bgGradients[index % bgGradients.length];
                                const isOwner = user?.id === look.user_id;
                                return (
                                    <div
                                        key={look.id}
                                        className="group overflow-hidden"
                                        style={{ border: "1px solid #E8E4DF", background: "#FFFFFF" }}
                                    >
                                        {/* Cover panel */}
                                        <div
                                            className="relative h-56 w-full ease-out duration-500 group-hover:scale-[1.02] overflow-hidden cursor-pointer"
                                            style={
                                                look.cover_image
                                                    ? { backgroundImage: `url(${look.cover_image})`, backgroundSize: "cover", backgroundPosition: "center" }
                                                    : { background: bg }
                                            }
                                            onClick={() => router.push(`/lookbook/${look.slug}`)}
                                        >
                                            {/* 2×3 hover preview */}
                                            <HoverPreview lookbookId={look.id} />

                                            {/* Gradient + info overlay */}
                                            <div
                                                className="absolute inset-0 flex flex-col justify-end p-5 z-20"
                                                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)" }}
                                            >
                                                <span className="block text-[9px] font-light tracking-[0.25em] uppercase mb-1" style={{ color: "rgba(246,245,242,0.55)" }}>
                                                    {look.tag}
                                                </span>
                                                <h3 className="font-playfair text-xl font-normal" style={{ color: "#F6F5F2" }}>
                                                    {look.title}
                                                </h3>
                                            </div>

                                            {/* Creator avatar */}
                                            {look.profiles && look.tag === "User" && (
                                                <div className="absolute bottom-4 right-4 group/avatar z-30" title={`By ${look.profiles.full_name || "User"}`}>
                                                    <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-[#E8E4DF] flex items-center justify-center text-[#0A0A0A] font-medium text-xs">
                                                        {look.profiles.avatar_url ? (
                                                            <img src={look.profiles.avatar_url} alt={look.profiles.full_name ?? ""} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{(look.profiles.full_name || "?").charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-[#0A0A0A] text-white text-[10px] tracking-wide py-1.5 px-3 pointer-events-none">
                                                        By {look.profiles.full_name || "Anonymous"}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card body */}
                                        <div className="p-4">
                                            {look.description && (
                                                <p className="text-xs font-light text-[#8A8A8A] mb-3 leading-relaxed line-clamp-2">{look.description}</p>
                                            )}

                                            {/* Style tags */}
                                            {look.tags && look.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {look.tags.slice(0, 4).map((t) => (
                                                        <span key={t} className="text-[9px] font-light tracking-[0.1em] uppercase px-2 py-0.5" style={{ border: "1px solid #E8E4DF", color: "#8A8A8A" }}>
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Color dots */}
                                            {look.colors && look.colors.length > 0 && (
                                                <div className="flex gap-1.5 mb-4">
                                                    {look.colors.slice(0, 8).map((c) => (
                                                        <span key={c} className="w-4 h-4 rounded-full border border-[#E8E4DF]" style={{ background: c }} title={c} />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-1.5">
                                                {/* Shop This Look */}
                                                <button
                                                    onClick={() => router.push(`/lookbook/${look.slug}`)}
                                                    className="flex-1 py-2 text-[10px] font-light tracking-[0.12em] uppercase ease-out duration-200"
                                                    style={{ background: "#0A0A0A", color: "#F6F5F2" }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#2C2C2C")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = "#0A0A0A")}
                                                >
                                                    Shop Look
                                                </button>

                                                {/* Add all to cart */}
                                                <button
                                                    onClick={() => handleAddToCart(look)}
                                                    disabled={addingToCart === look.id}
                                                    title="Add all to cart"
                                                    className="px-2.5 py-2 border border-[#E8E4DF] hover:border-[#0A0A0A] transition-colors disabled:opacity-50"
                                                >
                                                    {addingToCart === look.id ? (
                                                        <div className="w-3.5 h-3.5 border border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.5">
                                                            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                                        </svg>
                                                    )}
                                                </button>

                                                {/* Modify (fork) — only for non-owner */}
                                                {!isOwner && (
                                                    <button
                                                        onClick={() => handleModify(look)}
                                                        disabled={forking === look.id}
                                                        title="Modify this lookbook"
                                                        className="px-2.5 py-2 border border-[#E8E4DF] hover:border-[#0A0A0A] transition-colors disabled:opacity-50"
                                                    >
                                                        {forking === look.id ? (
                                                            <div className="w-3.5 h-3.5 border border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.5">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                )}

                                                {/* Save/Wishlist */}
                                                <button
                                                    onClick={() => toggleSave(look)}
                                                    title={savedIds.includes(look.id) ? "Saved" : "Save to wishlist"}
                                                    className="px-2.5 py-2 border transition-colors"
                                                    style={
                                                        savedIds.includes(look.id)
                                                            ? { background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }
                                                            : { border: "1px solid #E8E4DF", color: "#8A8A8A" }
                                                    }
                                                >
                                                    {savedIds.includes(look.id) ? "✓" : "♡"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
