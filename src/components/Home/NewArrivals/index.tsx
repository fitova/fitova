"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductItem from "@/components/Common/ProductItem";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { getProducts, Product } from "@/lib/queries/products";

const NewArrival = () => {
  const head = useScrollReveal();
  const grid = useScrollReveal(0.05);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts({ limit: 8 });
        setProducts(data);
      } catch (error) {
        console.error("Error loading new arrivals:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <section className="overflow-hidden pt-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Section title */}
        <div
          ref={head.ref as React.RefObject<HTMLDivElement>}
          className={`mb-10 flex items-center justify-between ${head.baseClass} ${head.revealClass}`}
        >
          <div>
            <span
              className="flex items-center gap-2 text-xs font-light tracking-[0.25em] uppercase mb-3"
              style={{ color: "#8A8A8A" }}
            >
              {/* Thin-stroke bag icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                  stroke="#8A8A8A"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <line
                  x1="3"
                  y1="6"
                  x2="21"
                  y2="6"
                  stroke="#8A8A8A"
                  strokeWidth="1.5"
                />
                <path
                  d="M16 10a4 4 0 01-8 0"
                  stroke="#8A8A8A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              This Week
            </span>
            <h2
              className="font-playfair font-normal text-3xl xl:text-4xl text-dark"
              style={{ letterSpacing: "-0.02em" }}
            >
              New Arrivals
            </h2>
          </div>

          <Link
            href="/shop-with-sidebar"
            className="hidden sm:inline-flex items-center gap-2 font-light text-xs tracking-[0.15em] uppercase border border-dark text-dark px-6 py-2.5 ease-out duration-300 hover:bg-dark hover:text-white"
          >
            View All
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div
          ref={grid.ref as React.RefObject<HTMLDivElement>}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9 ${grid.baseClass} ${grid.revealClass}`}
        >
          {loading ? (
            <p>Loading arrivals...</p>
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

export default NewArrival;
