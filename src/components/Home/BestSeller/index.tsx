"use client";
import React, { useEffect, useState } from "react";
import SingleItem from "./SingleItem";
import { useTypingAnimation } from "@/hooks/useTypingAnimation";
import { Product } from "@/types/product";
import { getBestSellers } from "@/lib/queries/bestSellers";

const BestSeller = () => {
  const animatedTitle = useTypingAnimation("Best Sellers", 60, 200);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getBestSellers(6);
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 text-xs font-light tracking-[0.2em] uppercase text-dark-4 mb-3">
              This Month
            </span>
            <h2 className="font-playfair font-normal text-3xl xl:text-4xl text-dark mb-1">
              {animatedTitle}
              <span
                className="inline-block w-[2px] h-[0.8em] ml-1 align-middle"
                style={{
                  backgroundColor: "#1A1A1A",
                  animation: "blink 1s step-end infinite",
                  opacity: animatedTitle.length >= "Best Sellers".length ? 0 : 1,
                }}
              />
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {/* <!-- Best Sellers item --> */}
          {loading ? (
            <p>Loading best sellers...</p>
          ) : (
            products.map((item, key) => (
              <SingleItem item={item as any} key={key} />
            ))
          )}
        </div>

        <div className="text-center mt-14">
          <a
            href="/shop-without-sidebar"
            className="inline-flex items-center gap-3 font-light text-xs tracking-[0.15em] uppercase border border-dark text-dark px-10 py-3 ease-out duration-300 hover:bg-dark hover:text-white"
          >
            Explore All Pieces
          </a>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
