"use client";
import React, { useState, useEffect } from "react";
// ⚠ DATABASE CONFIGURATION REQUIRED HERE
// يجب وضع بيانات قاعدة البيانات الجديدة هنا

type Coupon = {
    id: string;
    code: string;
    brand: string;
    description: string;
    discountType: "Percentage" | "Fixed";
    discountValue: number;
    validTo: string;
    category: string;
};

const FALLBACK_COUPONS: Coupon[] = [
    { id: "1", code: "FITOVA10", brand: "Fitova", description: "Get 10% off your first order", discountType: "Percentage", discountValue: 10, validTo: "2026-12-31", category: "All" },
    { id: "2", code: "STYLE20", brand: "Fitova", description: "20% off selected styles", discountType: "Percentage", discountValue: 20, validTo: "2026-03-31", category: "Selected" },
    { id: "3", code: "SAVE50", brand: "Fitova", description: "Save $50 on orders above $200", discountType: "Fixed", discountValue: 50, validTo: "2026-04-30", category: "All" },
];

export default function Coupons() {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [coupons, setCoupons] = useState<Coupon[]>(FALLBACK_COUPONS);

    useEffect(() => {
        // ⚠ DATABASE CONFIGURATION REQUIRED HERE
        // يجب وضع بيانات قاعدة البيانات الجديدة هنا
    }, []);

    const copyCode = (id: string, code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const isExpiringSoon = (dateStr: string) => {
        const diffDays = Math.ceil(
            (new Date(dateStr).getTime() - Date.now()) / 86400000
        );
        return diffDays <= 7;
    };

    return (
        <main style={{ background: "#F6F5F2" }}>

            {/* ── Hero ────────────────────────────────────────────── */}
            <section
                className="flex flex-col items-center justify-center text-center pt-[120px] lg:pt-[180px] pb-20 px-4"
                style={{ background: "#0A0A0A" }}
            >
                <span
                    className="block text-xs font-light tracking-[0.35em] uppercase mb-6"
                    style={{ color: "rgba(246,245,242,0.45)" }}
                >
                    Exclusive Savings
                </span>
                <h1
                    className="font-playfair text-5xl md:text-6xl font-normal mb-5"
                    style={{ color: "#F6F5F2", letterSpacing: "-0.03em" }}
                >
                    Coupons
                </h1>
                <p
                    className="font-light text-sm max-w-md leading-relaxed"
                    style={{ color: "rgba(246,245,242,0.5)" }}
                >
                    All your discount codes in one place. Copy a code and apply it at checkout to save on your favorite brands.
                </p>
            </section>

            {/* ── Grid ────────────────────────────────────────────── */}
            <section className="py-16">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {coupons.map((coupon) => (
                            <div
                                key={coupon.id}
                                className="overflow-hidden"
                                style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}
                            >
                                {/* Top accent bar */}
                                <div
                                    className="h-1"
                                    style={{ background: "#0A0A0A" }}
                                />

                                <div className="p-6">
                                    {/* Brand + discount */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <span
                                                className="block text-[10px] font-light tracking-[0.2em] uppercase mb-1"
                                                style={{ color: "#8A8A8A" }}
                                            >
                                                {coupon.brand} · {coupon.category}
                                            </span>
                                            <p
                                                className="text-sm font-light text-dark leading-relaxed"
                                                style={{ maxWidth: "220px" }}
                                            >
                                                {coupon.description}
                                            </p>
                                        </div>
                                        <span
                                            className="flex-shrink-0 ml-3 font-playfair text-2xl font-normal text-dark"
                                            style={{ letterSpacing: "-0.02em" }}
                                        >
                                            {coupon.discountType === "Percentage"
                                                ? `${coupon.discountValue}%`
                                                : `$${coupon.discountValue}`}
                                        </span>
                                    </div>

                                    {/* Code box */}
                                    <div className="flex items-center gap-2 mt-4">
                                        <div
                                            className="flex-1 py-2 px-3 font-mono text-sm font-light tracking-widest text-center"
                                            style={{
                                                border: "1px dashed #C8C4BF",
                                                background: "#F6F5F2",
                                                color: "#1A1A1A",
                                                letterSpacing: "0.15em",
                                            }}
                                        >
                                            {coupon.code}
                                        </div>
                                        <button
                                            onClick={() => copyCode(coupon.id, coupon.code)}
                                            className="px-4 py-2 text-xs font-light tracking-[0.1em] uppercase ease-out duration-200"
                                            style={
                                                copiedId === coupon.id
                                                    ? { background: "#1A1A1A", color: "#F6F5F2", border: "1px solid #1A1A1A" }
                                                    : { background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }
                                            }
                                        >
                                            {copiedId === coupon.id ? "✓" : "Copy"}
                                        </button>
                                    </div>

                                    {/* Expiry */}
                                    <div className="flex items-center justify-between mt-3">
                                        <span
                                            className="text-[10px] font-light"
                                            style={{ color: "#C8C4BF" }}
                                        >
                                            Expires {coupon.validTo}
                                        </span>
                                        {isExpiringSoon(coupon.validTo) && (
                                            <span
                                                className="text-[10px] font-light tracking-[0.1em] uppercase"
                                                style={{ color: "#C0392B" }}
                                            >
                                                Expiring Soon
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
