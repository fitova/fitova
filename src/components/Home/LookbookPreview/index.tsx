"use client";
import React from "react";
import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const looks = [
    { id: 1, title: "Urban Minimal", tag: "AI", bg: "linear-gradient(135deg, #0A0A0A 0%, #2C2C2C 100%)" },
    { id: 2, title: "Golden Hour", tag: "Trending", bg: "linear-gradient(135deg, #2C1810 0%, #7A4028 100%)" },
    { id: 3, title: "Power Office", tag: "AI", bg: "linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)" },
    { id: 4, title: "Weekend Edit", tag: "Trending", bg: "linear-gradient(135deg, #1A1A1A 0%, #404040 100%)" },
];

const LookbookPreview = () => {
    const head = useScrollReveal();
    const grid = useScrollReveal(0.05);

    return (
        <section className="py-20">
            <div
                className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15"
                style={{ borderBottom: "1px solid #E8E4DF" }}
            >
                {/* Section header */}
                <div
                    ref={head.ref as React.RefObject<HTMLDivElement>}
                    className={`mb-10 flex items-center justify-between ${head.baseClass} ${head.revealClass}`}
                >
                    <div>
                        <span
                            className="flex items-center gap-2.5 text-xs font-light tracking-[0.25em] uppercase mb-3"
                            style={{ color: "#8A8A8A" }}
                        >
                            {/* Thin-stroke grid icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" stroke="#8A8A8A" strokeWidth="1.5" />
                                <rect x="14" y="3" width="7" height="7" stroke="#8A8A8A" strokeWidth="1.5" />
                                <rect x="3" y="14" width="7" height="7" stroke="#8A8A8A" strokeWidth="1.5" />
                                <rect x="14" y="14" width="7" height="7" stroke="#8A8A8A" strokeWidth="1.5" />
                            </svg>
                            Lookbook
                        </span>
                        <h2
                            className="font-playfair font-normal text-3xl xl:text-4xl text-dark"
                            style={{ letterSpacing: "-0.02em" }}
                        >
                            Curated Collections
                        </h2>
                    </div>
                    <Link
                        href="/lookbook"
                        className="hidden sm:inline-flex items-center gap-2 font-light text-xs tracking-[0.15em] uppercase border border-dark text-dark px-6 py-2.5 ease-out duration-300 hover:bg-dark hover:text-white"
                    >
                        View All
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>

                {/* Preview grid */}
                <div
                    ref={grid.ref as React.RefObject<HTMLDivElement>}
                    className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${grid.baseClass} ${grid.revealClass}`}
                >
                    {looks.map((look, i) => (
                        <Link
                            key={look.id}
                            href="/lookbook"
                            className="group relative overflow-hidden block"
                            style={{ transitionDelay: `${i * 80}ms` }}
                        >
                            {/* Dark editorial panel */}
                            <div
                                className="h-72 w-full ease-out duration-500 group-hover:scale-[1.03]"
                                style={{ background: look.bg }}
                            />

                            {/* Bottom overlay */}
                            <div
                                className="absolute inset-0 flex flex-col justify-end p-5"
                                style={{
                                    background:
                                        "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)",
                                }}
                            >
                                <span
                                    className="block text-[9px] font-light tracking-[0.25em] uppercase mb-1.5"
                                    style={{ color: "rgba(246,245,242,0.55)" }}
                                >
                                    {look.tag}
                                </span>
                                <h3
                                    className="font-playfair text-base font-normal ease-out duration-200 group-hover:opacity-80"
                                    style={{ color: "#F6F5F2" }}
                                >
                                    {look.title}
                                </h3>
                            </div>

                            {/* Thin border reveal on hover */}
                            <div
                                className="absolute inset-0 border border-white/0 ease-out duration-300 group-hover:border-white/20"
                            />
                        </Link>
                    ))}
                </div>

                {/* Mobile view all */}
                <div className="text-center mt-8 sm:hidden">
                    <Link
                        href="/lookbook"
                        className="inline-flex items-center gap-2 font-light text-xs tracking-[0.15em] uppercase border border-dark text-dark px-8 py-3 ease-out duration-300 hover:bg-dark hover:text-white"
                    >
                        View All Looks
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default LookbookPreview;
