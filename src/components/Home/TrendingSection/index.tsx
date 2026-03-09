"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import { Product } from "@/types/product";
import { getTrendingProducts } from "@/lib/queries/trending";
import ProductItem from "@/components/Common/ProductItem";
import { motion } from "framer-motion";

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

const TrendingSection = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            try {
                const data = await getTrendingProducts(8);
                setProducts(data);
            } catch (error) {
                console.error("Error loading trending products:", error);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    return (
        <section style={{ backgroundColor: "#F6F5F2", borderTop: "1px solid #E8E4DF", margin: "0 -2rem", padding: "4rem 2rem" }}>
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
                {/* Section header */}
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <span
                            className="flex items-center gap-2 text-xs font-light tracking-[0.25em] uppercase mb-3"
                            style={{ color: "#8A8A8A" }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M23 6l-9.5 9.5-5-5L1 18" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M17 6h6v6" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Trending Now
                        </span>
                        <h2
                            className="font-playfair font-normal text-3xl xl:text-4xl text-dark"
                            style={{ letterSpacing: "-0.02em" }}
                        >
                            Most Popular This Week
                        </h2>
                    </div>
                    <Link
                        href="/shop-with-sidebar"
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
                                        <ProductItem item={item as any} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* Tablet + desktop grid */}
                        <motion.div
                            className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                        >
                            {products.map((item, key) => (
                                <motion.div
                                    key={key}
                                    variants={{
                                        hidden: { opacity: 0, y: 30 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
                                    }}
                                >
                                    <ProductItem item={item as any} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </>
                )}
            </div>
        </section>
    );
};

export default TrendingSection;
