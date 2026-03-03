"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import ProductItem from "@/components/Common/ProductItem";
import { getNewArrivals, getProducts, Product } from "@/lib/queries/products";
import { mapProductFromDB } from "@/types/product";

/* ─── Skeleton ──────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="w-full aspect-[3/4] bg-[#E8E4DF] mb-3" />
        <div className="h-3 w-2/3 bg-[#E8E4DF] rounded mb-2" />
        <div className="h-3 w-1/2 bg-[#E8E4DF] rounded" />
      </div>
    ))}
  </div>
);

const NewArrival = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewArrivals(8)
      .then((data) => {
        if (data.length > 0) return data;
        return getProducts({ limit: 8 });
      })
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="overflow-hidden pt-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">

        {/* Section header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span
              className="flex items-center gap-2 text-xs font-light tracking-[0.25em] uppercase mb-3"
              style={{ color: "#8A8A8A" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
                  stroke="#8A8A8A" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              Just In
            </span>
            <h2
              className="font-playfair font-normal text-3xl xl:text-4xl text-dark"
              style={{ letterSpacing: "-0.02em" }}
            >
              New Arrivals
            </h2>
          </div>

          <Link
            href="/new-arrivals"
            className="hidden sm:inline-flex items-center gap-2 font-light text-xs tracking-[0.15em] uppercase border border-dark text-dark px-6 py-2.5 ease-out duration-300 hover:bg-dark hover:text-white"
          >
            View All
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Loading skeleton */}
        {loading && <Skeleton />}

        {/* Mobile: horizontal Swiper. Desktop: CSS grid */}
        {!loading && (
          <>
            {/* Mobile swiper (<640px) */}
            <div className="block sm:hidden -mx-4 px-4">
              <Swiper
                modules={[FreeMode]}
                slidesPerView={1.2}
                spaceBetween={16}
                freeMode
                className="!overflow-visible"
              >
                {products.map((item, key) => (
                  <SwiperSlide key={key} className="!h-auto">
                    <ProductItem item={mapProductFromDB(item) as any} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Tablet + desktop grid */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
              {products.map((item, key) => (
                <ProductItem item={mapProductFromDB(item) as any} key={key} />
              ))}
            </div>
          </>
        )}

        {/* Mobile view all */}
        {!loading && products.length > 0 && (
          <div className="text-center mt-10 sm:hidden">
            <Link
              href="/new-arrivals"
              className="inline-flex items-center gap-2 font-light text-xs tracking-[0.15em] uppercase border border-dark text-dark px-8 py-3 ease-out duration-300 hover:bg-dark hover:text-white"
            >
              View All New Arrivals
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrival;
