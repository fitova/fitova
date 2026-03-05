"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { globalSearch, GlobalSearchResults } from "@/lib/queries/search";

function useDebounce<T>(value: T, delay: number): T {
    const [d, setD] = useState(value);
    useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
    return d;
}

type FilterType = "all" | "products" | "collections" | "coupons";

export default function SearchPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQ = searchParams.get("q") ?? "";
    const initialType = (searchParams.get("type") as FilterType) ?? "all";

    const [query, setQuery] = useState(initialQ);
    const [activeType, setActiveType] = useState<FilterType>(initialType);
    const [results, setResults] = useState<GlobalSearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 350);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync URL when query or type changes
    const syncUrl = useCallback((q: string, type: FilterType) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (type !== "all") params.set("type", type);
        router.replace(`/search?${params.toString()}`, { scroll: false });
    }, [router]);

    // Auto-focus on mount
    useEffect(() => { inputRef.current?.focus(); }, []);

    // Fetch results when debounced query changes
    useEffect(() => {
        if (debouncedQuery.trim().length < 2) {
            setResults(null);
            return;
        }
        let cancelled = false;
        setLoading(true);
        globalSearch(debouncedQuery, 20).then(r => {
            if (!cancelled) setResults(r);
        }).finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [debouncedQuery]);

    // Sync URL on changes
    useEffect(() => { syncUrl(query, activeType); }, [query, activeType, syncUrl]);

    const totalCount = results
        ? (results.products?.length ?? 0) + (results.collections?.length ?? 0) + (results.coupons?.length ?? 0)
        : 0;

    const TABS: { key: FilterType; label: string; count: number }[] = [
        { key: "all", label: "All", count: totalCount },
        { key: "products", label: "Products", count: results?.products?.length ?? 0 },
        { key: "collections", label: "Lookbooks", count: results?.collections?.length ?? 0 },
        { key: "coupons", label: "Coupons", count: results?.coupons?.length ?? 0 },
    ];

    const showProducts = (activeType === "all" || activeType === "products") && results?.products?.length > 0;
    const showCollections = (activeType === "all" || activeType === "collections") && results?.collections?.length > 0;
    const showCoupons = (activeType === "all" || activeType === "coupons") && results?.coupons?.length > 0;

    return (
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
            {/* ── Search Header ──────────────────────────────────────── */}
            <div className="mb-10">
                <span className="text-xs font-light tracking-[0.2em] uppercase text-dark-4">Search</span>
                <div className="relative mt-4 max-w-2xl">
                    <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search products, brands, styles, lookbooks…"
                        className="w-full bg-white border border-[#E8E4DF] py-4 pl-5 pr-12 text-dark text-base outline-none rounded-sm focus:border-dark transition-colors duration-200"
                        autoComplete="off"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/40">
                        {loading ? (
                            <span className="block w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="fill-current">
                                <path d="M17.27 15.67L12.63 11.9A7.2 7.2 0 102.45 12.68a7.2 7.2 0 0011.33.14l4.7 3.8a.75.75 0 001.03-.1.75.75 0 00-.24-1.05zM7.2 13.39a5.99 5.99 0 110-11.98 5.99 5.99 0 010 11.98z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Result count */}
                {results && !loading && debouncedQuery.trim().length >= 2 && (
                    <p className="mt-3 text-sm text-dark-4 font-light">
                        {totalCount > 0 ? (
                            <>{totalCount} result{totalCount !== 1 ? "s" : ""} for &ldquo;{debouncedQuery}&rdquo;</>
                        ) : (
                            <>No results for &ldquo;{debouncedQuery}&rdquo;</>
                        )}
                    </p>
                )}
            </div>

            {/* ── Tabs ───────────────────────────────────────────────── */}
            {results && totalCount > 0 && (
                <div className="flex gap-6 border-b border-[#E8E4DF] mb-10">
                    {TABS.map(tab => (
                        tab.count > 0 || tab.key === "all" ? (
                            <button
                                key={tab.key}
                                onClick={() => setActiveType(tab.key)}
                                className={`pb-3 border-b-2 text-sm font-medium tracking-wide transition-colors duration-200 ${activeType === tab.key
                                        ? "border-dark text-dark"
                                        : "border-transparent text-dark-4 hover:text-dark"
                                    }`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className="ml-1.5 text-xs font-light text-dark-4">({tab.count})</span>
                                )}
                            </button>
                        ) : null
                    ))}
                </div>
            )}

            {/* ── Results ─────────────────────────────────────────────── */}
            {!query.trim() && (
                <div className="text-center py-20">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 opacity-20">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <p className="text-dark-4 font-light">Start typing to search…</p>
                </div>
            )}

            {/* Products grid */}
            {showProducts && (
                <section className="mb-12">
                    {activeType === "all" && (
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[10px] font-medium tracking-[0.28em] uppercase text-[#8A8A8A]">Products</h2>
                            <button onClick={() => setActiveType("products")} className="text-[10px] tracking-wide uppercase text-dark hover:opacity-60 transition-opacity">
                                View All Products
                            </button>
                        </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {results!.products.map(p => {
                            const thumb = p.product_images?.find(i => i.type === "thumbnail" || i.sort_order === 0)?.url;
                            const price = p.discounted_price ?? p.price;
                            return (
                                <Link key={p.id} href={`/products/${p.slug}`} className="group block">
                                    <div className="relative overflow-hidden bg-[#F0EDE8] aspect-[3/4] rounded-sm mb-3">
                                        {thumb ? (
                                            <Image src={thumb} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 50vw, 25vw" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-20">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#000" strokeWidth="1.5" /></svg>
                                            </div>
                                        )}
                                        {p.discounted_price && (
                                            <span className="absolute top-2 left-2 bg-dark text-white text-[9px] font-medium px-2 py-0.5 uppercase tracking-wider">Sale</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-dark-4 font-light capitalize">{p.brand}</p>
                                    <p className="text-[13px] font-medium text-dark truncate">{p.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[13px] font-medium text-dark">${price}</span>
                                        {p.discounted_price && <span className="text-[11px] text-dark-4 line-through">${p.price}</span>}
                                    </div>
                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {p.gender && <span className="text-[9px] tracking-widest uppercase text-dark-4 border border-[#E8E4DF] px-1.5 py-0.5">{p.gender}</span>}
                                        {p.piece_type && <span className="text-[9px] tracking-widest uppercase text-dark-4 border border-[#E8E4DF] px-1.5 py-0.5">{p.piece_type}</span>}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Collections */}
            {showCollections && (
                <section className="mb-12">
                    {activeType === "all" && (
                        <h2 className="text-[10px] font-medium tracking-[0.28em] uppercase text-[#8A8A8A] mb-5">Lookbooks</h2>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {results!.collections.map(c => (
                            <Link key={c.id} href={`/collections/${c.slug}`} className="group flex gap-4 items-center p-4 border border-[#E8E4DF] hover:border-dark transition-colors duration-200 rounded-sm">
                                <div className="w-16 h-20 flex-shrink-0 bg-[#F0EDE8] rounded-sm overflow-hidden relative">
                                    {c.thumbnail_url ? (
                                        <Image src={c.thumbnail_url} alt={c.name} fill className="object-cover" sizes="64px" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-dark-4">LB</div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-dark group-hover:opacity-70 transition-opacity">{c.name}</p>
                                    {c.description && <p className="text-xs text-dark-4 mt-1 line-clamp-2">{c.description}</p>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Coupons */}
            {showCoupons && (
                <section className="mb-12">
                    {activeType === "all" && (
                        <h2 className="text-[10px] font-medium tracking-[0.28em] uppercase text-[#8A8A8A] mb-5">Active Coupons</h2>
                    )}
                    <div className="flex flex-wrap gap-4">
                        {results!.coupons.map(c => (
                            <div key={c.id} className="flex items-center gap-4 border border-dashed border-[#8A8A8A] px-6 py-4 rounded-sm">
                                <div>
                                    <span className="font-mono font-bold text-lg text-dark tracking-widest">{c.code}</span>
                                    <p className="text-sm text-dark-4 mt-0.5">
                                        {c.discount_type === "percent" ? `${c.discount_value}% off` : `$${c.discount_value} off`}
                                        {c.min_order_amount ? ` on orders over $${c.min_order_amount}` : ""}
                                    </p>
                                    {c.expires_at && (
                                        <p className="text-[10px] text-dark-4 mt-1">
                                            Expires {new Date(c.expires_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* No results */}
            {results && totalCount === 0 && !loading && (
                <div className="text-center py-20">
                    <p className="text-dark font-light text-lg mb-2">No results for &ldquo;{debouncedQuery}&rdquo;</p>
                    <p className="text-dark-4 text-sm">Try different keywords or browse by category</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <Link href="/outfits?piece_type_group=clothing" className="border border-dark text-dark text-xs tracking-[0.15em] uppercase px-5 py-2 hover:bg-dark hover:text-white transition-colors duration-200">
                            Clothing
                        </Link>
                        <Link href="/outfits?piece_type_group=footwear" className="border border-dark text-dark text-xs tracking-[0.15em] uppercase px-5 py-2 hover:bg-dark hover:text-white transition-colors duration-200">
                            Footwear
                        </Link>
                        <Link href="/outfits?piece_type_group=accessories" className="border border-dark text-dark text-xs tracking-[0.15em] uppercase px-5 py-2 hover:bg-dark hover:text-white transition-colors duration-200">
                            Accessories
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
