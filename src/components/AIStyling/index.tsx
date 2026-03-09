"use client";
import React, { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { RootState } from "@/redux/store";
import Link from "next/link";
import ProductGridCard from "@/components/Shop/ProductGridCard";
import { Product } from "@/types/product";
type OutfitSuggestion = Product & { matchReason?: string };

type IdentifiedItem = {
    name: string;
    color: string;
    style: string;
    gender: string;
    season: string;
    mood: string;
    occasion: string;
    description: string;
};

type Gender = "Men" | "Women" | "Unisex";

export default function AIStyling() {
    const dispatch = useDispatch();
    const [dragOver, setDragOver] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [suggestions, setSuggestions] = useState<OutfitSuggestion[] | null>(null);
    const [identifiedItem, setIdentifiedItem] = useState<IdentifiedItem | null>(null);
    const [fileName, setFileName] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});
    const [allSaved, setAllSaved] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Grab current wishlist from redux to show filled/empty hearts correctly
    const wishlistItems = useSelector((state: RootState) => state.wishlistReducer.items);

    const handleFile = (file: File) => {
        setFileName(file.name);
        setUploaded(true);
        setAnalyzing(true);
        setSuggestions(null);
        setIdentifiedItem(null);
        setErrorMsg("");

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            setImagePreview(base64String);
            try {
                const res = await fetch("/api/ai-styling", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageBase64: base64String })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to analyze image");
                setIdentifiedItem(data.identifiedItem);
                setSuggestions(data.suggestions);
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
        setSuggestions(null);
        setIdentifiedItem(null);
        setFileName("");
        setImagePreview("");
        setErrorMsg("");
    }
    const handleToggleWishlist = async (item: OutfitSuggestion) => {
        const isInWishlist = wishlistItems.some(w => w.id === item.id);

        if (isInWishlist) {
            // Remove
            dispatch(removeItemFromWishlist({ item_id: String(item.id), item_type: "product" }));
            try {
                const { removeFromWishlist } = await import("@/lib/queries/wishlist");
                await removeFromWishlist(String(item.id), "product");
            } catch { }
        } else {
            // Add
            const thumb = item.imgs?.thumbnails?.[0] ?? "/images/products/product-1-bg-1.png";
            dispatch(addItemToWishlist({
                id: String(item.id),
                item_id: String(item.id),
                item_type: "product",
                created_at: new Date().toISOString(),
                title: item.title,
                price: item.price,
                discountedPrice: item.discountedPrice,
                imageUrl: thumb,
            }));

            try {
                const { addToWishlist } = await import("@/lib/queries/wishlist");
                await addToWishlist(String(item.id), "product");
            } catch { }
        }
    };

    const handleSaveAllToWishlist = async () => {
        if (!suggestions) return;
        setAllSaved(true);

        suggestions.forEach(item => {
            if (!wishlistItems.some(w => w.id === item.id)) {
                const thumb = item.imgs?.thumbnails?.[0] ?? "/images/products/product-1-bg-1.png";
                dispatch(addItemToWishlist({
                    id: String(item.id),
                    item_id: String(item.id),
                    item_type: "product",
                    created_at: new Date().toISOString(),
                    title: item.title,
                    price: item.price,
                    discountedPrice: item.discountedPrice,
                    imageUrl: thumb,
                }));
            }
        });

        // Async save all to DB background
        try {
            const { addToWishlist } = await import("@/lib/queries/wishlist");
            await Promise.all(suggestions.map(item => addToWishlist(String(item.id), "product")));
        } catch { }

        setTimeout(() => setAllSaved(false), 2000);
    };

    return (
        <main style={{ background: "#F6F5F2" }}>
            {/* ── Hero ── */}
            <section
                className="flex flex-col items-center justify-center text-center pt-[120px] lg:pt-[180px] pb-20 px-4"
                style={{ background: "#0A0A0A" }}
            >
                <span className="block text-xs font-light tracking-[0.35em] uppercase mb-6" style={{ color: "rgba(246,245,242,0.45)" }}>
                    Powered by AI
                </span>
                <h1 className="font-playfair text-5xl md:text-6xl font-normal mb-5" style={{ color: "#F6F5F2", letterSpacing: "-0.03em" }}>
                    AI Styling
                </h1>
                <p className="font-light text-sm max-w-md leading-relaxed" style={{ color: "rgba(246,245,242,0.5)" }}>
                    Upload a photo of any clothing piece and our AI will suggest real complementary items from our store.
                </p>
            </section>

            {/* ── Upload / Results ── */}
            <section className="py-16">
                <div className="max-w-[900px] mx-auto px-4 sm:px-8 xl:px-0">

                    {!uploaded ? (
                        <div>
                            {/* Upload Zone */}
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
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#C8C4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <polyline points="17 8 12 3 7 8" stroke="#C8C4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <line x1="12" y1="3" x2="12" y2="15" stroke="#C8C4BF" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h2 className="font-playfair text-xl font-normal text-dark mb-2" style={{ letterSpacing: "-0.02em" }}>
                                    Upload Your Clothing Item
                                </h2>
                                <p className="text-xs font-light mb-7" style={{ color: "#8A8A8A", lineHeight: 1.8 }}>
                                    Drag &amp; drop an image here, or click to browse.<br />
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
                        </div>
                    ) : (
                        <div>
                            {/* Uploaded indicator */}
                            <div className="flex items-center gap-4 mb-7 p-4" style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}>
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

                            {/* Error */}
                            {errorMsg && (
                                <div className="p-4 mb-7 text-xs font-light tracking-[0.05em] text-red-700 bg-red-50 border border-red-200">
                                    {errorMsg}
                                </div>
                            )}

                            {/* Loading spinner */}
                            {analyzing && (
                                <div className="flex justify-center py-20 flex-col items-center gap-4">
                                    <div className="animate-spin rounded-full h-8 w-8" style={{ borderWidth: "2px", borderStyle: "solid", borderColor: "transparent", borderTopColor: "#0A0A0A" }}></div>
                                    <p className="text-xs font-light tracking-[0.05em] animate-pulse" style={{ color: "#8A8A8A" }}>Analyzing & finding matching pieces…</p>
                                </div>
                            )}

                            {/* Results */}
                            {suggestions && identifiedItem && (
                                <div>
                                    {/* Identified item card */}
                                    <div className="mb-10 p-6 flex flex-col md:flex-row gap-8 items-center md:items-start" style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}>
                                        {imagePreview && (
                                            <img src={imagePreview} alt="Uploaded Item" className="w-40 h-40 object-cover object-center" style={{ border: "1px solid #E8E4DF", borderRadius: "2px" }} />
                                        )}
                                        <div className="flex-1 text-center md:text-left pt-2">
                                            <p className="text-[10px] font-light tracking-[0.1em] uppercase mb-1" style={{ color: "#8A8A8A" }}>Identified Item</p>
                                            <h3 className="font-playfair text-xl font-normal text-dark mb-2">{identifiedItem.name}</h3>
                                            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                                                <span className="text-[10px] uppercase tracking-wider py-1 px-3" style={{ background: "#F6F5F2", color: "#4A4A4A" }}>{identifiedItem.color}</span>
                                                <span className="text-[10px] uppercase tracking-wider py-1 px-3" style={{ background: "#F6F5F2", color: "#4A4A4A" }}>{identifiedItem.style}</span>
                                                <span className="text-[10px] uppercase tracking-wider py-1 px-3" style={{ background: "#F6F5F2", color: "#4A4A4A" }}>{identifiedItem.gender}</span>
                                                {identifiedItem.season && <span className="text-[10px] uppercase tracking-wider py-1 px-3" style={{ background: "#F6F5F2", color: "#4A4A4A" }}>{identifiedItem.season}</span>}
                                                {identifiedItem.mood && <span className="text-[10px] uppercase tracking-wider py-1 px-3" style={{ background: "#F6F5F2", color: "#4A4A4A" }}>{identifiedItem.mood}</span>}
                                                {identifiedItem.occasion && <span className="text-[10px] uppercase tracking-wider py-1 px-3" style={{ background: "#F6F5F2", color: "#4A4A4A" }}>{identifiedItem.occasion}</span>}
                                            </div>
                                            <p className="text-xs font-light leading-relaxed" style={{ color: "#4A4A4A" }}>{identifiedItem.description}</p>
                                        </div>
                                    </div>

                                    {/* Suggestions */}
                                    <h2 className="font-playfair text-2xl font-normal text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
                                        Complete Your Outfit
                                    </h2>
                                    <p className="text-xs font-light mb-7" style={{ color: "#8A8A8A" }}>
                                        Real pieces from our store, curated to complement your item:
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-7">
                                        {suggestions.map((item) => (
                                            <ProductGridCard key={item.id} item={item as any} />
                                        ))}
                                    </div>

                                    <div className="flex gap-3 flex-col sm:flex-row">
                                        <button
                                            onClick={handleSaveAllToWishlist}
                                            className="flex-1 py-3 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
                                            style={{
                                                background: allSaved ? "#ef4444" : "transparent",
                                                color: allSaved ? "#fff" : "#0A0A0A",
                                                border: `1px solid ${allSaved ? "#ef4444" : "#0A0A0A"}`
                                            }}
                                        >
                                            {allSaved ? "All Saved ❤️" : "Save All To Wishlist"}
                                        </button>
                                        <button
                                            onClick={reset}
                                            className="flex-1 py-3 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
                                            style={{ background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#2C2C2C"; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0A0A0A"; }}
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
