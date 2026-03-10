"use client";
import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import ProductGridCard from "@/components/Shop/ProductGridCard";
import { Product } from "@/types/product";

type StyleAnalysisResult = {
    analysis: {
        skin_tone: string;
        hair_color: string;
        body_type: string;
        overall_aesthetic: string;
    };
    styles: string[];
    recommended_colors: string[];
    tops: string[];
    bottoms: string[];
    shoes: string[];
    summary: string;
    suggestedProducts: (Product & { category?: string })[];
};

type LoadingStep = "analyzing" | "detecting" | "generating" | "preparing" | "done";

const LOADING_STEPS: { key: LoadingStep; label: string }[] = [
    { key: "analyzing", label: "Analyzing your appearance" },
    { key: "detecting", label: "Detecting style compatibility" },
    { key: "generating", label: "Generating outfit recommendations" },
    { key: "preparing", label: "Preparing your results" },
];

const COLOR_MAP: Record<string, string> = {
    black: "#1A1A1A",
    white: "#FFFFFF",
    navy: "#1B2A4A",
    red: "#C0392B",
    green: "#27AE60",
    beige: "#D4C5A9",
    grey: "#9E9E9E",
    brown: "#795548",
    olive: "#808000",
    burgundy: "#800020",
    camel: "#C19A6B",
    cream: "#FFFDD0",
};

export default function AIStyleFromPhoto() {
    const [dragOver, setDragOver] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [currentStep, setCurrentStep] = useState<LoadingStep>("analyzing");
    const [result, setResult] = useState<StyleAnalysisResult | null>(null);
    const [fileName, setFileName] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [shareLoading, setShareLoading] = useState(false);
    const [shareLink, setShareLink] = useState("");
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const simulateSteps = async () => {
        const steps: LoadingStep[] = ["analyzing", "detecting", "generating", "preparing"];
        for (const step of steps) {
            setCurrentStep(step);
            await new Promise(res => setTimeout(res, 1200));
        }
    };

    const handleFile = (file: File) => {
        setFileName(file.name);
        setUploaded(true);
        setAnalyzing(true);
        setResult(null);
        setErrorMsg("");
        setShareLink("");

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            setImagePreview(base64String);

            // Simulate progress steps in parallel with the API call
            simulateSteps();

            try {
                const res = await fetch("/api/ai-style-from-photo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageBase64: base64String }),
                });
                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.error || "Failed to analyze image");
                setCurrentStep("done");
                setResult(data);
            } catch (err: any) {
                setErrorMsg(err.message || "An error occurred.");
            } finally {
                setAnalyzing(false);
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
        setImagePreview("");
        setErrorMsg("");
        setShareLink("");
        setCopied(false);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleShare = async () => {
        if (!result) return;
        setShareLoading(true);
        try {
            const res = await fetch("/api/share-style", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    styles: result.styles,
                    recommended_colors: result.recommended_colors,
                    summary: result.summary,
                    analysis: result.analysis,
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            const link = `${window.location.origin}/style-result/${data.id}`;
            setShareLink(link);
        } catch (err: any) {
            setErrorMsg("Failed to generate share link. Please try again.");
        } finally {
            setShareLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (!shareLink) return;
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const stepIndex = LOADING_STEPS.findIndex(s => s.key === currentStep);

    return (
        <main style={{ background: "#F6F5F2" }}>
            {/* ── Hero ── */}
            <section
                className="flex flex-col items-center justify-center text-center pt-[120px] lg:pt-[180px] pb-20 px-4"
                style={{ background: "#0A0A0A" }}
            >
                <span className="block text-xs font-light tracking-[0.35em] uppercase mb-6" style={{ color: "rgba(246,245,242,0.45)" }}>
                    Powered by AI Vision
                </span>
                <h1 className="font-playfair text-5xl md:text-6xl font-normal mb-5" style={{ color: "#F6F5F2", letterSpacing: "-0.03em" }}>
                    AI Style From Photo
                </h1>
                <p className="font-light text-sm max-w-md leading-relaxed" style={{ color: "rgba(246,245,242,0.5)" }}>
                    Upload your photo and our AI will analyze your appearance, detect what styles suit you best, and recommend personalized fashion from our store.
                </p>
            </section>

            {/* ── Upload / Results ── */}
            <section className="py-16">
                <div className="max-w-[900px] mx-auto px-4 sm:px-8 xl:px-0">

                    {!uploaded ? (
                        /* Upload Zone */
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            className="p-16 text-center ease-out duration-300"
                            style={{
                                border: dragOver ? "1px solid #0A0A0A" : "1px dashed #C8C4BF",
                                background: dragOver ? "rgba(10,10,10,0.03)" : "#FFFFFF",
                                transform: dragOver ? "scale(1.01)" : undefined,
                            }}
                        >
                            <div className="flex justify-center mb-6">
                                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="7" r="4" stroke="#C8C4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M20 21a8 8 0 10-16 0" stroke="#C8C4BF" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M12 17v4M10 19h4" stroke="#C8C4BF" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <h2 className="font-playfair text-xl font-normal text-dark mb-2" style={{ letterSpacing: "-0.02em" }}>
                                Upload Your Photo
                            </h2>
                            <p className="text-xs font-light mb-7" style={{ color: "#8A8A8A", lineHeight: 1.8 }}>
                                We will analyze your face, body shape, and colors to suggest styles that fit you.<br />
                                Supported: JPG, PNG, WebP
                            </p>
                            <label
                                className="cursor-pointer inline-block py-3 px-7 text-xs font-light tracking-[0.15em] uppercase ease-out duration-200"
                                style={{ background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}
                            >
                                Choose Image
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleInputChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-[10px] font-light mt-5 tracking-[0.05em]" style={{ color: "#C8C4BF" }}>
                                Your image is processed securely and not stored.
                            </p>
                        </div>
                    ) : (
                        <div>
                            {/* Uploaded indicator */}
                            <div className="flex items-center gap-4 mb-7 p-4" style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}>
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Uploaded"
                                        className="w-16 h-16 object-cover object-top flex-shrink-0"
                                        style={{ border: "1px solid #E8E4DF" }}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-light text-dark truncate">{fileName}</p>
                                    <p className="text-xs font-light mt-0.5" style={{ color: "#8A8A8A" }}>
                                        {analyzing ? "Analyzing your style…" : "Analysis complete"}
                                    </p>
                                </div>
                                <button
                                    onClick={reset}
                                    className="text-xs font-light tracking-[0.1em] uppercase ease-out duration-200 px-3 py-1.5 flex-shrink-0"
                                    style={{ border: "1px solid #E8E4DF", color: "#8A8A8A" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1A1A1A"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E4DF"; }}
                                >
                                    Try Another
                                </button>
                            </div>

                            {/* Error */}
                            {errorMsg && (
                                <div className="p-4 mb-7 text-xs font-light tracking-[0.05em] text-red-700 bg-red-50 border border-red-200">
                                    {errorMsg}
                                </div>
                            )}

                            {/* Progress Steps */}
                            {analyzing && (
                                <div className="py-12 flex flex-col items-center gap-8">
                                    <div className="animate-spin rounded-full h-10 w-10" style={{ borderWidth: "2px", borderStyle: "solid", borderColor: "transparent", borderTopColor: "#0A0A0A" }} />
                                    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                                        {LOADING_STEPS.map((step, idx) => (
                                            <div key={step.key} className={`flex items-center gap-3 text-xs font-light tracking-wide transition-all duration-500 ${idx <= stepIndex ? "text-[#0A0A0A]" : "text-[#C8C4BF]"}`}>
                                                <div
                                                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-500"
                                                    style={{
                                                        background: idx < stepIndex ? "#0A0A0A" : idx === stepIndex ? "#0A0A0A" : "#E8E4DF",
                                                        opacity: idx > stepIndex ? 0.4 : 1,
                                                    }}
                                                >
                                                    {idx < stepIndex && (
                                                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                                            <path d="M2 6l3 3 5-5" stroke="#F6F5F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                    {idx === stepIndex && (
                                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                    )}
                                                </div>
                                                {step.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Results */}
                            {result && !analyzing && (
                                <div className="space-y-10">

                                    {/* Summary */}
                                    <div className="p-6" style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}>
                                        <p className="text-[10px] font-light tracking-[0.1em] uppercase mb-3" style={{ color: "#8A8A8A" }}>
                                            Your Style Profile
                                        </p>
                                        <p className="text-sm font-light leading-relaxed" style={{ color: "#4A4A4A" }}>
                                            {result.summary}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {[
                                                { label: result.analysis?.skin_tone, icon: "◑" },
                                                { label: result.analysis?.body_type, icon: "◻" },
                                                { label: result.analysis?.overall_aesthetic, icon: "✦" },
                                            ].filter(x => x.label).map((tag, i) => (
                                                <span key={i} className="text-[10px] uppercase tracking-wider py-1 px-3" style={{ background: "#F6F5F2", color: "#4A4A4A" }}>
                                                    {tag.icon} {tag.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Best Styles For You */}
                                    <div>
                                        <h2 className="font-playfair text-2xl font-normal text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
                                            Best Styles For You
                                        </h2>
                                        <p className="text-xs font-light mb-5" style={{ color: "#8A8A8A" }}>
                                            Styles detected to match your appearance
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {result.styles.map((style) => (
                                                <Link
                                                    key={style}
                                                    href={`/outfits?style=${style.toLowerCase()}`}
                                                    className="px-5 py-3 text-xs font-light tracking-[0.15em] uppercase transition-all duration-200"
                                                    style={{ background: "#0A0A0A", color: "#F6F5F2" }}
                                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#2C2C2C"; }}
                                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0A0A0A"; }}
                                                >
                                                    {style}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Colors That Fit You */}
                                    <div>
                                        <h2 className="font-playfair text-2xl font-normal text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
                                            Colors That Fit You
                                        </h2>
                                        <p className="text-xs font-light mb-5" style={{ color: "#8A8A8A" }}>
                                            Palette curated for your skin tone and hair color
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {result.recommended_colors.map((color) => {
                                                const hex = COLOR_MAP[color.toLowerCase()] || "#CCCCCC";
                                                const isLight = ["white", "cream", "beige"].includes(color.toLowerCase());
                                                return (
                                                    <div
                                                        key={color}
                                                        className="flex flex-col items-center gap-2"
                                                    >
                                                        <div
                                                            className="w-12 h-12 rounded-full border"
                                                            style={{ background: hex, borderColor: isLight ? "#E8E4DF" : hex }}
                                                        />
                                                        <span className="text-[10px] tracking-wider uppercase" style={{ color: "#8A8A8A" }}>
                                                            {color}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Clothing Suggestions */}
                                    <div>
                                        <h2 className="font-playfair text-2xl font-normal text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
                                            Clothing Suggestions
                                        </h2>
                                        <p className="text-xs font-light mb-5" style={{ color: "#8A8A8A" }}>
                                            Types of clothing that will enhance your look
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { label: "Best Tops", items: result.tops },
                                                { label: "Best Bottoms", items: result.bottoms },
                                                { label: "Best Shoes", items: result.shoes },
                                            ].map(({ label, items }) => (
                                                <div key={label} className="p-5" style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}>
                                                    <p className="text-[10px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: "#8A8A8A" }}>
                                                        {label}
                                                    </p>
                                                    <ul className="space-y-2">
                                                        {items?.map((item) => (
                                                            <li key={item} className="flex items-center gap-2 text-xs font-light" style={{ color: "#4A4A4A" }}>
                                                                <span style={{ color: "#C8C4BF" }}>—</span>
                                                                <span className="capitalize">{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recommended Products */}
                                    {result.suggestedProducts?.length > 0 && (
                                        <div>
                                            <h2 className="font-playfair text-2xl font-normal text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
                                                Recommended For You
                                            </h2>
                                            <p className="text-xs font-light mb-6" style={{ color: "#8A8A8A" }}>
                                                Real pieces from our store, matched to your style profile
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                                                {result.suggestedProducts.slice(0, 8).map((item) => (
                                                    <ProductGridCard key={item.id} item={item as any} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Share Section */}
                                    <div className="p-6" style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}>
                                        <h3 className="font-playfair text-lg font-normal text-dark mb-1">
                                            Share Your Style
                                        </h3>
                                        <p className="text-xs font-light mb-5" style={{ color: "#8A8A8A" }}>
                                            Generate a shareable link for your AI style profile
                                        </p>

                                        {!shareLink ? (
                                            <button
                                                onClick={handleShare}
                                                disabled={shareLoading}
                                                className="py-3 px-6 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200 disabled:opacity-50"
                                                style={{ background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}
                                                onMouseEnter={(e) => { if (!shareLoading) (e.currentTarget as HTMLElement).style.background = "#2C2C2C"; }}
                                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0A0A0A"; }}
                                            >
                                                {shareLoading ? "Generating Link…" : "Generate Share Link"}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <input
                                                    readOnly
                                                    value={shareLink}
                                                    className="flex-1 min-w-0 px-3 py-2.5 text-xs font-light bg-[#F6F5F2] border border-[#E8E4DF] text-[#4A4A4A] focus:outline-none"
                                                />
                                                <button
                                                    onClick={handleCopyLink}
                                                    className="py-2.5 px-5 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200 flex-shrink-0"
                                                    style={{
                                                        background: copied ? "#22c55e" : "#0A0A0A",
                                                        color: "#F6F5F2",
                                                        border: `1px solid ${copied ? "#22c55e" : "#0A0A0A"}`,
                                                    }}
                                                >
                                                    {copied ? "Copied!" : "Copy Link"}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 flex-col sm:flex-row">
                                        <button
                                            onClick={reset}
                                            className="flex-1 py-3 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
                                            style={{ background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#2C2C2C"; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0A0A0A"; }}
                                        >
                                            Try Another Photo
                                        </button>
                                        <Link
                                            href="/outfits"
                                            className="flex-1 py-3 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200 text-center"
                                            style={{ background: "transparent", color: "#0A0A0A", border: "1px solid #0A0A0A" }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F6F5F2"; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
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
