"use client";
import React from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { affiliateFeatureData } from "./affiliateFeatureData";

/* ─── SVG icon map ─────────────────────────────────────────── */
const IconMap: Record<string, React.ReactNode> = {
  verified: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  transparency: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 8v4l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 5.5l1 1M15.5 5.5l-1 1M5.5 8.5l1 1M5.5 15.5l1-1"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  ),
  ai: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1z"
        fill="currentColor"
      />
      <path
        d="M4.929 4.929a1 1 0 0 1 1.414 0l.707.707a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 0-1.414z"
        fill="currentColor"
      />
      <path
        d="M18.364 5.636a1 1 0 0 0-1.414 0l-.707.707a1 1 0 0 0 1.414 1.414l.707-.707a1 1 0 0 0 0-1.414z"
        fill="currentColor"
      />
      <circle cx="12" cy="13" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 13l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 18v3M8 21h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  trending: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M23 6l-9.5 9.5-5-5L1 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 6h6v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  discount: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
      <path
        d="M15 9l-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const HeroFeature = () => {
  const { ref, revealClass, baseClass } = useScrollReveal(0.1);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 ${baseClass} ${revealClass}`}
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mt-10 pt-10"
        style={{ borderTop: "1px solid #E8E4DF" }}
      >
        {affiliateFeatureData.map((item, key) => (
          <div
            className="flex items-start gap-4"
            key={key}
            style={{
              transitionDelay: `${key * 80}ms`,
            }}
          >
            <span
              className="flex-shrink-0 mt-0.5"
              style={{ color: "#1A1A1A" }}
            >
              {IconMap[item.icon]}
            </span>
            <div>
              <h3
                className="font-light text-sm tracking-wide text-dark mb-1"
                style={{ letterSpacing: "0.04em" }}
              >
                {item.title}
              </h3>
              <p className="text-xs font-light" style={{ color: "#8A8A8A" }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
