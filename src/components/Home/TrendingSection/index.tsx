"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { getTrendingProducts } from "@/lib/queries/trending";
import ProductItem from "@/components/Common/ProductItem";

const TrendingSection = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            try {
                const data = await getTrendingProducts(6);
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
        <section className="py-17.5 bg-[#F6F7FB]">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15">
                {/* Section header */}
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M23 6l-9.5 9.5-5-5L1 18" stroke="#3C50E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M17 6h6v6" stroke="#3C50E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Trending Now
                        </span>
                        <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
                            Most Popular This Week
                        </h2>
                    </div>
                    <Link
                        href="/shop-with-sidebar"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue hover:underline"
                    >
                        View All
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 bg-[#F6F7FB] lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
                    {loading ? (
                        <p>Loading trending products...</p>
                    ) : (
                        products.map((item, key) => (
                            <ProductItem item={item as any} key={key} />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default TrendingSection;
