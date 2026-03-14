"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import ProductGridCard from "@/components/Shop/ProductGridCard";
import { useCurrentUser } from "@/app/context/AuthContext";
import { Product } from "@/types/product";

// ── Types ──────────────────────────────────────────────────────────
type Analysis = {
    gender: string;
    hair_color: string;
    skin_tone: string;
    face_shape: string;
    body_type: string;
    body_frame: string;
};

type MirrorResult = {
    analysis: Analysis;
    styles: string[];
    recommended_colors: string[];
    tops: string[];
    bottoms: string[];
    shoes: string[];
    summary: string;
    originalImageUrl: string;
    generatedImageUrl: string | null;
    shareToken: string | null;
    suggestedProducts: Product[];
};

type SkeletonPhase = "none" | "basic" | "profile" | "styles" | "colors" | "done";

const CACHE_KEY = "mirror-style-cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h

const COLOR_HEX: Record<string, string> = {
    black: "#1A1A1A", white: "#FFFFFF", navy: "#1B2A4A", red: "#C0392B",
    green: "#27AE60", beige: "#D4C5A9", grey: "#9E9E9E", brown: "#795548",
    olive: "#808000", burgundy: "#800020", camel: "#C19A6B", cream: "#FFFDD0",
    blue: "#2980B9", pink: "#E91E8C", orange: "#E67E22",
};

// ── SVG Icons for Profile Fields ───────────────────────────────────
const ProfileIcons: Record<keyof Analysis, React.FC<{ size?: number }>> = {
    gender: ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M20 20c0-4.4-3.6-8-8-8s-8 3.6-8 8" />
        </svg>
    ),
    hair_color: ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 3C7 3 3 7 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 7 17 3 17 3" />
            <path d="M12 2C9.5 2 7.5 5 7.5 5M12 2C14.5 2 16.5 5 16.5 5" />
            <path d="M10 7C10 7 10 11 12 11C14 11 14 7 14 7" />
        </svg>
    ),
    skin_tone: ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3c2 3 3 6 3 9s-1 6-3 9" />
            <path d="M3 12h18" />
        </svg>
    ),
    face_shape: ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2c4 0 7 3 7 7v4c0 3-2 6-7 8-5-2-7-5-7-8V9c0-4 3-7 7-7z" />
            <path d="M9 14s1 1 3 1 3-1 3-1" />
            <line x1="9" y1="10" x2="9.01" y2="10" strokeWidth="2" />
            <line x1="15" y1="10" x2="15.01" y2="10" strokeWidth="2" />
        </svg>
    ),
    body_type: ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="4" r="2" />
            <path d="M8 10h8l-1 6H9L8 10z" />
            <line x1="9" y1="16" x2="7" y2="22" />
            <line x1="15" y1="16" x2="17" y2="22" />
            <line x1="12" y1="10" x2="12" y2="16" />
        </svg>
    ),
    body_frame: ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="22" />
            <polyline points="8,6 12,2 16,6" />
            <polyline points="8,18 12,22 16,18" />
            <line x1="8" y1="9" x2="12" y2="9" />
            <line x1="8" y1="12" x2="12" y2="12" />
            <line x1="8" y1="15" x2="12" y2="15" />
        </svg>
    ),
};

const ANALYSIS_LABELS: Record<keyof Analysis, string> = {
    gender: "Gender", hair_color: "Hair Color", skin_tone: "Skin Tone",
    face_shape: "Face Shape", body_type: "Body Type", body_frame: "Body Frame",
};

// ── Social Share Icons ──────────────────────────────────────────────
const WhatsAppIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const FacebookIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const XTwitterIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

// ── Skeleton Block ─────────────────────────────────────────────────
function SkeletonBlock({ h = "h-4", w = "w-full", rounded = "" }: { h?: string; w?: string; rounded?: string }) {
    return <div className={`animate-pulse bg-[#E8E4DF] ${h} ${w} ${rounded}`} />;
}

// ── Main Component ─────────────────────────────────────────────────
export default function MirrorStyle() {
    const { user } = useCurrentUser();

    const [dragOver, setDragOver] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [skeletonPhase, setSkeletonPhase] = useState<SkeletonPhase>("none");
    const [result, setResult] = useState<MirrorResult | null>(null);
    const [fileName, setFileName] = useState("");
    const [localPreview, setLocalPreview] = useState(""); // client-side preview before upload
    const [errorMsg, setErrorMsg] = useState("");
    const [shareLink, setShareLink] = useState("");
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // ── Restore from localStorage cache ───────────────────────────
    useEffect(() => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return;
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION && data) {
                setResult(data);
                setLocalPreview(data.originalImageUrl || "");
                setUploaded(true);
                if (data.shareToken) {
                    setShareLink(`${window.location.origin}/mirror-style/share/${data.shareToken}`);
                }
            } else {
                localStorage.removeItem(CACHE_KEY);
            }
        } catch {
            localStorage.removeItem(CACHE_KEY);
        }
    }, []);

    // ── Save to localStorage cache ─────────────────────────────────
    const saveToCache = (data: MirrorResult) => {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        } catch { }
    };

    // ── Progressive skeleton phases ────────────────────────────────
    const runSkeletonPhases = async () => {
        const phases: SkeletonPhase[] = ["basic", "profile", "styles", "colors"];
        for (const phase of phases) {
            setSkeletonPhase(phase);
            await new Promise(res => setTimeout(res, 1400));
        }
    };

    // ── Handle file upload ──────────────────────────────────────────
    const handleFile = (file: File) => {
        setFileName(file.name);
        setUploaded(true);
        setAnalyzing(true);
        setResult(null);
        setErrorMsg("");
        setShareLink("");
        setSkeletonPhase("none");
        localStorage.removeItem(CACHE_KEY);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setLocalPreview(base64);

            // Run skeleton phases in parallel with API call
            runSkeletonPhases();

            try {
                const res = await fetch("/api/mirror-style/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        imageBase64: base64,
                        userId: user?.id || null,
                    }),
                });
                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.error || "Failed to analyze");

                setSkeletonPhase("done");
                setResult(data);
                saveToCache(data);

                if (data.shareToken) {
                    setShareLink(`${window.location.origin}/mirror-style/share/${data.shareToken}`);
                }
            } catch (err: any) {
                setErrorMsg(err.message || "An error occurred.");
            } finally {
                setAnalyzing(false);
                setSkeletonPhase("none");
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) handleFile(file);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const reset = () => {
        setUploaded(false);
        setAnalyzing(false);
        setResult(null);
        setFileName("");
        setLocalPreview("");
        setErrorMsg("");
        setShareLink("");
        setCopied(false);
        setSkeletonPhase("none");
        localStorage.removeItem(CACHE_KEY);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleCopyLink = () => {
        if (!shareLink) return;
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    // Deep-link style share URLs that open the native apps on mobile
    const getShareUrl = (platform: string) => {
        const text = encodeURIComponent("Check out my AI Mirror Style on FITOVA! ✨");
        const url = encodeURIComponent(shareLink);
        if (platform === "whatsapp") return `whatsapp://send?text=${text}%20${url}`;
        if (platform === "whatsapp-web") return `https://wa.me/?text=${text}%20${url}`;
        if (platform === "facebook") return `fb://facewebmodal/f?href=${encodeURIComponent(`https://www.facebook.com/sharer/sharer.php?u=${shareLink}`)}`;
        if (platform === "facebook-web") return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        if (platform === "twitter") return `twitter://post?message=${text}%20${url}`;
        if (platform === "twitter-web") return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        return shareLink;
    };

    // Opens native app first, falls back to web
    const handleSocialShare = (platform: string) => {
        const nativeUrl = getShareUrl(platform);
        const webUrl = getShareUrl(`${platform}-web`);
        // Try native first; if it fails after 500ms, open web
        window.location.href = nativeUrl;
        setTimeout(() => { window.open(webUrl, "_blank"); }, 1000);
    };

    const isSkeletonVisible = (phase: SkeletonPhase) => {
        const order: SkeletonPhase[] = ["basic", "profile", "styles", "colors"];
        return analyzing && order.indexOf(skeletonPhase) >= order.indexOf(phase);
    };

    // ── RENDER ──────────────────────────────────────────────────────
    return (
        <main style={{ background: "#F6F5F2", minHeight: "100vh" }}>

            {/* ── Hero ── */}
            <section
                className="flex flex-col items-center justify-center text-center pt-[120px] lg:pt-[180px] pb-20 px-4"
                style={{ background: "#0A0A0A" }}
            >
                <span className="block text-xs font-light tracking-[0.35em] uppercase mb-5" style={{ color: "rgba(246,245,242,0.4)" }}>
                    Powered by AI Vision
                </span>
                <h1 className="font-playfair text-5xl md:text-6xl font-normal mb-4" style={{ color: "#F6F5F2", letterSpacing: "-0.03em" }}>
                    Mirror Style
                </h1>
                <p className="font-light text-sm max-w-md leading-relaxed" style={{ color: "rgba(246,245,242,0.45)" }}>
                    Upload your photo. Our AI analyzes your appearance and generates a personalized fashion look — made for you.
                </p>
            </section>

            <section className="py-16">
                <div className="max-w-[960px] mx-auto px-4 sm:px-8 xl:px-0">

                    {/* ── Upload Zone ── */}
                    {!uploaded && (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            className="p-16 text-center transition-all duration-300"
                            style={{
                                border: dragOver ? "1.5px solid #0A0A0A" : "1.5px dashed #C8C4BF",
                                background: dragOver ? "rgba(10,10,10,0.04)" : "#FFFFFF",
                                transform: dragOver ? "scale(1.01)" : "none",
                            }}
                        >
                            <div className="flex justify-center mb-6">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C8C4BF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M20 20c0-4-3.6-7-8-7s-8 3-8 7" />
                                    <line x1="12" y1="16" x2="12" y2="20" />
                                    <polyline points="10,18 12,16 14,18" />
                                </svg>
                            </div>
                            <h2 className="font-playfair text-2xl font-normal text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                                Upload Your Photo
                            </h2>
                            <p className="text-xs font-light mb-8" style={{ color: "#8A8A8A", lineHeight: 1.9 }}>
                                We analyze your face, body shape & colors to suggest styles made for you.<br />
                                Supported: JPG, PNG, WebP · Processed securely, not stored
                            </p>

                            {!user && (
                                <p className="text-xs font-light mb-6 px-4 py-3 border border-[#E8E4DF] inline-block" style={{ color: "#8A8A8A" }}>
                                    <Link href="/signin" className="underline text-[#0A0A0A]">Sign in</Link> to save & share your results
                                </p>
                            )}

                            <label
                                className="cursor-pointer inline-block py-3.5 px-9 text-xs font-light tracking-[0.18em] uppercase transition-all duration-200"
                                style={{ background: "#0A0A0A", color: "#F6F5F2" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#2C2C2C"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#0A0A0A"; }}
                            >
                                Choose Photo
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleInputChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}

                    {/* ── Uploaded state ── */}
                    {uploaded && (
                        <div>
                            {/* File bar */}
                            <div className="flex items-center gap-4 mb-8 p-4 bg-white" style={{ border: "1px solid #E8E4DF" }}>
                                {localPreview && (
                                    <img src={localPreview} alt="Uploaded" className="w-14 h-14 object-cover object-top flex-shrink-0" style={{ border: "1px solid #E8E4DF" }} />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-light text-dark truncate">{fileName || "Photo uploaded"}</p>
                                    <p className="text-xs font-light mt-0.5" style={{ color: "#8A8A8A" }}>
                                        {analyzing ? "Analyzing your style…" : "Analysis complete"}
                                    </p>
                                </div>
                                <button
                                    onClick={reset}
                                    className="text-xs font-light tracking-[0.1em] uppercase px-3 py-1.5 flex-shrink-0 transition-all duration-200"
                                    style={{ border: "1px solid #E8E4DF", color: "#8A8A8A" }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1A1A1A"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E4DF"; }}
                                >
                                    Try Another
                                </button>
                            </div>

                            {/* Error */}
                            {errorMsg && (
                                <div className="p-4 mb-8 text-xs font-light text-red-700 bg-red-50 border border-red-200">
                                    {errorMsg}
                                </div>
                            )}

                            {/* ── SKELETON ── */}
                            {analyzing && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="aspect-[3/4] bg-[#E8E4DF] animate-pulse rounded-sm" />
                                        <div className="aspect-[3/4] rounded-sm overflow-hidden relative" style={{ background: "#F0EDE8" }}>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                                <div className="animate-spin rounded-full h-8 w-8" style={{ borderWidth: "2px", borderStyle: "solid", borderColor: "transparent", borderTopColor: "#C8C4BF" }} />
                                                <span className="text-xs font-light text-[#C8C4BF] tracking-[0.1em]">Generating styled look…</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isSkeletonVisible("basic") && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="p-6 bg-white" style={{ border: "1px solid #E8E4DF" }}>
                                                <SkeletonBlock h="h-3" w="w-20" />
                                                <div className="mt-5 space-y-4">
                                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <SkeletonBlock h="h-4" w="w-4" rounded="rounded-full" />
                                                            <SkeletonBlock h="h-3" w="w-24" />
                                                            <SkeletonBlock h="h-3" w="w-16" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {isSkeletonVisible("profile") && (
                                                <div className="p-6 bg-white" style={{ border: "1px solid #E8E4DF" }}>
                                                    <SkeletonBlock h="h-3" w="w-28" />
                                                    <div className="mt-5 space-y-3">
                                                        <SkeletonBlock h="h-3" />
                                                        <SkeletonBlock h="h-3" w="w-4/5" />
                                                        <SkeletonBlock h="h-3" w="w-3/5" />
                                                        <SkeletonBlock h="h-3" />
                                                    </div>
                                                    <div className="mt-5 flex gap-2">
                                                        <SkeletonBlock h="h-7" w="w-20" rounded="rounded-sm" />
                                                        <SkeletonBlock h="h-7" w="w-16" rounded="rounded-sm" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {isSkeletonVisible("styles") && (
                                        <div className="p-6 bg-white" style={{ border: "1px solid #E8E4DF" }}>
                                            <SkeletonBlock h="h-3" w="w-24" />
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {[80, 100, 72, 88].map((w, i) => (
                                                    <div key={i} className="animate-pulse h-9 bg-[#E8E4DF]" style={{ width: w }} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {isSkeletonVisible("colors") && (
                                        <div className="p-6 bg-white" style={{ border: "1px solid #E8E4DF" }}>
                                            <SkeletonBlock h="h-3" w="w-32" />
                                            <div className="mt-4 flex gap-3">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} className="animate-pulse w-10 h-10 rounded-full bg-[#E8E4DF]" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── RESULTS ── */}
                            {result && !analyzing && (
                                <div className="space-y-8">

                                    {/* Section 1: Before / After */}
                                    <div>
                                        <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#8A8A8A] mb-4">Your Transformation</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="relative">
                                                <div className="absolute top-3 left-3 z-10">
                                                    <span className="px-3 py-1 text-[10px] tracking-[0.15em] uppercase font-light" style={{ background: "rgba(10,10,10,0.7)", color: "#F6F5F2" }}>
                                                        Before
                                                    </span>
                                                </div>
                                                <img
                                                    src={result.originalImageUrl || localPreview}
                                                    alt="Your photo"
                                                    className="w-full aspect-[3/4] object-cover object-top"
                                                    style={{ border: "1px solid #E8E4DF" }}
                                                />
                                            </div>
                                            <div className="relative">
                                                {result.generatedImageUrl ? (
                                                    <>
                                                        <div className="absolute top-3 left-3 z-10">
                                                            <span className="px-3 py-1 text-[10px] tracking-[0.15em] uppercase font-light" style={{ background: "rgba(10,10,10,0.7)", color: "#F6F5F2" }}>
                                                                AI Styled
                                                            </span>
                                                        </div>
                                                        <img
                                                            src={result.generatedImageUrl}
                                                            alt="AI styled look"
                                                            className="w-full aspect-[3/4] object-cover object-top"
                                                            style={{ border: "1px solid #E8E4DF" }}
                                                            onError={(e) => {
                                                                console.error("[Mirror UI] AI image failed to load:", result.generatedImageUrl);
                                                                (e.currentTarget as HTMLImageElement).style.display = "none";
                                                                const parent = (e.currentTarget as HTMLImageElement).parentElement;
                                                                if (parent) {
                                                                    parent.innerHTML = `<div style="width:100%;aspect-ratio:3/4;background:#F0EDE8;border:1px solid #E8E4DF;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C8C4BF" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span style="font-size:11px;color:#C8C4BF;font-weight:300;letter-spacing:0.1em">Styled look unavailable</span></div>`;
                                                                }
                                                            }}
                                                        />
                                                    </>
                                                ) : (
                                                    <div
                                                        className="w-full aspect-[3/4] flex flex-col items-center justify-center gap-3"
                                                        style={{ background: "#F0EDE8", border: "1px solid #E8E4DF" }}
                                                    >
                                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C8C4BF" strokeWidth="1.4">
                                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <p className="text-xs font-light text-center px-6" style={{ color: "#8A8A8A" }}>
                                                            AI image is loading.<br />Style recommendations below.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Profile grid (2 cols) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Left: Your Profile with SVG icons */}
                                        <div className="p-6 bg-white" style={{ border: "1px solid #E8E4DF" }}>
                                            <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#8A8A8A] mb-5">Your Profile</p>
                                            <div className="space-y-4">
                                                {(Object.keys(ANALYSIS_LABELS) as (keyof Analysis)[]).map(key => {
                                                    const val = result.analysis?.[key];
                                                    if (!val || val === "Unknown") return null;
                                                    const Icon = ProfileIcons[key];
                                                    return (
                                                        <div key={key} className="flex items-center gap-3">
                                                            <span className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ color: "#8A8A8A" }}>
                                                                <Icon size={15} />
                                                            </span>
                                                            <span className="text-xs text-[#8A8A8A] w-20 flex-shrink-0 font-light">{ANALYSIS_LABELS[key]}</span>
                                                            <span className="text-sm font-light text-[#0A0A0A] capitalize">{val}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Right: YourStyle Profile */}
                                        <div className="p-6 bg-white flex flex-col" style={{ border: "1px solid #0A0A0A" }}>
                                            <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#8A8A8A] mb-3">YourStyle Profile</p>
                                            <p className="text-sm font-light leading-relaxed flex-1" style={{ color: "#4A4A4A" }}>
                                                {result.summary}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-5">
                                                {result.styles.map(s => (
                                                    <span key={s} className="text-[10px] uppercase tracking-wider py-1 px-3" style={{ background: "#F6F5F2", color: "#4A4A4A" }}>
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Style tags */}
                                    <div className="p-6 bg-white" style={{ border: "1px solid #E8E4DF" }}>
                                        <div className="flex items-center justify-between mb-5">
                                            <div>
                                                <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#8A8A8A] mb-1">Best Styles For You</p>
                                                <p className="text-xs font-light" style={{ color: "#C8C4BF" }}>Click any style to browse matching products</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {result.styles.map(style => (
                                                <Link
                                                    key={style}
                                                    href={`/outfits?style=${style}`}
                                                    className="px-6 py-3 text-xs font-light tracking-[0.18em] uppercase transition-all duration-200 hover:bg-[#2C2C2C]"
                                                    style={{ background: "#0A0A0A", color: "#F6F5F2" }}
                                                >
                                                    {style}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section 4: Color palette */}
                                    <div className="p-6 bg-white" style={{ border: "1px solid #E8E4DF" }}>
                                        <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#8A8A8A] mb-5">Colors That Fit You</p>
                                        <div className="flex flex-wrap gap-5">
                                            {result.recommended_colors.map(color => {
                                                const hex = COLOR_HEX[color.toLowerCase()] || "#CCCCCC";
                                                const isLight = ["white", "cream", "beige"].includes(color.toLowerCase());
                                                return (
                                                    <Link key={color} href={`/outfits?color=${color}`} className="flex flex-col items-center gap-2 group">
                                                        <div
                                                            className="w-11 h-11 rounded-full border-2 transition-all duration-200 group-hover:scale-110"
                                                            style={{
                                                                background: hex,
                                                                borderColor: isLight ? "#E8E4DF" : hex,
                                                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                                                            }}
                                                        />
                                                        <span className="text-[10px] tracking-wider uppercase" style={{ color: "#8A8A8A" }}>{color}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Section 5: Clothing suggestions */}
                                    <div>
                                        <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#8A8A8A] mb-4">Clothing Suggestions</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { label: "Best Tops", items: result.tops },
                                                { label: "Best Bottoms", items: result.bottoms },
                                                { label: "Best Shoes", items: result.shoes },
                                            ].map(({ label, items }) => (
                                                <div key={label} className="p-5 bg-white" style={{ border: "1px solid #E8E4DF" }}>
                                                    <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#8A8A8A] mb-4">{label}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {items?.map(item => (
                                                            <Link
                                                                key={item}
                                                                href={`/outfits?search=${encodeURIComponent(item)}`}
                                                                className="px-3 py-1.5 text-xs font-light capitalize border border-[#E8E4DF] text-[#4A4A4A] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-all duration-200"
                                                            >
                                                                {item}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section 6: Recommended Products */}
                                    {result.suggestedProducts?.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#8A8A8A] mb-1">Recommended For You</p>
                                            <p className="text-xs font-light mb-6" style={{ color: "#C8C4BF" }}>Real pieces from our store, matched to your style</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
                                                {result.suggestedProducts.slice(0, 8).map(item => (
                                                    <ProductGridCard key={item.id} item={item as any} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Section 7: Share with branded SVG icons */}
                                    {shareLink && (
                                        <div className="p-6 bg-white" style={{ border: "1px solid #E8E4DF" }}>
                                            <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#8A8A8A] mb-4">Share Your Style</p>

                                            {/* Copy link row */}
                                            <div className="flex items-center gap-3 mb-5 flex-wrap">
                                                <input
                                                    readOnly
                                                    value={shareLink}
                                                    className="flex-1 min-w-0 px-3 py-2.5 text-xs font-light bg-[#F6F5F2] border border-[#E8E4DF] text-[#4A4A4A] focus:outline-none"
                                                />
                                                <button
                                                    onClick={handleCopyLink}
                                                    className="py-2.5 px-5 text-xs font-light tracking-[0.12em] uppercase transition-all duration-200 flex-shrink-0 flex items-center gap-2"
                                                    style={{ background: copied ? "#22c55e" : "#0A0A0A", color: "#F6F5F2" }}
                                                >
                                                    {copied ? (
                                                        <>
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                            Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                            </svg>
                                                            Copy
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Social share buttons */}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-[10px] tracking-[0.18em] uppercase text-[#8A8A8A] mr-1">Share via:</span>

                                                {/* WhatsApp */}
                                                <button
                                                    onClick={() => handleSocialShare("whatsapp")}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-light tracking-wide text-white transition-opacity duration-200 hover:opacity-85"
                                                    style={{ background: "#25D366" }}
                                                    title="Share on WhatsApp"
                                                >
                                                    <WhatsAppIcon />
                                                    WhatsApp
                                                </button>

                                                {/* Facebook */}
                                                <button
                                                    onClick={() => handleSocialShare("facebook")}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-light tracking-wide text-white transition-opacity duration-200 hover:opacity-85"
                                                    style={{ background: "#1877F2" }}
                                                    title="Share on Facebook"
                                                >
                                                    <FacebookIcon />
                                                    Facebook
                                                </button>

                                                {/* X / Twitter */}
                                                <button
                                                    onClick={() => handleSocialShare("twitter")}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-light tracking-wide text-white transition-opacity duration-200 hover:opacity-85"
                                                    style={{ background: "#1A1A1A" }}
                                                    title="Share on X (Twitter)"
                                                >
                                                    <XTwitterIcon />
                                                    Post on X
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 flex-col sm:flex-row pt-2">
                                        <button
                                            onClick={reset}
                                            className="flex-1 py-3.5 text-xs font-light tracking-[0.15em] uppercase transition-all duration-200"
                                            style={{ background: "#0A0A0A", color: "#F6F5F2" }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#2C2C2C"; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#0A0A0A"; }}
                                        >
                                            Try Another Photo
                                        </button>
                                        <Link
                                            href="/outfits"
                                            className="flex-1 py-3.5 text-xs font-light tracking-[0.15em] uppercase transition-all duration-200 text-center"
                                            style={{ background: "transparent", color: "#0A0A0A", border: "1px solid #0A0A0A" }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F6F5F2"; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                                        >
                                            Browse All Products
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
