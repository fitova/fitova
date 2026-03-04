"use client";
import React, { useState, useEffect } from "react";
import { useShopFilters } from "@/hooks/useShopFilters";
import Breadcrumb from "../Common/Breadcrumb";
import HierarchicalShopFilters from "./HierarchicalShopFilters";
import PriceDropdown from "./PriceDropdown";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";

const ShopWithSidebar = () => {
  const { productStyle, setProductStyle, products, loading, sortOptions: options } = useShopFilters();
  const [productSidebar, setProductSidebar] = useState(false);
  const [sort, setSort] = useState("default");

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

  const totalProducts = products.length;

  return (
    <>
      <Breadcrumb
        title="Explore All Products"
        pages={["shop"]}
      />

      <section className="bg-[#F6F5F2] min-h-screen pt-8 pb-20">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-8 xl:px-0">

          {/* ── Topbar ──────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#E8E4DF]">
            <div>
              <p className="text-xs font-light tracking-[0.3em] uppercase text-[#8A8A8A] mb-1">
                Showing all
              </p>
              <h1 className="font-playfair font-normal text-3xl text-[#0A0A0A]" style={{ letterSpacing: "-0.02em" }}>
                Shop
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Mobile filter button */}
              <button
                onClick={() => setProductSidebar(true)}
                className="xl:hidden flex items-center gap-2 border border-[#0A0A0A] py-2.5 px-4 text-xs tracking-[0.15em] uppercase font-light text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all duration-200"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="8" y1="12" x2="20" y2="12" />
                  <line x1="12" y1="18" x2="20" y2="18" />
                </svg>
                Filters
              </button>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-[#E8E4DF] bg-white py-2.5 px-4 text-xs font-light text-[#4A4A4A] outline-none hover:border-[#0A0A0A] transition-colors duration-200 cursor-pointer appearance-none pr-8"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238A8A8A' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                }}
              >
                <option value="default">Default Sorting</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="newest">Newest First</option>
              </select>

              {/* View toggle */}
              <div className="hidden sm:flex items-center border border-[#E8E4DF] bg-white">
                <button
                  onClick={() => setProductStyle("grid")}
                  aria-label="Grid view"
                  className={`w-10 h-9 flex items-center justify-center transition-colors duration-200 ${productStyle === "grid" ? "bg-[#0A0A0A] text-white" : "text-[#8A8A8A] hover:bg-[#F6F5F2]"}`}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="9" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="1" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </button>
                <button
                  onClick={() => setProductStyle("list")}
                  aria-label="List view"
                  className={`w-10 h-9 flex items-center justify-center transition-colors duration-200 ${productStyle === "list" ? "bg-[#0A0A0A] text-white" : "text-[#8A8A8A] hover:bg-[#F6F5F2]"}`}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="14" height="4" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="1" y="7" width="14" height="4" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="1" y="13" width="14" height="2" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">

            {/* ── Mobile Scrim ───────────────────────────────── */}
            {productSidebar && (
              <div
                className="fixed inset-0 bg-black/50 z-40 xl:hidden"
                onClick={() => setProductSidebar(false)}
              />
            )}

            {/* ── Sidebar ─────────────────────────────────── */}
            <aside
              className={`shop-sidebar-content fixed xl:static z-50 left-0 top-0 h-full xl:h-auto w-[300px] xl:w-[270px] flex-shrink-0 bg-[#F6F5F2] xl:bg-transparent overflow-y-auto xl:overflow-visible ease-out duration-300 ${productSidebar ? "translate-x-0 shadow-2xl" : "-translate-x-full xl:translate-x-0"}`}
            >
              {/* Mobile drawer header */}
              <div className="xl:hidden flex items-center justify-between px-5 py-4 border-b border-[#E8E4DF] bg-white sticky top-0 z-10">
                <span className="font-playfair text-lg text-[#0A0A0A]">Filters</span>
                <button onClick={() => setProductSidebar(false)} className="w-8 h-8 flex items-center justify-center text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Filters */}
              <HierarchicalShopFilters />

              {/* Price range */}
              <div className="mt-0 border-t-0">
                <PriceDropdown />
              </div>
            </aside>

            {/* ── Products Grid ───────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Product count */}
              <p className="text-xs font-light text-[#8A8A8A] mb-6">
                {loading ? "Loading…" : `${totalProducts} product${totalProducts !== 1 ? "s" : ""} found`}
              </p>

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
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-[#D4D0CB] mb-4">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <p className="font-playfair font-normal text-xl text-[#0A0A0A] mb-2">No products found</p>
                  <p className="text-sm font-light text-[#8A8A8A]">Try adjusting your filters</p>
                </div>
              ) : (
                <div
                  className={`${productStyle === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8"
                    : "flex flex-col gap-5"
                    }`}
                >
                  {products.map((item, key) =>
                    productStyle === "grid" ? (
                      <SingleGridItem item={item as any} key={key} />
                    ) : (
                      <SingleListItem item={item as any} key={key} />
                    )
                  )}
                </div>
              )}

              {/* Pagination (static for now — connect to real pagination later) */}
              {!loading && products.length > 0 && (
                <div className="flex justify-center mt-16">
                  <div className="flex items-center gap-1">
                    <button className="w-9 h-9 border border-[#E8E4DF] flex items-center justify-center text-[#8A8A8A] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors duration-200">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button className="w-9 h-9 border bg-[#0A0A0A] border-[#0A0A0A] text-white text-sm font-light">1</button>
                    <button className="w-9 h-9 border border-[#E8E4DF] text-sm font-light text-[#4A4A4A] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors duration-200">2</button>
                    <button className="w-9 h-9 border border-[#E8E4DF] text-sm font-light text-[#4A4A4A] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors duration-200">3</button>
                    <button className="w-9 h-9 border border-[#E8E4DF] flex items-center justify-center text-[#4A4A4A] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors duration-200">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
