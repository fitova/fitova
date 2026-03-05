"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { globalSearch, GlobalSearchResults } from "@/lib/queries/search";

interface GlobalSearchDropdownProps {
    isTransparent?: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

const GlobalSearchDropdown = ({ isTransparent = false }: GlobalSearchDropdownProps) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<GlobalSearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const debouncedQuery = useDebounce(query, 300);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const hasResults =
        results &&
        (results.products.length > 0 || results.collections.length > 0 || results.coupons.length > 0);

    const totalItems = (results?.products.length || 0) + (results?.collections.length || 0) + (results?.coupons.length || 0) + (hasResults ? 1 : 0);

    // Reset active index when results change
    useEffect(() => setActiveIndex(-1), [results]);

    // Fetch on debounced query change
    useEffect(() => {
        if (debouncedQuery.trim().length < 2) {
            setResults(null);
            setOpen(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        globalSearch(debouncedQuery).then(r => {
            if (!cancelled) { setResults(r); setOpen(true); }
        }).finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [debouncedQuery]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); return; }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => (prev > -1 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < totalItems) {
                setOpen(false);
                let current = activeIndex;
                const pLen = results?.products.length || 0;
                const cLen = results?.collections.length || 0;
                const cpLen = results?.coupons.length || 0;

                if (current < pLen) {
                    router.push(`/products/${results!.products[current].slug}`);
                } else if (current < pLen + cLen) {
                    current -= pLen;
                    router.push(`/collections/${results!.collections[current].slug}`);
                } else if (current < pLen + cLen + cpLen) {
                    router.push(`/coupons`);
                } else {
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                }
            } else if (query.trim()) {
                setOpen(false);
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }
        }
    }, [query, activeIndex, totalItems, results, router]);

    const handleClose = () => { setOpen(false); setQuery(""); setResults(null); };

    const inputColor = isTransparent
        ? "bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
        : "bg-gray-1 border-gray-3 text-dark placeholder:text-gray-5 focus:bg-white";

    return (
        <div ref={containerRef} className="relative w-full max-w-[475px]">
            {/* Input with search icon */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => { if (hasResults) setOpen(true); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search products, brands, styles…"
                    autoComplete="off"
                    className={`w-full rounded-[5px] border py-2.5 pl-4 pr-10 text-sm outline-none transition-all duration-200 ${inputColor}`}
                    aria-label="Global search"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                />
                {/* Search / spinner icon */}
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isTransparent ? "text-white/70" : "text-dark/60"}`}>
                    {loading ? (
                        <span className="block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="fill-current">
                            <path d="M17.27 15.67L12.63 11.9A7.2 7.2 0 102.45 12.68a7.2 7.2 0 0011.33.14l4.7 3.8a.75.75 0 001.03-.1.75.75 0 00-.24-1.05zM7.2 13.39a5.99 5.99 0 110-11.98 5.99 5.99 0 010 11.98z" />
                        </svg>
                    )}
                </span>
            </div>

            {/* Dropdown panel */}
            {open && (
                <div
                    role="listbox"
                    className="absolute left-0 top-full mt-1.5 w-full min-w-[340px] bg-white border border-[#E8E4DF] shadow-xl z-[60] rounded-sm overflow-hidden"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                >
                    {!hasResults && !loading && (
                        <div className="px-5 py-6 text-center">
                            <p className="text-sm text-dark-4 font-light">No results for &ldquo;{query}&rdquo;</p>
                            <Link
                                href={`/search?q=${encodeURIComponent(query)}`}
                                onClick={handleClose}
                                className="mt-2 inline-block text-xs tracking-[0.15em] uppercase font-medium text-dark hover:opacity-60"
                            >
                                See all results →
                            </Link>
                        </div>
                    )}

                    {/* ── Products ───────────────────────────────── */}
                    {results && results.products.length > 0 && (
                        <div>
                            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                                <span className="text-[9px] font-medium tracking-[0.25em] uppercase text-[#8A8A8A]">Products</span>
                                <Link
                                    href={`/search?q=${encodeURIComponent(query)}&type=products`}
                                    onClick={handleClose}
                                    className="text-[9px] tracking-wide uppercase text-dark hover:opacity-60 transition-opacity"
                                >
                                    View All
                                </Link>
                            </div>
                            <ul>
                                {results.products.map((p, i) => {
                                    const itemIndex = i;
                                    const thumb = p.product_images?.find(img => img.type === "thumbnail" || img.sort_order === 0)?.url;
                                    const price = p.discounted_price ?? p.price;
                                    return (
                                        <li key={p.id}>
                                            <Link
                                                href={`/products/${p.slug}`}
                                                onClick={handleClose}
                                                className={`flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 ${activeIndex === itemIndex ? "bg-[#F9F7F5]" : "hover:bg-[#F9F7F5]"}`}
                                            >
                                                {/* Thumbnail */}
                                                <div className="w-10 h-12 flex-shrink-0 bg-[#F0EDE8] rounded-sm overflow-hidden relative">
                                                    {thumb ? (
                                                        <Image src={thumb} alt={p.name} fill className="object-cover" sizes="40px" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" opacity="0.2">
                                                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#000" strokeWidth="1.5" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[12px] font-medium text-dark truncate">{p.name}</p>
                                                    <p className="text-[11px] text-dark-4 font-light">
                                                        {p.brand && <span className="mr-1.5">{p.brand}</span>}
                                                        {p.gender && <span className="mr-1.5 capitalize">{p.gender}</span>}
                                                    </p>
                                                </div>
                                                {/* Price */}
                                                <span className="text-[12px] font-medium text-dark flex-shrink-0">${price}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {/* ── Collections ────────────────────────────── */}
                    {results && results.collections.length > 0 && (
                        <div className="border-t border-[#F0EDE8]">
                            <div className="px-4 pt-3 pb-1">
                                <span className="text-[9px] font-medium tracking-[0.25em] uppercase text-[#8A8A8A]">Lookbooks</span>
                            </div>
                            <ul>
                                {results.collections.map((c, i) => {
                                    const itemIndex = results.products.length + i;
                                    return (
                                        <li key={c.id}>
                                            <Link
                                                href={`/collections/${c.slug}`}
                                                onClick={handleClose}
                                                className={`flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 ${activeIndex === itemIndex ? "bg-[#F9F7F5]" : "hover:bg-[#F9F7F5]"}`}
                                            >
                                                <div className="w-10 h-10 flex-shrink-0 bg-[#F0EDE8] rounded-sm overflow-hidden relative">
                                                    {c.thumbnail_url ? (
                                                        <Image src={c.thumbnail_url} alt={c.name} fill className="object-cover" sizes="40px" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-dark-4">LB</div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[12px] font-medium text-dark truncate">{c.name}</p>
                                                    {c.description && <p className="text-[11px] text-dark-4 truncate">{c.description}</p>}
                                                </div>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {/* ── Coupons ────────────────────────────────── */}
                    {results && results.coupons.length > 0 && (
                        <div className="border-t border-[#F0EDE8]">
                            <div className="px-4 pt-3 pb-1">
                                <span className="text-[9px] font-medium tracking-[0.25em] uppercase text-[#8A8A8A]">Coupons</span>
                            </div>
                            <ul>
                                {results.coupons.map((c, i) => {
                                    const itemIndex = results.products.length + results.collections.length + i;
                                    return (
                                        <li key={c.id}>
                                            <Link
                                                href="/coupons"
                                                onClick={handleClose}
                                                className={`flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 block ${activeIndex === itemIndex ? "bg-[#F9F7F5]" : "hover:bg-[#F9F7F5]"}`}
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    <span className="font-mono text-[11px] font-semibold text-dark bg-[#F0EDE8] px-2 py-1 rounded-sm tracking-widest">{c.code}</span>
                                                    <span className="text-[11px] text-dark-4 max-w-[80px] truncate">{c.store_name}</span>
                                                    <span className="text-[11px] text-dark-4 ml-auto">
                                                        {c.discount_type === "percent"
                                                            ? `${c.discount_value}% off`
                                                            : `$${c.discount_value} off`}
                                                        {c.min_order_amount ? ` on $${c.min_order_amount}+` : ""}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {/* ── See All Results ────────────────────────── */}
                    {hasResults && (() => {
                        const itemIndex = results.products.length + results.collections.length + results.coupons.length;
                        return (
                            <div className={`border-t border-[#F0EDE8] transition-colors duration-150 ${activeIndex === itemIndex ? "bg-[#F9F7F5]" : "hover:bg-[#F9F7F5]"}`}>
                                <Link
                                    href={`/search?q=${encodeURIComponent(query)}`}
                                    onClick={handleClose}
                                    className="flex items-center justify-center gap-2 px-4 py-3 text-[11px] font- medium tracking-[0.2em] uppercase text-dark block w-full h-full"
                                >
                                    See All Results
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default GlobalSearchDropdown;
