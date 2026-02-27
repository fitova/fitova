"use client";
import React, { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getBestSellers } from "@/lib/queries/bestSellers";
import SingleItem from "@/components/Home/BestSeller/SingleItem";
import Breadcrumb from "@/components/Common/Breadcrumb";

export default function BestSellersPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                // Fetch a larger number of products for the dedicated page, e.g., 24
                const data = await getBestSellers(24);
                setProducts(data);
            } catch (error) {
                console.error("Failed to load best seller products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    return (
        <main>
            <Breadcrumb title="Best Sellers" pages={["this week", "best sellers"]} />
            <section className="bg-white py-16">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
                    <div className="mb-10">
                        <h2 className="font-playfair font-normal text-3xl text-dark mb-2">
                            Best Sellers
                        </h2>
                        <p className="text-dark-4 font-light text-sm">
                            Our most popular pieces, loved and purchased by many.
                        </p>
                    </div>

                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex justify-center items-center h-[200px]">
                                <div className="h-8 w-8 rounded-full border-4 border-t-dark border-gray-200 animate-spin"></div>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7.5">
                                {products.map((item, key) => (
                                    <SingleItem item={item} key={key} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 border border-gray-200">
                                <p className="font-playfair text-xl text-dark mb-2">No best sellers found</p>
                                <p className="text-sm font-light text-dark-4">
                                    Check back later for new top-rated pieces.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
