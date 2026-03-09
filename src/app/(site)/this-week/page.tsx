"use client";
import React, { useState, useEffect } from "react";
import PageCoverHeader from "@/components/Common/PageCoverHeader";
import HierarchicalShopFilters from "@/components/ShopWithSidebar/HierarchicalShopFilters";
import PriceDropdown from "@/components/ShopWithSidebar/PriceDropdown";
import ProductGridCard from "@/components/Shop/ProductGridCard";
import ProductFullWidthCard from "@/components/Shop/ProductFullWidthCard";
import { useThisWeekFilters, TabType } from "@/hooks/useThisWeekFilters";

export default function ThisWeekPage() {
    const [activeTab, setActiveTab] = useState<TabType>("new-arrivals");
    const { productStyle, setProductStyle, products, loading, filters, setFilters } = useThisWeekFilters(activeTab);
    const [productSidebar, setProductSidebar] = useState(false);

    // Close sidebar on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!(event.target as HTMLElement).closest(".shop-sidebar-content")) {
                setProductSidebar(false);
            }
        }
        if (productSidebar) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [productSidebar]);

    return (
        <main className="bg-[#F6F5F2] min-h-screen">
            <PageCoverHeader
                title="This Week"
                preTitle="Latest & Greatest"
                subtitle="Explore our hottest trending items, top sellers, and newest arrivals all in one place."
                breadcrumbPages={["this week"]}
            />

            {/* ── Tabs Navigation ────────────────────────────────────────── */}
            <section className="sticky top-[72px] z-30 bg-[#F6F5F2] border-b border-[#E8E4DF]">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-8 xl:px-0 py-4 flex gap-4 overflow-x-auto no-scrollbar">
                    {([
                        { id: "new-arrivals", label: "New Arrivals" },
                        { id: "trending", label: "Trending" },
                        { id: "best-sellers", label: "Best Sellers" },
                    ] as const).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className="flex-shrink-0 px-5 py-2 text-xs font-medium tracking-[0.1em] uppercase transition-all duration-300"
                            style={activeTab === tab.id
                                ? { background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }
                                : { background: "transparent", color: "#8A8A8A", border: "1px solid #C8C4BF" }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </section>

            <section className="pt-8 pb-20">
                <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-8 xl:px-0">
                    <div className="flex gap-8">
                        {/* ── Mobile Scrim ───────────────────────────────── */}
                        {productSidebar && (
                            <div
                                className="fixed inset-0 bg-black/50 z-40 xl:hidden"
                                onClick={() => setProductSidebar(false)}
                            />
                        )}

                        {/* ── Sidebar Filters ─────────────────────────────────── */}
                        <aside
                            className={`shop-sidebar-content fixed xl:static z-50 left-0 top-0 h-full xl:h-auto xl:w-[270px] flex-shrink-0 bg-[#F6F5F2] xl:bg-transparent overflow-y-auto xl:overflow-visible ease-out duration-300 ${productSidebar ? "w-[80vw] sm:w-[350px] translate-x-0 shadow-2xl" : "w-[300px] -translate-x-full xl:translate-x-0"}`}
                        >
                            <div className="xl:hidden flex items-center justify-between px-5 py-5 border-b border-[#E8E4DF] bg-white sticky top-0 z-10">
                                <span className="font-playfair text-xl text-[#0A0A0A]">Filters</span>
                                <button onClick={() => setProductSidebar(false)} className="w-8 h-8 flex items-center justify-center text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <HierarchicalShopFilters
                                filters={filters}
                                setFilters={setFilters}
                                products={products as any}
                            />

                            <div className="mt-0 border-t-0">
                                <PriceDropdown
                                    minPrice={filters.minPrice}
                                    maxPrice={filters.maxPrice}
                                    onPriceChange={(min, max) => setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }))}
                                />
                            </div>
                        </aside>

                        {/* ── Products Grid ───────────────────────────── */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E4DF]">
                                <p className="text-xs font-light text-[#8A8A8A]">
                                    {loading ? "Loading..." : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
                                </p>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setProductSidebar(true)}
                                        className="xl:hidden flex items-center gap-2 border border-[#0A0A0A] py-2 px-4 text-[10px] tracking-[0.15em] uppercase font-light text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all duration-200"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" /></svg>
                                        Filters
                                    </button>

                                    <div className="hidden sm:flex items-center border border-[#E8E4DF] bg-white">
                                        <button onClick={() => setProductStyle("grid")} aria-label="Grid view" className={`w-9 h-8 flex items-center justify-center transition-colors duration-200 ${productStyle === "grid" ? "bg-[#0A0A0A] text-white" : "text-[#8A8A8A] hover:bg-[#F6F5F2]"}`}>
                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.3" /><rect x="1" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.3" /></svg>
                                        </button>
                                        <button onClick={() => setProductStyle("list")} aria-label="List view" className={`w-9 h-8 flex items-center justify-center transition-colors duration-200 ${productStyle === "list" ? "bg-[#0A0A0A] text-white" : "text-[#8A8A8A] hover:bg-[#F6F5F2]"}`}>
                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="4" stroke="currentColor" strokeWidth="1.3" /><rect x="1" y="7" width="14" height="4" stroke="currentColor" strokeWidth="1.3" /><rect x="1" y="13" width="14" height="2" stroke="currentColor" strokeWidth="1.3" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className={`${productStyle === "grid" ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8" : "flex flex-col gap-5"}`}>
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="aspect-[3/4] bg-[#E8E4DF] w-full mb-3" />
                                            <div className="h-3 bg-[#E8E4DF] rounded w-3/4 mb-2" />
                                            <div className="h-3 bg-[#E8E4DF] rounded w-1/4" />
                                        </div>
                                    ))}
                                </div>
                            ) : products.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-[#D4D0CB] mb-4"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.2" /><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                                    <p className="font-playfair font-normal text-xl text-[#0A0A0A] mb-2">No products found</p>
                                    <p className="text-sm font-light text-[#8A8A8A]">Try adjusting your filters</p>
                                </div>
                            ) : (
                                <div className={`${productStyle === "grid" ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8" : "flex flex-col gap-5"}`}>
                                    {products.map((item, key) =>
                                        productStyle === "grid" ? (
                                            <ProductGridCard item={item as any} key={key} />
                                        ) : (
                                            <ProductFullWidthCard item={item as any} key={key} />
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
