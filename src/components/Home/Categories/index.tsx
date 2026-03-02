"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useRef, useEffect } from "react";
import data from "./categoryData";
import Image from "next/image";
import Link from "next/link";

// Import Swiper styles
import "swiper/css/navigation";
import "swiper/css";

const SingleItem = ({ item }: { item: { id: number; title: string; img: string } }) => {
  return (
    <Link
      href={`/shop-with-sidebar?category=${item.title.toLowerCase().replace(/\s+/g, "-")}`}
      className="group flex flex-col items-center"
    >
      <div className="max-w-[130px] w-full bg-[#F2F3F8] h-32.5 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-[#E8E4DF]">
        <Image src={item.img} alt={item.title} width={82} height={62} />
      </div>
      <div className="flex justify-center">
        <h3 className="inline-block font-medium text-center text-dark text-sm tracking-wide group-hover:opacity-60 transition-opacity duration-200">
          {item.title}
        </h3>
      </div>
    </Link>
  );
};

const Categories = () => {
  const sliderRef = useRef<any>(null);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.swiper.init();
    }
  }, []);

  return (
    <section className="overflow-hidden pt-17.5">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
        <div className="swiper categories-carousel common-carousel">
          {/* Section title */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <span
                className="flex items-center gap-2 text-xs font-light tracking-[0.25em] uppercase mb-3"
                style={{ color: "#8A8A8A" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="#8A8A8A" strokeWidth="1.5" strokeLinejoin="round" />
                  <circle cx="7" cy="7" r="1.5" fill="#8A8A8A" />
                </svg>
                Categories
              </span>
              <h2
                className="font-playfair font-normal text-3xl xl:text-4xl text-dark"
                style={{ letterSpacing: "-0.02em" }}
              >
                Browse by Category
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="swiper-button-prev flex items-center justify-center w-9 h-9 border border-[#E8E4DF] text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-dark"
              >
                <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M15.4881 4.43C15.8026 4.7 15.839 5.17 15.5694 5.488L9.988 12l5.58 6.512c.27.314.234.788-.08 1.058-.315.27-.789.233-1.058-.08l-6-7a.75.75 0 010-.98l6-7c.27-.314.743-.351 1.058-.08z" fill="" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="swiper-button-next flex items-center justify-center w-9 h-9 border border-[#E8E4DF] text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-dark"
              >
                <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.512 4.43c.315-.27.789-.233 1.058.08l6 7a.75.75 0 010 .98l-6 7c-.27.314-.743.35-1.058.08-.315-.27-.351-.744-.08-1.058L14.012 12 8.43 5.488c-.27-.314-.234-.788.08-1.058z" fill="" />
                </svg>
              </button>
            </div>
          </div>

          <Swiper
            ref={sliderRef}
            slidesPerView={6}
            breakpoints={{
              0: { slidesPerView: 2 },
              1000: { slidesPerView: 4 },
              1200: { slidesPerView: 6 },
            }}
          >
            {data.map((item, key) => (
              <SwiperSlide key={key}>
                <SingleItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Categories;
