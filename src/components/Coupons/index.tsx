"use client";
import React, { useState, useEffect, useCallback } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { createClient } from "@/lib/supabase/client";

// ─── DB type (matches actual Supabase schema) ─────────────────────────────────
type Coupon = {
    id: number;
    code: string;
    store_name: string;
    discount_percent: number; // legacy
    discount_type?: "percentage" | "fixed" | null;
    discount_value?: number | null;
    max_discount_value?: number | null;
    min_order_value?: number | null;
    affiliate_link: string | null;
    image_url: string | null;
    start_date: string;
    end_date: string;
    is_active: boolean | null;
    created_at: string | null;
    user_id?: string | null;
    profiles?: { full_name: string | null } | null;
};

// ─── Countdown per coupon ─────────────────────────────────────────────────────
function useCountdown(endDate: string) {
    const calc = useCallback(() => {
        const delta = Math.max(0, new Date(endDate).getTime() - Date.now());
        return {
            d: Math.floor(delta / 86400000),
            h: Math.floor((delta % 86400000) / 3600000),
            m: Math.floor((delta % 3600000) / 60000),
            s: Math.floor((delta % 60000) / 1000),
            expired: delta === 0,
        };
    }, [endDate]);

    const [time, setTime] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    }, [calc]);
    return time;
}

// ─── Coupon Card ──────────────────────────────────────────────────────────────
const CouponCard = ({ coupon }: { coupon: Coupon }) => {
    const [copied, setCopied] = useState(false);
    const countdown = useCountdown(coupon.end_date);

    const daysLeft = Math.ceil((new Date(coupon.end_date).getTime() - Date.now()) / 86400000);
    const expiringSoon = daysLeft > 0 && daysLeft <= 7;
    const isExpired = daysLeft <= 0;

    const copy = () => {
        navigator.clipboard.writeText(coupon.code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-white border border-[#E8E4DF] overflow-hidden"
            style={{ opacity: isExpired ? 0.55 : 1 }}>
            {/* Top bar */}
            <div className="h-1" style={{ background: isExpired ? "#C8C4BF" : "#0A0A0A" }} />

            <div className="p-5">
                {/* Store + discount */}
                <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="min-w-0">
                        <span className="block text-[10px] font-light tracking-[0.22em] uppercase text-[#8A8A8A] mb-1">
                            {coupon.store_name}
                        </span>
                        {coupon.image_url && (
                            <img src={coupon.image_url} alt={coupon.store_name}
                                className="h-5 object-contain opacity-70 mb-1"
                                loading="lazy" />
                        )}
                        {coupon.profiles?.full_name && (
                            <span className="inline-block mt-1 text-[9px] font-medium tracking-widest uppercase bg-[#F6F5F2] text-[#4A4A4A] px-2 py-0.5 border border-[#E8E4DF]">
                                Added by {coupon.profiles.full_name}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="flex-shrink-0 font-playfair text-3xl font-normal text-dark leading-none"
                            style={{ letterSpacing: "-0.03em" }}>
                            {coupon.discount_type === "fixed" ? `$${coupon.discount_value || coupon.discount_percent}` : `${coupon.discount_value || coupon.discount_percent}%`}
                            <span className="text-sm font-light ml-0.5 text-[#8A8A8A]">off</span>
                        </span>
                        {(coupon.max_discount_value || coupon.min_order_value) && (
                            <span className="text-[9px] text-[#8A8A8A] mt-1 text-right">
                                {coupon.max_discount_value && `Up to $${coupon.max_discount_value} `}
                                {coupon.min_order_value && `(Min $${coupon.min_order_value})`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Countdown timer */}
                {!isExpired && (
                    <div className="flex items-center gap-1.5 mb-4">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                            stroke={expiringSoon ? "#C0392B" : "#8A8A8A"} strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                        <span className="text-[10px] font-light"
                            style={{ color: expiringSoon ? "#C0392B" : "#8A8A8A" }}>
                            {expiringSoon ? "⚠ Ending soon — " : "Expires in "}
                            {countdown.d > 0 ? `${countdown.d}d ` : ""}
                            {`${String(countdown.h).padStart(2, "0")}h `}
                            {`${String(countdown.m).padStart(2, "0")}m `}
                            {`${String(countdown.s).padStart(2, "0")}s`}
                        </span>
                    </div>
                )}
                {isExpired && (
                    <p className="text-[10px] text-[#C8C4BF] font-light mb-4">This coupon has expired</p>
                )}

                {/* Code + copy */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 py-2 px-3 font-mono text-sm text-center"
                        style={{
                            border: "1px dashed #C8C4BF", background: "#F6F5F2",
                            letterSpacing: "0.18em", color: "#1A1A1A"
                        }}>
                        {coupon.code}
                    </div>
                    <button
                        onClick={copy}
                        disabled={isExpired}
                        className="px-4 py-2 text-xs font-light tracking-[0.1em] uppercase transition-all duration-200 whitespace-nowrap"
                        style={copied
                            ? { background: "#16a34a", color: "#fff", border: "1px solid #16a34a" }
                            : { background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}>
                        {copied ? "✓ Copied" : "Copy"}
                    </button>
                </div>

                {/* Affiliate link */}
                {coupon.affiliate_link && !isExpired && (
                    <a href={coupon.affiliate_link} target="_blank" rel="noopener noreferrer"
                        className="block w-full py-2 text-center text-xs font-light tracking-[0.12em] uppercase border border-[#E8E4DF] text-[#4A4A4A] hover:border-[#0A0A0A] hover:text-dark transition-all duration-200">
                        Shop at {coupon.store_name} →
                    </a>
                )}
            </div>
        </div>
    );
};

// ─── Fallback data ─────────────────────────────────────────────────────────────
const MOCK_COUPONS: Coupon[] = [
    { id: 1, code: "FITOVA20", store_name: "Fitova", discount_percent: 20, affiliate_link: "#", image_url: null, start_date: "2026-01-01", end_date: "2026-12-31", is_active: true, created_at: null, profiles: { full_name: "Admin" } },
    { id: 2, code: "ZARA15", store_name: "Zara", discount_percent: 15, affiliate_link: "#", image_url: null, start_date: "2026-01-01", end_date: "2026-06-30", is_active: true, created_at: null, profiles: null },
    { id: 3, code: "HM30", store_name: "H&M", discount_percent: 30, affiliate_link: "#", image_url: null, start_date: "2026-01-01", end_date: "2026-05-31", is_active: true, created_at: null, profiles: { full_name: "John Doe" } },
    { id: 4, code: "UNIQLO10", store_name: "Uniqlo", discount_percent: 10, affiliate_link: "#", image_url: null, start_date: "2026-01-01", end_date: "2026-03-10", is_active: true, created_at: null, profiles: null },
    { id: 5, code: "NIKE25", store_name: "Nike", discount_percent: 25, affiliate_link: "#", image_url: null, start_date: "2026-01-01", end_date: "2026-04-15", is_active: true, created_at: null, profiles: null },
    { id: 6, code: "LEVIS35", store_name: "Levi's", discount_percent: 35, affiliate_link: "#", image_url: null, start_date: "2026-01-01", end_date: "2026-08-31", is_active: true, created_at: null, profiles: null },
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Coupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "active" | "expiring">("all");

    useEffect(() => {
        async function load() {
            try {
                const supabase = createClient();

                // 1. Fetch coupons
                const { data, error } = await supabase
                    .from("coupons")
                    .select("*")
                    .eq("is_active", true)
                    .order("end_date", { ascending: true });

                if (error) {
                    console.error("Error fetching coupons:", error.message, error.details);
                    setCoupons(MOCK_COUPONS);
                    setLoading(false);
                    return;
                }

                if (!data || data.length === 0) {
                    setCoupons([]);
                    setLoading(false);
                    return;
                }

                let couponsData = data as Coupon[];

                // 2. Extract unique user IDs
                const userIds = Array.from(new Set(couponsData.map(c => c.user_id).filter(Boolean))) as string[];

                // 3. Fetch profiles for those user IDs manually to avoid PostgREST relationship cache issues
                if (userIds.length > 0) {
                    const { data: profilesData, error: profilesError } = await supabase
                        .from("profiles")
                        .select("id, full_name")
                        .in("id", userIds);

                    if (!profilesError && profilesData) {
                        // Create a map for fast lookup
                        const profileMap = profilesData.reduce((acc, profile) => {
                            acc[profile.id] = profile.full_name;
                            return acc;
                        }, {} as Record<string, string | null>);

                        // Attach profile names to coupons
                        couponsData = couponsData.map(coupon => ({
                            ...coupon,
                            profiles: coupon.user_id && profileMap[coupon.user_id]
                                ? { full_name: profileMap[coupon.user_id] }
                                : null
                        }));
                    }
                }

                setCoupons(couponsData);
            } catch (err) {
                console.error("Exception fetching coupons:", err);
                setCoupons(MOCK_COUPONS);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = coupons.filter(c => {
        const daysLeft = Math.ceil((new Date(c.end_date).getTime() - Date.now()) / 86400000);
        if (filter === "active") return daysLeft > 0;
        if (filter === "expiring") return daysLeft > 0 && daysLeft <= 7;
        return true;
    });

    return (
        <main style={{ background: "#F6F5F2" }}>
            <Breadcrumb title="Coupons" pages={["coupons"]} />

            {/* Hero */}
            <section className="flex flex-col items-center justify-center text-center pt-12 pb-14 px-4"
                style={{ background: "#0A0A0A" }}>
                <span className="block text-xs font-light tracking-[0.35em] uppercase mb-5"
                    style={{ color: "rgba(246,245,242,0.45)" }}>
                    Exclusive Savings
                </span>
                <h1 className="font-playfair text-4xl md:text-5xl font-normal mb-4"
                    style={{ color: "#F6F5F2", letterSpacing: "-0.03em" }}>
                    Discount Coupons
                </h1>
                <p className="font-light text-sm max-w-md leading-relaxed mb-6"
                    style={{ color: "rgba(246,245,242,0.5)" }}>
                    Copy a code and apply it at checkout. All codes are verified and updated regularly.
                </p>
                <a href="/my-account?tab=coupons-tab"
                    className="inline-block px-6 py-3 border border-[rgba(246,245,242,0.3)] text-xs font-light tracking-[0.15em] uppercase transition-colors duration-200 hover:bg-[#F6F5F2] hover:text-[#0A0A0A]"
                    style={{ color: "#F6F5F2" }}>
                    + Share a Coupon
                </a>
            </section>

            {/* Filters + count */}
            <section className="sticky top-[72px] z-10 bg-[#F6F5F2] border-b border-[#E8E4DF]">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 py-4 flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {(["all", "active", "expiring"] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className="px-4 py-1.5 text-xs font-light tracking-[0.12em] uppercase transition-all duration-200 capitalize"
                                style={filter === f
                                    ? { background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }
                                    : { background: "transparent", color: "#8A8A8A", border: "1px solid #C8C4BF" }}>
                                {f === "expiring" ? "Ending Soon" : f}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs font-light text-[#8A8A8A] flex-shrink-0">
                        {filtered.length} coupon{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </section>

            {/* Grid */}
            <section className="py-14">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse bg-white border border-[#E8E4DF] p-5">
                                    <div className="h-2 bg-[#E8E4DF] rounded w-1/3 mb-3" />
                                    <div className="h-8 bg-[#E8E4DF] rounded w-1/4 mb-4" />
                                    <div className="h-9 bg-[#E8E4DF] rounded mb-3" />
                                    <div className="h-8 bg-[#E8E4DF] rounded" />
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="font-playfair text-2xl text-dark mb-2">No coupons found</p>
                            <p className="text-sm font-light text-[#8A8A8A]">Check back soon for new deals.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map(c => <CouponCard key={c.id} coupon={c} />)}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
