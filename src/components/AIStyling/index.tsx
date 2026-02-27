"use client";
import React, { useState, useCallback } from "react";

type OutfitSuggestion = {
    id: number;
    name: string;
    category: string;
    price: number;
    matchReason: string;
    gradient: string;
};

const mockSuggestions: OutfitSuggestion[][] = [
    [
        { id: 1, name: "White Oxford Shirt", category: "Shirts", price: 55, matchReason: "Complements the casual base", gradient: "linear-gradient(135deg, #0A0A0A 0%, #2C2C2C 100%)" },
        { id: 2, name: "Slim Chinos", category: "Pants", price: 70, matchReason: "Matching neutral tone", gradient: "linear-gradient(135deg, #2C1810 0%, #6B3A2A 100%)" },
        { id: 3, name: "Leather Derby Shoes", category: "Shoes", price: 120, matchReason: "Elevated finish", gradient: "linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)" },
        { id: 4, name: "Minimalist Watch", category: "Accessories", price: 89, matchReason: "Clean aesthetic accent", gradient: "linear-gradient(135deg, #1A1A0A 0%, #3A3A2A 100%)" },
    ],
    [
        { id: 5, name: "Striped Tee", category: "T-Shirts", price: 30, matchReason: "Playful pattern contrast", gradient: "linear-gradient(135deg, #1A1A1A 0%, #404040 100%)" },
        { id: 6, name: "Dark Wash Jeans", category: "Pants", price: 80, matchReason: "Versatile base pair", gradient: "linear-gradient(135deg, #0A0A1A 0%, #1A1A3D 100%)" },
        { id: 7, name: "White Canvas Sneakers", category: "Shoes", price: 65, matchReason: "Classic streetwear finish", gradient: "linear-gradient(135deg, #0A0A0A 0%, #2C2C2C 100%)" },
        { id: 8, name: "Canvas Tote Bag", category: "Bags", price: 35, matchReason: "Casual everyday carry", gradient: "linear-gradient(135deg, #1A0D0D 0%, #3D1A1A 100%)" },
    ],
];

export default function AIStyling() {
    const [dragOver, setDragOver] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [suggestionSet, setSuggestionSet] = useState(0);
    const [suggestions, setSuggestions] = useState<OutfitSuggestion[] | null>(null);
    const [fileName, setFileName] = useState("");

    const handleFile = (file: File) => {
        setFileName(file.name);
        setUploaded(true);
        setAnalyzing(true);
        setSuggestions(null);
        setTimeout(() => {
            setAnalyzing(false);
            setSuggestions(mockSuggestions[suggestionSet % mockSuggestions.length]);
            setSuggestionSet((s) => s + 1);
        }, 2200);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) handleFile(file);
    }, [suggestionSet]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const reset = () => {
        setUploaded(false);
        setAnalyzing(false);
        setSuggestions(null);
        setFileName("");
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
                    Powered by AI
                </span>
                <h1
                    className="font-playfair text-5xl md:text-6xl font-normal mb-5"
                    style={{ color: "#F6F5F2", letterSpacing: "-0.03em" }}
                >
                    AI Styling
                </h1>
                <p
                    className="font-light text-sm max-w-md leading-relaxed"
                    style={{ color: "rgba(246,245,242,0.5)" }}
                >
                    Upload a photo of any clothing piece and our AI will build a complete, harmonious outfit around it in seconds.
                </p>
            </section>

            {/* ── Upload / Results ─────────────────────────────────── */}
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
                            {/* Upload icon */}
                            <div className="flex justify-center mb-6">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#C8C4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <polyline points="17 8 12 3 7 8" stroke="#C8C4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="12" y1="3" x2="12" y2="15" stroke="#C8C4BF" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>

                            <h2
                                className="font-playfair text-xl font-normal text-dark mb-2"
                                style={{ letterSpacing: "-0.02em" }}
                            >
                                Upload Your Clothing Item
                            </h2>
                            <p
                                className="text-xs font-light mb-7"
                                style={{ color: "#8A8A8A", lineHeight: 1.8 }}
                            >
                                Drag &amp; drop an image here, or click to browse.<br />
                                Supported: JPG, PNG, WebP
                            </p>

                            <label
                                className="cursor-pointer inline-block py-3 px-7 text-xs font-light tracking-[0.15em] uppercase ease-out duration-200"
                                style={{ background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}
                            >
                                Choose Image
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleInputChange}
                                    className="hidden"
                                />
                            </label>

                            <p
                                className="text-[10px] font-light mt-5 tracking-[0.05em]"
                                style={{ color: "#C8C4BF" }}
                            >
                                Your image is analyzed locally and not stored.
                            </p>
                        </div>
                    ) : (
                        <div>
                            {/* Uploaded indicator */}
                            <div
                                className="flex items-center gap-4 mb-7 p-4"
                                style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: "#8A8A8A", flexShrink: 0 }}>
                                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-light text-dark truncate">{fileName}</p>
                                    <p className="text-xs font-light mt-0.5" style={{ color: "#8A8A8A" }}>
                                        {analyzing ? "Analyzing with AI…" : "Analysis complete"}
                                    </p>
                                </div>
                                <button
                                    onClick={reset}
                                    className="text-xs font-light tracking-[0.1em] uppercase ease-out duration-200 px-3 py-1.5"
                                    style={{ border: "1px solid #E8E4DF", color: "#8A8A8A" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1A1A1A"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E4DF"; }}
                                >
                                    Try Another
                                </button>
                            </div>

                            {/* Skeleton */}
                            {analyzing && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="overflow-hidden animate-pulse" style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}>
                                            <div className="h-36 bg-gray-100" />
                                            <div className="p-4 space-y-2">
                                                <div className="h-2.5 bg-gray-100 w-3/4" />
                                                <div className="h-2.5 bg-gray-100 w-1/2" />
                                                <div className="h-8 bg-gray-100 mt-2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Results */}
                            {suggestions && (
                                <div>
                                    <h2
                                        className="font-playfair text-2xl font-normal text-dark mb-1"
                                        style={{ letterSpacing: "-0.02em" }}
                                    >
                                        AI Suggested Outfit
                                    </h2>
                                    <p className="text-xs font-light mb-7" style={{ color: "#8A8A8A" }}>
                                        Based on your item, our AI recommends these complementary pieces:
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
                                        {suggestions.map((item) => (
                                            <div
                                                key={item.id}
                                                className="overflow-hidden"
                                                style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}
                                            >
                                                <div
                                                    className="h-36 w-full"
                                                    style={{ background: item.gradient }}
                                                />
                                                <div className="p-4">
                                                    <p className="text-[10px] font-light tracking-[0.1em] uppercase mb-0.5" style={{ color: "#8A8A8A" }}>
                                                        {item.category}
                                                    </p>
                                                    <h3 className="text-sm font-light text-dark mb-1">{item.name}</h3>
                                                    <p className="text-[10px] font-light italic mb-3" style={{ color: "#C8C4BF" }}>
                                                        {item.matchReason}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-light text-sm text-dark">${item.price}</span>
                                                        <button
                                                            className="text-[10px] font-light px-2 py-1 uppercase tracking-[0.08em] ease-out duration-200"
                                                            style={{ background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            className="flex-1 py-3 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
                                            style={{ background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#2C2C2C"; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0A0A0A"; }}
                                        >
                                            Save to Wishlist
                                        </button>
                                        <button
                                            onClick={reset}
                                            className="flex-1 py-3 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
                                            style={{ background: "transparent", color: "#4A4A4A", border: "1px solid #E8E4DF" }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1A1A1A"; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E4DF"; }}
                                        >
                                            Generate New Look
                                        </button>
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
