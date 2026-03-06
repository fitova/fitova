"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/app/context/AuthContext";
import { getLookbookBySlug, addLookbookToCart, forkLookbook, LookbookCategory } from "@/lib/queries/lookbooks";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";

const CATEGORY_LABELS: Record<LookbookCategory, string> = {
    top: "Tops",
    pants: "Pants & Bottoms",
    shoes: "Shoes",
    accessories: "Accessories",
    perfumes: "Fragrances",
};

const CATEGORY_ORDER: LookbookCategory[] = ["top", "pants", "shoes", "accessories", "perfumes"];

interface LookbookDetailClientProps {
    slug: string;
}

export default function LookbookDetailClient({ slug }: LookbookDetailClientProps) {
    const { user } = useCurrentUser();
    const router = useRouter();
    const [lookbook, setLookbook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [addingAll, setAddingAll] = useState(false);
    const [forking, setForking] = useState(false);

    useEffect(() => {
        getLookbookBySlug(slug)
            .then(setLookbook)
            .catch(() => setLookbook(null))
            .finally(() => setLoading(false));
    }, [slug]);

    const handleAddAllToCart = async () => {
        if (!user) { router.push("/signin"); return; }
        setAddingAll(true);
        try {
            const { added, skipped } = await addLookbookToCart(lookbook.id, user.id);
            if (added > 0) toast.success(`${added} item${added !== 1 ? "s" : ""} added to cart!`);
            if (skipped.length > 0) toast(`Out of stock: ${skipped.join(", ")}`, { icon: "⚠️" });
        } catch {
            toast.error("Failed to add to cart");
        }
        setAddingAll(false);
    };

    const handleModify = async () => {
        if (!user) { router.push("/signin"); return; }
        setForking(true);
        try {
            const fork = await forkLookbook(lookbook.id, user.id);
            toast.success("Your copy was created!");
            router.push(`/lookbook/create?fork=${fork.id}`);
        } catch {
            toast.error("Failed to fork lookbook");
        }
        setForking(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!lookbook) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center px-4">
                <div>
                    <p className="font-playfair text-2xl text-[#0A0A0A] mb-3">Lookbook not found</p>
                    <button onClick={() => router.push("/lookbook")} className="text-xs font-light text-[#8A8A8A] underline">
                        Back to Lookbooks
                    </button>
                </div>
            </div>
        );
    }

    // Group products by category
    const productsByCategory = CATEGORY_ORDER.reduce((acc, cat) => {
        acc[cat] = (lookbook.lookbook_products ?? []).filter((lp: any) => lp.category === cat);
        return acc;
    }, {} as Record<LookbookCategory, any[]>);

    const isOwner = user?.id === lookbook.user_id;

    return (
        <div>
            {/* ── Hero Header ─────────────────────────────────────── */}
            <section
                className="relative h-[60vh] min-h-[420px] flex flex-col justify-end"
                style={
                    lookbook.cover_image
                        ? { backgroundImage: `url(${lookbook.cover_image})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : { background: "#0A0A0A" }
                }
            >
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }} />

                {/* Fork banner */}
                {lookbook.is_copy && (
                    <div className="absolute top-6 left-0 right-0 flex justify-center z-10">
                        <div className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-xs font-light tracking-wide border border-white/20">
                            This is your copy based on another lookbook
                        </div>
                    </div>
                )}

                <div className="relative z-10 max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 pb-10 w-full">
                    <span className="block text-[10px] font-light tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(246,245,242,0.5)" }}>
                        {lookbook.tag} · {lookbook.occasion ?? lookbook.mood ?? "Lookbook"}
                    </span>
                    <h1 className="font-playfair text-4xl md:text-5xl font-normal mb-4" style={{ color: "#F6F5F2", letterSpacing: "-0.02em" }}>
                        {lookbook.title}
                    </h1>

                    {/* Creator */}
                    {lookbook.profiles && (
                        <div className="flex items-center gap-2.5 mb-6">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 bg-[#2C2C2C] flex items-center justify-center text-white text-xs">
                                {lookbook.profiles.avatar_url ? (
                                    <img src={lookbook.profiles.avatar_url} alt={lookbook.profiles.full_name ?? ""} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{(lookbook.profiles.full_name || "?").charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <span className="text-xs font-light" style={{ color: "rgba(246,245,242,0.7)" }}>
                                By {lookbook.profiles.full_name ?? "Anonymous"}
                            </span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={handleAddAllToCart}
                            disabled={addingAll}
                            className="px-5 py-2.5 text-xs font-light tracking-[0.15em] uppercase bg-white text-[#0A0A0A] hover:bg-[#F6F5F2] transition disabled:opacity-50"
                        >
                            {addingAll ? "Adding..." : "Add All to Cart"}
                        </button>
                        {!isOwner && (
                            <button
                                onClick={handleModify}
                                disabled={forking}
                                className="px-5 py-2.5 text-xs font-light tracking-[0.15em] uppercase border border-white/40 text-white hover:bg-white/10 transition disabled:opacity-50"
                            >
                                {forking ? "Creating copy..." : "Modify This Look"}
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Meta (tags, colors) ───────────────────────────────── */}
            {(lookbook.tags?.length > 0 || lookbook.colors?.length > 0) && (
                <section className="border-b border-[#E8E4DF] py-5">
                    <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 flex flex-wrap gap-6 items-center">
                        {lookbook.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {lookbook.tags.map((t: string) => (
                                    <span key={t} className="text-[9px] font-light tracking-[0.15em] uppercase px-2.5 py-1" style={{ border: "1px solid #E8E4DF", color: "#8A8A8A" }}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        )}
                        {lookbook.colors?.length > 0 && (
                            <div className="flex gap-1.5">
                                {lookbook.colors.map((c: string) => (
                                    <span key={c} className="w-5 h-5 rounded-full border border-[#E8E4DF]" style={{ background: c }} title={c} />
                                ))}
                            </div>
                        )}
                        {lookbook.mood && (
                            <span className="text-xs font-light text-[#8A8A8A]">Mood: {lookbook.mood}</span>
                        )}
                    </div>
                </section>
            )}

            {/* Description */}
            {lookbook.description && (
                <section className="py-8 border-b border-[#E8E4DF]">
                    <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
                        <p className="text-sm font-light text-[#4A4A4A] leading-relaxed max-w-2xl">{lookbook.description}</p>
                    </div>
                </section>
            )}

            {/* ── Product Sections ──────────────────────────────────── */}
            <section className="py-12">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 space-y-12">
                    {CATEGORY_ORDER.map((cat) => {
                        const items = productsByCategory[cat];
                        if (!items || items.length === 0) return null;

                        return (
                            <div key={cat}>
                                <h2 className="text-[11px] font-light tracking-[0.25em] uppercase text-[#8A8A8A] mb-5">
                                    {CATEGORY_LABELS[cat]}
                                </h2>
                                {/* Mobile: horizontal scroll; Desktop: grid */}
                                <div className="flex gap-4 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:overflow-x-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                                    {items.map((lp: any) => {
                                        const p = lp.products;
                                        if (!p) return null;
                                        const img = p.imgs?.previews?.[0];
                                        return (
                                            <div
                                                key={lp.id}
                                                className="flex-shrink-0 w-[200px] md:w-auto border border-[#E8E4DF] overflow-hidden group cursor-pointer"
                                                onClick={() => router.push(`/shop/${p.slug}`)}
                                            >
                                                <div className="aspect-[3/4] bg-[#F6F5F2] overflow-hidden">
                                                    {img ? (
                                                        <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[#C8C8C8]">No image</div>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <p className="text-xs font-light text-[#0A0A0A] mb-0.5 truncate">{p.name}</p>
                                                    {p.brand && <p className="text-[10px] text-[#8A8A8A] font-light mb-2">{p.brand}</p>}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-light text-[#0A0A0A]">
                                                            {p.discounted_price ? (
                                                                <>
                                                                    <span className="text-red-500 mr-1">${p.discounted_price}</span>
                                                                    <span className="text-[#C8C8C8] text-[10px] line-through">${p.price}</span>
                                                                </>
                                                            ) : (
                                                                `$${p.price}`
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
