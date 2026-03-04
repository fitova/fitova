"use client";
import React, { useRef, useEffect } from "react";
import VideoHero from "./VideoHero";
import BrandMarquee from "./BrandMarquee";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import BestSeller from "./BestSeller";
import TrendingSection from "./TrendingSection";
import Newsletter from "../Common/Newsletter";
import LookbookPreview from "./LookbookPreview";
import ThreeDSection from "./ThreeDSection/client";

/** Apply scroll-reveal to a section wrapper ref */
function useSr() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          obs.unobserve(el);
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const Home = () => {
  const catRef = useSr();
  const newRef = useSr();
  const bestRef = useSr();
  const trendRef = useSr();
  const lookRef = useSr();
  const threeRef = useSr();
  const newsRef = useSr();

  return (
    <main className="relative overflow-hidden">
      {/* ── Diagonal background ornament ─────────────────────── */}
      <div className="page-ornament" aria-hidden="true" />

      <VideoHero />
      <BrandMarquee />
      <Hero />

      <div ref={catRef} className="sr">
        <Categories />
      </div>

      <div ref={newRef} className="sr sr-delay-1">
        <NewArrival />
      </div>

      <div ref={bestRef} className="sr sr-delay-1">
        <BestSeller />
      </div>

      <div ref={trendRef} className="sr sr-delay-2">
        <TrendingSection />
      </div>

      <div ref={threeRef} className="sr">
        <ThreeDSection />
      </div>

      <div ref={lookRef} className="sr sr-delay-1">
        <LookbookPreview />
      </div>

      <div ref={newsRef} className="sr sr-delay-2">
        <Newsletter />
      </div>
    </main>
  );
};

export default Home;
