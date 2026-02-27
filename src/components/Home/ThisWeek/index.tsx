"use client";
import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { getTrendingProducts } from "@/lib/queries/trending";
import { getBestSellers } from "@/lib/queries/bestSellers";
import { getRecentlyViewed } from "@/lib/queries/recentlyViewed";
import SingleItem from "../BestSeller/SingleItem";
import { useCurrentUser } from "@/app/context/AuthContext";

type Tab = "trending" | "best_sellers" | "recently_viewed";

const ThisWeek = () => {
    const [activeTab, setActiveTab] = useState<Tab>("trending");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useCurrentUser();

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            try {
                let data: Product[] = [];
                if (activeTab === "trending") {
                    data = await getTrendingProducts(8);
                } else if (activeTab === "best_sellers") {
                    data = await getBestSellers(8);
                } else if (activeTab === "recently_viewed") {
                    data = await getRecentlyViewed(user?.id, 8);
                }
                setProducts(data);
            } catch (error) {
                console.error("Error loading this week products:", error);
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, [activeTab, user]);

    return (
        <section className="overflow-hidden py-14 bg-white">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
                <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <span className="flex items-center gap-2.5 text-xs font-light tracking-[0.2em] uppercase text-dark-4 mb-3">
                            Overview
                        </span>
                        <h2 className="font-playfair font-normal text-3xl xl:text-4xl text-dark mb-1">
                            This Week
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("trending")}
                            className={`font-medium text-sm tracking-wide pb-2 border-b-2 transition-colors duration-300 ${activeTab === "trending"
                                    ? "border-dark text-dark"
                                    : "border-transparent text-dark-4 hover:text-dark"
                                }`}
                        >
                            Trending (7 Days)
                        </button>
                        <button
                            onClick={() => setActiveTab("best_sellers")}
                            className={`font-medium text-sm tracking-wide pb-2 border-b-2 transition-colors duration-300 ${activeTab === "best_sellers"
                                    ? "border-dark text-dark"
                                    : "border-transparent text-dark-4 hover:text-dark"
                                }`}
                        >
                            Best Sellers
                        </button>
                        <button
                            onClick={() => setActiveTab("recently_viewed")}
                            className={`font-medium text-sm tracking-wide pb-2 border-b-2 transition-colors duration-300 ${activeTab === "recently_viewed"
                                    ? "border-dark text-dark"
                                    : "border-transparent text-dark-4 hover:text-dark"
                                }`}
                        >
                            Recently Viewed
                        </button>
                    </div>
                </div>

                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-full min-h-[400px]">
                            <div className="h-8 w-8 rounded-full border-4 border-t-dark border-gray-200 animate-spin"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7.5">
                            {products.map((item, key) => (
                                <SingleItem item={item} key={key} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-full min-h-[400px]">
                            <p className="text-dark-4 font-light">
                                {activeTab === "recently_viewed"
                                    ? "You haven't viewed any products recently."
                                    : `No products found for ${activeTab.replace("_", " ")}.`}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ThisWeek;
