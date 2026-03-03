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

          {/* ── Left: Carousel ───────────────────────────────────────── */}
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 overflow-hidden h-full">
              <HeroCarousel />
            </div>
          </div>

          {/* ── Right: Two feature cards ──────────────────────────────── */}
          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5 h-full">

              {/* Card 1 — AI Styling */}
              <Link
                href="/ai-styling"
                className="group relative overflow-hidden flex-1"
                style={{ minHeight: "220px", display: "block" }}
              >
                <div className="absolute inset-0">
                  <Image
                    src="/images/media/gemini-3-pro-image-preview-2k_b_Oversized_denim_jack.png"
                    alt="AI Styling"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.05) 60%)" }}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
                  <span className="block text-[10px] font-light tracking-[0.25em] uppercase mb-1" style={{ color: "rgba(246,245,242,0.55)" }}>
                    Powered by AI
                  </span>
                  <h2 className="font-playfair font-normal text-white text-xl mb-1">AI Styling</h2>
                  <p className="text-white/55 text-xs font-light mb-3">Upload any piece, get a full outfit instantly.</p>
                  <span className="inline-flex items-center gap-2 text-white/75 text-xs tracking-wider group-hover:text-white group-hover:gap-3 transition-all duration-300">
                    Try it now
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>

              {/* Card 2 — Lookbook */}
              <Link
                href="/lookbook"
                className="group relative overflow-hidden flex-1"
                style={{ minHeight: "220px", display: "block" }}
              >
                <div className="absolute inset-0">
                  <Image
                    src="/images/media/gemini-3-pro-image-preview_b_Cinematic_ultra-real (1).png"
                    alt="Lookbook"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.05) 60%)" }}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
                  <span className="block text-[10px] font-light tracking-[0.25em] uppercase mb-1" style={{ color: "rgba(246,245,242,0.55)" }}>
                    Curated Collections
                  </span>
                  <h2 className="font-playfair font-normal text-white text-xl mb-1">Lookbook</h2>
                  <p className="text-white/55 text-xs font-light mb-3">Explore complete outfits for every occasion.</p>
                  <span className="inline-flex items-center gap-2 text-white/75 text-xs tracking-wider group-hover:text-white group-hover:gap-3 transition-all duration-300">
                    Explore looks
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>

            </div>
          </div>

        </div>
      </div>

      {/* Hero features bar */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
