"use client";
import React, { useEffect, useState } from "react";
import SingleItem from "./SingleItem";
import { useTypingAnimation } from "@/hooks/useTypingAnimation";
import { getBestSellers } from "@/lib/queries/bestSellers";
import { Product } from "@/types/product";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";

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

        {/* Mobile swiper (<640px) */}
        {!loading && (
          <div className="block sm:hidden -mx-4 px-4">
            <Swiper
              modules={[FreeMode]}
              slidesPerView={1.1}
              spaceBetween={16}
              freeMode
              className="!overflow-visible"
            >
              {products.map((item, key) => (
                <SwiperSlide key={key} className="!h-auto">
                  <SingleItem item={item as any} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Tablet + desktop grid */}
        {loading ? (
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-7.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse border border-[#E8E4DF]" style={{ minHeight: "403px", backgroundColor: "#F6F5F2" }}>
                <div className="px-4 py-7.5 text-center">
                  <div className="flex justify-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <div key={s} className="w-3.5 h-3.5 rounded-full bg-[#E8E4DF]" />
                    ))}
                  </div>
                  <div className="h-3 w-1/2 bg-[#E8E4DF] rounded mx-auto mb-2" />
                  <div className="h-4 w-1/3 bg-[#E8E4DF] rounded mx-auto" />
                </div>
                <div className="flex justify-center items-center mt-4">
                  <div className="w-[280px] h-[280px] bg-[#E8E4DF]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-7.5" // Reverted to original grid classes as per instruction, but applied motion.div
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
                <SingleItem item={item as any} />
              </motion.div>
            ))}
          </motion.div>
        )}

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
