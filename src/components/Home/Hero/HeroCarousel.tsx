"use client";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css";

import Image from "next/image";

/* ─── Typing animation hook ───────────────────────────────── */
function useTypingAnimation(text: string, speed = 60, startDelay = 300) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(delay);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [displayed, text, speed, started]);

  return displayed;
}

const HeroCarousal = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const { getActiveHomepageSlides } = await import('@/lib/queries/homepage_slides');
        const data = await getActiveHomepageSlides();
        setSlides(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSlides();
  }, []);

  const firstSlideTitle = slides.length > 0 ? slides[0].title : "Redefine Your\nSignature Look";
  const animatedTitle = useTypingAnimation(firstSlideTitle, 55, 300);

  if (loading) {
    return <div className="w-full h-full min-h-[450px] bg-[#0A0A0A] sm:flex animate-pulse"></div>;
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <Swiper
      spaceBetween={0}
      centeredSlides={true}
      effect="fade"
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      modules={[Autoplay, Pagination, EffectFade]}
      className="hero-carousel w-full h-full"
    >
      {slides.map((slide, index) => {
        const isFirstSlide = index === 0;
        return (
          <SwiperSlide key={slide.id}>
            <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row h-full min-h-[450px]" style={{ background: "#0A0A0A" }}>
              <div className="max-w-[450px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-16 z-10 w-full">
                <div className="flex items-center gap-4 mb-6">
                  <span className="block font-light tracking-[0.3em] uppercase text-xs" style={{ color: "#8A8A8A" }}>
                    {slide.subtitle}
                  </span>
                </div>

                <h1 className="font-playfair text-[#F6F5F2] text-4xl sm:text-5xl lg:text-5xl mb-6 leading-tight whitespace-pre-line">
                  {isFirstSlide ? (
                    <>
                      {animatedTitle}
                      <span
                        className="inline-block w-[2px] h-[0.85em] ml-1 align-middle"
                        style={{
                          backgroundColor: "#F6F5F2",
                          animation: "blink 1s step-end infinite",
                          opacity: animatedTitle.length >= firstSlideTitle.length ? 0 : 1,
                        }}
                      />
                    </>
                  ) : (
                    slide.title
                  )}
                </h1>

                <p className="font-light text-sm leading-relaxed mb-10 max-w-[320px]" style={{ color: "#8A8A8A", letterSpacing: "0.02em" }}>
                  {slide.description}
                </p>

                <a
                  href={slide.button_link}
                  className="inline-flex items-center gap-3 font-light text-xs tracking-[0.15em] uppercase border px-8 py-3 ease-out duration-300"
                  style={{ borderColor: "#F6F5F2", color: "#F6F5F2" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "#F6F5F2";
                    el.style.color = "#0A0A0A";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.color = "#F6F5F2";
                  }}
                >
                  {slide.button_text}
                </a>
              </div>

              <div className="relative w-full sm:w-[50%] h-[300px] sm:h-full overflow-hidden flex justify-center items-center opacity-90">
                <Image src={slide.image_url} alt={slide.title} fill className="object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #0A0A0A, transparent)" }}></div>
              </div>
            </div>
          </SwiperSlide>
        );
      })}

      <div dangerouslySetInnerHTML={{ __html: `<style>@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }</style>` }} />
    </Swiper>
  );
};

export default HeroCarousal;
