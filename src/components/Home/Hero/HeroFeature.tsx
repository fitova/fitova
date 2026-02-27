"use client";
import React from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const featureData = [
  {
    title: "Free Shipping",
    description: "On all orders over $200",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M1 3h15v13H1V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M16 8h4l3 4v5h-7V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="5.5" cy="18.5" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18.5" cy="18.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Easy Returns",
    description: "Hassle-free within 30 days",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-5.5 1.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 4v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Secure Payments",
    description: "256-bit SSL encryption",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    description: "We're always here for you",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const HeroFeature = () => {
  const { ref, revealClass, baseClass } = useScrollReveal(0.1);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 ${baseClass} ${revealClass}`}
    >
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-10 pt-10"
        style={{ borderTop: "1px solid #E8E4DF" }}
      >
        {featureData.map((item, key) => (
          <div className="flex items-start gap-4" key={key}>
            <span
              className="flex-shrink-0 mt-0.5"
              style={{ color: "#1A1A1A" }}
            >
              {item.icon}
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
