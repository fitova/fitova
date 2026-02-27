"use client";
import React from "react";

const brands: { name: string; svg: React.ReactNode }[] = [
    {
        name: "ZARA",
        svg: <svg viewBox="0 0 90 28" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto"><text x="2" y="22" fontFamily="Georgia,serif" fontSize="22" letterSpacing="5" fill="#1a1a1a" fontWeight="300">ZARA</text></svg>,
    },
    {
        name: "H&M",
        svg: <svg viewBox="0 0 64 28" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto"><text x="2" y="22" fontFamily="Arial,sans-serif" fontSize="20" letterSpacing="3" fill="#cc0000" fontWeight="700">H&amp;M</text></svg>,
    },
    {
        name: "MANGO",
        svg: <svg viewBox="0 0 115 28" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto"><text x="2" y="22" fontFamily="Georgia,serif" fontSize="21" letterSpacing="4" fill="#1a1a1a" fontWeight="300">MANGO</text></svg>,
    },
    {
        name: "NIKE",
        svg: (
            <svg viewBox="0 0 80 28" fill="#1a1a1a" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
                <path d="M3 19 C18 3, 52 1, 77 10 C58 17, 18 30, 3 19Z" />
            </svg>
        ),
    },
    {
        name: "ADIDAS",
        svg: (
            <svg viewBox="0 0 70 28" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
                <polygon points="35,2 68,26 2,26" fill="none" stroke="#1a1a1a" strokeWidth="2.2" />
                <line x1="22" y1="26" x2="35" y2="6" stroke="#1a1a1a" strokeWidth="2.8" />
                <line x1="35" y1="26" x2="35" y2="2" stroke="#1a1a1a" strokeWidth="2.8" />
                <line x1="48" y1="26" x2="35" y2="6" stroke="#1a1a1a" strokeWidth="2.8" />
            </svg>
        ),
    },
    {
        name: "PRADA",
        svg: <svg viewBox="0 0 110 28" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto"><text x="2" y="22" fontFamily="Georgia,serif" fontSize="21" letterSpacing="5" fill="#1a1a1a" fontWeight="400">PRADA</text></svg>,
    },
    {
        name: "GUCCI",
        svg: <svg viewBox="0 0 100 28" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto"><text x="2" y="22" fontFamily="Georgia,serif" fontSize="21" letterSpacing="5" fill="#1a1a1a" fontWeight="400">GUCCI</text></svg>,
    },
    {
        name: "CHANEL",
        svg: (
            <svg viewBox="0 0 44 32" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
                <circle cx="14" cy="16" r="11" fill="none" stroke="#1a1a1a" strokeWidth="2.2" />
                <circle cx="30" cy="16" r="11" fill="none" stroke="#1a1a1a" strokeWidth="2.2" />
                <rect x="14" y="5" width="16" height="22" fill="white" />
                <path d="M14,7 Q22,5 30,7" fill="none" stroke="#1a1a1a" strokeWidth="2.2" />
                <path d="M14,25 Q22,27 30,25" fill="none" stroke="#1a1a1a" strokeWidth="2.2" />
            </svg>
        ),
    },
    {
        name: "DIOR",
        svg: <svg viewBox="0 0 90 28" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto"><text x="2" y="22" fontFamily="Georgia,serif" fontSize="21" letterSpacing="9" fill="#1a1a1a" fontWeight="300">DIOR</text></svg>,
    },
    {
        name: "BALENCIAGA",
        svg: <svg viewBox="0 0 200 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto"><text x="2" y="18" fontFamily="Arial,Helvetica,sans-serif" fontSize="14" letterSpacing="5" fill="#1a1a1a" fontWeight="400">BALENCIAGA</text></svg>,
    },
    {
        name: "ASOS",
        svg: <svg viewBox="0 0 76 28" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto"><text x="2" y="22" fontFamily="Arial,sans-serif" fontSize="20" letterSpacing="3" fill="#1a1a1a" fontWeight="800">ASOS</text></svg>,
    },
    {
        name: "LV",
        svg: <svg viewBox="0 0 52 32" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto"><text x="0" y="26" fontFamily="Georgia,serif" fontSize="30" fill="#1a1a1a" fontWeight="400">LV</text></svg>,
    },
    {
        name: "BERSHKA",
        svg: <svg viewBox="0 0 130 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto"><text x="2" y="18" fontFamily="Arial,sans-serif" fontSize="15" letterSpacing="4" fill="#1a1a1a" fontWeight="600">BERSHKA</text></svg>,
    },
    {
        name: "PULL&BEAR",
        svg: <svg viewBox="0 0 150 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto"><text x="2" y="18" fontFamily="Arial,sans-serif" fontSize="14" letterSpacing="3" fill="#1a1a1a" fontWeight="600">PULL&amp;BEAR</text></svg>,
    },
    {
        name: "MASSIMO DUTTI",
        svg: <svg viewBox="0 0 215 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto"><text x="2" y="18" fontFamily="Georgia,serif" fontSize="15" letterSpacing="4" fill="#1a1a1a" fontWeight="300">MASSIMO DUTTI</text></svg>,
    },
    {
        name: "SHEIN",
        svg: <svg viewBox="0 0 90 28" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto"><text x="2" y="22" fontFamily="Arial,sans-serif" fontSize="20" letterSpacing="3" fill="#1a1a1a" fontWeight="700">SHEIN</text></svg>,
    },
    {
        name: "RALPH LAUREN",
        svg: <svg viewBox="0 0 182 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto"><text x="2" y="18" fontFamily="Georgia,serif" fontSize="16" letterSpacing="4" fill="#1a1a1a" fontWeight="300">RALPH LAUREN</text></svg>,
    },
    {
        name: "CALVIN KLEIN",
        svg: <svg viewBox="0 0 178 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto"><text x="2" y="18" fontFamily="Arial,Helvetica,sans-serif" fontSize="14" letterSpacing="5" fill="#1a1a1a" fontWeight="400">CALVIN KLEIN</text></svg>,
    },
    {
        name: "VERSACE",
        svg: <svg viewBox="0 0 118 28" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto"><text x="2" y="22" fontFamily="Georgia,serif" fontSize="21" letterSpacing="4" fill="#1a1a1a" fontWeight="400">VERSACE</text></svg>,
    },
    {
        name: "VALENTINO",
        svg: <svg viewBox="0 0 152 28" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto"><text x="2" y="21" fontFamily="Georgia,serif" fontSize="18" letterSpacing="5" fill="#1a1a1a" fontWeight="300">VALENTINO</text></svg>,
    },
    {
        name: "BURBERRY",
        svg: <svg viewBox="0 0 148 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto"><text x="2" y="18" fontFamily="Georgia,serif" fontSize="16" letterSpacing="5" fill="#1a1a1a" fontWeight="300">BURBERRY</text></svg>,
    },
    {
        name: "GIVENCHY",
        svg: <svg viewBox="0 0 148 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto"><text x="2" y="18" fontFamily="Georgia,serif" fontSize="16" letterSpacing="5" fill="#1a1a1a" fontWeight="300">GIVENCHY</text></svg>,
    },
    {
        name: "TOMMY HILFIGER",
        svg: <svg viewBox="0 0 220 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto"><text x="2" y="18" fontFamily="Arial,sans-serif" fontSize="13" letterSpacing="4" fill="#cc0000" fontWeight="700">TOMMY HILFIGER</text></svg>,
    },
    {
        name: "FENDI",
        svg: <svg viewBox="0 0 90 28" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto"><text x="2" y="22" fontFamily="Georgia,serif" fontSize="21" letterSpacing="6" fill="#1a1a1a" fontWeight="400">FENDI</text></svg>,
    },
];

/* ── Single track (renders the full brand list once) ─────────────────── */
const Track = ({ hidden = false }: { hidden?: boolean }) => (
    <div
        /* .brand-track is defined in style.css — scrollRTL animation */
        className="brand-track"
        aria-hidden={hidden}
    >
        {brands.map((brand, i) => (
            <span
                key={hidden ? `dup-${i}` : `b-${i}`}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    margin: "0 2.25rem",
                    opacity: 0.55,
                    transition: "opacity 0.3s",
                }}
                title={brand.name}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.55")}
            >
                {brand.svg}
                <span
                    style={{
                        display: "inline-block",
                        width: "1px",
                        height: "14px",
                        background: "#d0d0d0",
                        marginLeft: "2.25rem",
                    }}
                    aria-hidden="true"
                />
            </span>
        ))}
    </div>
);

/* ── BrandMarquee ────────────────────────────────────────────────────── */
const BrandMarquee = () => (
    <section
        style={{
            background: "#ffffff",
            borderTop: "1px solid #e4e4e4",
            borderBottom: "1px solid #e4e4e4",
            paddingTop: "28px",
            paddingBottom: "24px",
            overflow: "hidden",
            width: "100%",
        }}
    >
        {/* label */}
        <p
            style={{
                textAlign: "center",
                fontFamily: "Arial, sans-serif",
                fontSize: "10px",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "rgba(0,0,0,0.3)",
                marginBottom: "20px",
            }}
        >
            Trusted by lovers of
        </p>

        {/* scrolling row — two identical tracks for seamless loop */}
        <div style={{ display: "flex", whiteSpace: "nowrap" }}>
            <Track />
            <Track hidden />
        </div>
    </section>
);

export default BrandMarquee;
