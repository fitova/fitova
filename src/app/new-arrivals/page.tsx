"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductItem from "@/components/Common/ProductItem";
import { getNewArrivals, Product } from "@/lib/queries/products";
import { mapProductFromDB } from "@/types/product";

export default function NewArrivalsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNewArrivals(24)
            .then((data) => setProducts(data))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ backgroundColor: "#F6F5F2", minHeight: "100vh" }}>
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-12 xl:py-20">

                {/* Page header */}
                <div className="mb-12 text-center">
                    <span
                        className="block text-xs font-light tracking-[0.3em] uppercase mb-4"
                        style={{ color: "#8A8A8A" }}
                    >
                        Just In
                    </span>
                    <h1
                        className="font-playfair font-normal text-4xl xl:text-5xl text-dark mb-4"
                        style={{ letterSpacing: "-0.02em" }}
                    >
                        New Arrivals
                    </h1>
                    <div className="w-12 h-px bg-dark mx-auto" />
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="w-full aspect-[3/4] bg-[#E8E4DF] mb-3" />
                                <div className="h-3 w-2/3 bg-[#E8E4DF] rounded mb-2" />
                                <div className="h-3 w-1/2 bg-[#E8E4DF] rounded" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && products.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32">
                        <p
                            className="font-playfair text-2xl text-dark mb-3"
                            style={{ letterSpacing: "-0.01em" }}
                        >
                            No new arrivals yet
                        </p>
                        <p
                            className="text-sm font-light mb-8"
                            style={{ color: "#8A8A8A" }}
                        >
                            Check back soon — new pieces drop weekly.
                        </p>
                        <Link
                            href="/shop-with-sidebar"
                            className="text-xs font-light tracking-[0.2em] uppercase border border-dark text-dark px-8 py-3 hover:bg-dark hover:text-white transition-colors duration-300"
                        >
                            Browse All Products
                        </Link>
                    </div>
                )}

                {/* Products grid */}
                {!loading && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
                        {products.map((item, key) => (
                            <ProductItem item={mapProductFromDB(item) as any} key={key} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
