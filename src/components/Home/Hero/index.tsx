"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-10 lg:pb-12 pt-10 lg:pt-12" style={{ backgroundColor: '#F6F5F2' }}>
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          {/* Main carousel area */}
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-none overflow-hidden h-full">
              <HeroCarousel />
            </div>
          </div>

          {/* Right column — Fitova feature cards */}
          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              {/* AI Styling Card */}
              <Link
                href="/ai-styling"
                className="w-full relative rounded-none overflow-hidden p-7 flex flex-col justify-between min-h-[150px] group"
              >
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src="/images/media/gemini-3-pro-image-preview-2k_b_Oversized_denim_jack.png"
                    alt="AI Styling"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.2) 100%)" }} />
                </div>
                <div className="relative z-10">
                  <span className="inline-block text-white/70 text-[10px] font-light uppercase tracking-[0.2em] mb-3">
                    Powered by AI
                  </span>
                  <h2 className="font-playfair font-medium text-white text-2xl mb-2 leading-tight">AI Styling</h2>
                  <p className="text-white/80 text-sm font-light leading-relaxed">
                    Upload any piece and get a full outfit instantly.
                  </p>
                </div>
                <span className="relative z-10 mt-5 inline-flex items-center gap-2 text-white/90 text-sm font-light group-hover:text-white group-hover:gap-3 transition-all duration-300">
                  Try it now
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>

              {/* Lookbook Card */}
              <Link
                href="/lookbook"
                className="w-full relative rounded-none overflow-hidden p-7 flex flex-col justify-between min-h-[150px] group mt-5 sm:mt-0 xl:mt-5"
              >
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src="/images/media/gemini-3-pro-image-preview_b_Cinematic_ultra-real (1).png"
                    alt="Lookbook"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.2) 100%)" }} />
                </div>
                <div className="relative z-10">
                  <span className="inline-block text-white/70 text-[10px] font-light uppercase tracking-[0.2em] mb-3">
                    Curated Collections
                  </span>
                  <h2 className="font-playfair font-medium text-white text-2xl mb-2 leading-tight">Lookbook</h2>
                  <p className="text-white/80 text-sm font-light leading-relaxed">
                    Explore complete outfits crafted for every occasion.
                  </p>
                </div>
                <span className="relative z-10 mt-5 inline-flex items-center gap-2 text-white/90 text-sm font-light group-hover:text-white group-hover:gap-3 transition-all duration-300">
                  Explore looks
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero features */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
