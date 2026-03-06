"use client";
import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/store";
import { AppDispatch } from "@/redux/store";
import {
  setWishlistItems,
  selectProductWishlist,
  selectLookbookWishlist,
  type WishlistEntry,
} from "@/redux/features/wishlist-slice";
import { getWishlist } from "@/lib/queries/wishlist";
import { useCurrentUser } from "@/app/context/AuthContext";
import ProductCard from "./ProductCard";
import LookbookCard from "./LookbookCard";

/* ─── Tab types ──────────────────────────────────────────────── */
type Tab = "products" | "lookbooks";

/* ─── Empty state ───────────────────────────────────────────── */
const EmptyState = ({ tab }: { tab: Tab }) => (
  <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
    <div
      className="w-16 h-16 flex items-center justify-center mb-6"
      style={{ backgroundColor: "#F0EDEA" }}
    >
      {tab === "products" ? (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
            stroke="#BCBCBC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="#BCBCBC" strokeWidth="1.5" />
          <path d="M3 9h18M9 21V9" stroke="#BCBCBC" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </div>
    <p
      className="font-playfair text-2xl mb-3"
      style={{ color: "#0A0A0A", letterSpacing: "-0.01em" }}
    >
      {tab === "products" ? "No saved products yet" : "No saved looks yet"}
    </p>
    <p className="text-sm font-light mb-8" style={{ color: "#8A8A8A" }}>
      {tab === "products"
        ? "Heart a product to save it here for later."
        : "Save a curated look to revisit it anytime."}
    </p>
    <Link
      href={tab === "products" ? "/shop-with-sidebar" : "/collections"}
      className="text-xs font-light tracking-[0.2em] uppercase border border-dark text-dark px-8 py-3 hover:bg-dark hover:text-white transition-all duration-300"
    >
      {tab === "products" ? "Browse Products" : "Explore Lookbook"}
    </Link>
  </div>
);

/* ─── Loading skeleton ──────────────────────────────────────── */
const Skeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="w-full bg-[#E8E4DF] mb-4" style={{ aspectRatio: "3/4" }} />
        <div className="h-3 w-2/3 bg-[#E8E4DF] rounded mb-2" />
        <div className="h-3 w-1/2 bg-[#E8E4DF] rounded mb-4" />
        <div className="h-10 w-full bg-[#E8E4DF]" />
      </div>
    ))}
  </div>
);

/* ─── Main Wishlist Component ───────────────────────────────── */
export const Wishlist = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useCurrentUser();
  const productItems = useAppSelector(selectProductWishlist);
  const lookbookItems = useAppSelector(selectLookbookWishlist);
  const loaded = useAppSelector(s => s.wishlistReducer.loaded);

  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [loading, setLoading] = useState(!loaded);
  const [isPending, startTransition] = useTransition();

  // Load wishlist from Supabase on mount (if not already loaded)
  useEffect(() => {
    if (loaded) return;
    if (!user) { setLoading(false); return; }

    setLoading(true);
    getWishlist()
      .then((items) => {
        const entries: WishlistEntry[] = items.map(item => ({
          id: item.id,
          item_id: item.item_id,
          item_type: item.item_type,
          created_at: item.created_at,
          // Product fields
          title: item.product?.name,
          price: item.product?.price,
          discountedPrice: item.product?.discounted_price ?? undefined,
          brand: item.product?.brand ?? undefined,
          imageUrl: (() => {
            const imgs = item.product?.product_images ?? [];
            const sorted = [...imgs].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            return sorted.find((i: any) => i.type === "main")?.url ?? sorted[0]?.url ?? undefined;
          })(),
          affiliateLink: item.product?.affiliate_link ?? undefined,
          // Lookbook fields
          collectionName: item.collection?.name,
          collectionSlug: item.collection?.slug,
          coverImage: item.collection?.cover_image ?? undefined,
        }));
        dispatch(setWishlistItems(entries));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [user, loaded, dispatch]);

  const switchTab = (tab: Tab) => {
    startTransition(() => setActiveTab(tab));
  };

  const currentItems = activeTab === "products" ? productItems : lookbookItems;
  const productCount = productItems.length;
  const lookbookCount = lookbookItems.length;

  return (
    <div style={{ backgroundColor: "#F6F5F2", minHeight: "100vh" }}>
      {/* ── Page header ── */}
      <div
        className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pt-12 pb-8"
      >
        <span
          className="block text-xs font-light tracking-[0.3em] uppercase mb-3"
          style={{ color: "#8A8A8A" }}
        >
          My Account
        </span>
        <div className="flex items-end justify-between">
          <h1
            className="font-playfair font-normal text-4xl xl:text-5xl text-dark"
            style={{ letterSpacing: "-0.02em" }}
          >
            Wishlist
          </h1>
          <span className="text-sm font-light pb-1" style={{ color: "#8A8A8A" }}>
            {productCount + lookbookCount}{" "}
            {productCount + lookbookCount === 1 ? "item" : "items"} saved
          </span>
        </div>
        <div className="w-full h-px mt-6" style={{ backgroundColor: "#E8E4DF" }} />
      </div>

      {/* ── Tab switcher ── */}
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 mb-10">
        <div className="flex items-center gap-0 w-fit" style={{ borderBottom: "1px solid #E8E4DF" }}>
          {(["products", "lookbooks"] as Tab[]).map((tab) => {
            const count = tab === "products" ? productCount : lookbookCount;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className="relative flex items-center gap-2 px-6 py-3 text-xs font-light tracking-[0.15em] uppercase transition-colors duration-200"
                style={{ color: isActive ? "#0A0A0A" : "#8A8A8A" }}
              >
                {tab === "products" ? "Saved Products" : "Saved Looks"}
                {count > 0 && (
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 min-w-[20px] text-center"
                    style={{
                      backgroundColor: isActive ? "#0A0A0A" : "#E8E4DF",
                      color: isActive ? "#F6F5F2" : "#8A8A8A",
                    }}
                  >
                    {count}
                  </span>
                )}
                {/* Active underline */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: "#0A0A0A" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div
        className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-20"
        style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 150ms" }}
      >
        {/* Not logged in */}
        {!user && !loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-playfair text-2xl mb-3 text-dark" style={{ letterSpacing: "-0.01em" }}>
              Sign in to see your wishlist
            </p>
            <p className="text-sm font-light mb-8" style={{ color: "#8A8A8A" }}>
              Your saved items will appear here after signing in.
            </p>
            <Link
              href="/signin"
              className="text-xs font-light tracking-[0.2em] uppercase border border-dark text-dark px-8 py-3 hover:bg-dark hover:text-white transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Loading */}
        {loading && <Skeleton />}

        {/* Empty state */}
        {!loading && user && currentItems.length === 0 && (
          <EmptyState tab={activeTab} />
        )}

        {/* Product grid */}
        {!loading && user && activeTab === "products" && productItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {productItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Lookbook grid */}
        {!loading && user && activeTab === "lookbooks" && lookbookItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {lookbookItems.map((item) => (
              <LookbookCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
