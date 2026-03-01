"use client";
import React, { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { RootState } from "@/redux/store";
import Link from "next/link";

type OutfitSuggestion = {
    id: string;
    name: string;
    category: string;
    price: number;
    matchReason: string;
    gradient: string;
    imageUrl?: string | null;
    affiliateLink?: string | null;
    slug: string;
};

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
        setAddedToCart({});
        setAllSaved(false);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleAddToCart = (item: OutfitSuggestion) => {
        dispatch(addItemToCart({
            id: item.id,
            title: item.name,
            price: item.price,
            discountedPrice: item.price,
            quantity: 1,
            affiliate_link: item.affiliateLink || undefined,
            imgs: item.imageUrl ? { thumbnails: [item.imageUrl], previews: [item.imageUrl] } : undefined,
        }));
        setAddedToCart(prev => ({ ...prev, [item.id]: true }));
        setTimeout(() => setAddedToCart(prev => ({ ...prev, [item.id]: false })), 2000);
    };

    const handleToggleWishlist = async (item: OutfitSuggestion) => {
        const isInWishlist = wishlistItems.some(w => w.id === item.id);

        if (isInWishlist) {
            // Remove
            dispatch(removeItemFromWishlist(item.id));
            try {
                const { removeFromWishlist } = await import("@/lib/queries/wishlist");
                await removeFromWishlist(item.id);
            } catch { }
        } else {
            // Add
            dispatch(addItemToWishlist({
                id: item.id,
                title: item.name,
                price: item.price,
                discountedPrice: item.price,
                quantity: 1,
                status: "In stock",
                imgs: item.imageUrl ? { thumbnails: [item.imageUrl], previews: [item.imageUrl] } : undefined,
            }));

            try {
                const { addToWishlist } = await import("@/lib/queries/wishlist");
                await addToWishlist(item.id);
            } catch { }
        }
    };

    const handleSaveAllToWishlist = async () => {
        if (!suggestions) return;
        setAllSaved(true);

        suggestions.forEach(item => {
            if (!wishlistItems.some(w => w.id === item.id)) {
                dispatch(addItemToWishlist({
                    id: item.id,
                    title: item.name,
                    price: item.price,
                    discountedPrice: item.price,
                    quantity: 1,
                    status: "In stock",
                    imgs: item.imageUrl ? { thumbnails: [item.imageUrl], previews: [item.imageUrl] } : undefined,
                }));
            }
        });

        // Async save all to DB background
        try {
            const { addToWishlist } = await import("@/lib/queries/wishlist");
            await Promise.all(suggestions.map(item => addToWishlist(item.id)));
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

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
                                        {suggestions.map((item) => (
                                            <div key={item.id} className="flex flex-col group" style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}>
                                                {/* Product image with hover overlay */}
                                                <div className="relative overflow-hidden w-full h-40">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover object-center"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full" style={{ background: item.gradient }} />
                                                    )}

                                                    {/* Hover Action Buttons */}
                                                    <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2 pb-4 ease-linear duration-200 group-hover:translate-y-0">
                                                        {/* Quick View */}
                                                        <Link
                                                            href={`/shop-details?slug=${item.slug}`}
                                                            aria-label="View product details"
                                                            className="flex items-center justify-center w-8 h-8 rounded-[5px] shadow-1 ease-out duration-200"
                                                            style={{ background: "#0A0A0A", color: "#F6F5F2" }}
                                                        >
                                                            <svg className="fill-current w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M8.00016 5.5C6.61945 5.5 5.50016 6.61929 5.50016 8C5.50016 9.38071 6.61945 10.5 8.00016 10.5C9.38087 10.5 10.5002 9.38071 10.5002 8C10.5002 6.61929 9.38087 5.5 8.00016 5.5ZM6.50016 8C6.50016 7.17157 7.17174 6.5 8.00016 6.5C8.82859 6.5 9.50016 7.17157 9.50016 8C9.50016 8.82842 8.82859 9.5 8.00016 9.5C7.17174 9.5 6.50016 8.82842 6.50016 8Z" />
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M8.00016 2.16666C4.99074 2.16666 2.96369 3.96946 1.78721 5.49791L1.76599 5.52546C1.49992 5.87102 1.25487 6.18928 1.08862 6.5656C0.910592 6.96858 0.833496 7.40779 0.833496 8C0.833496 8.5922 0.910592 9.03142 1.08862 9.4344C1.25487 9.81072 1.49992 10.129 1.76599 10.4745L1.78721 10.5021C2.96369 12.0305 4.99074 13.8333 8.00016 13.8333C11.0096 13.8333 13.0366 12.0305 14.2131 10.5021L14.2343 10.4745C14.5004 10.129 14.7455 9.81072 14.9117 9.4344C15.0897 9.03142 15.1668 8.5922 15.1668 8C15.1668 7.40779 15.0897 6.96858 14.9117 6.5656C14.7455 6.18927 14.5004 5.87101 14.2343 5.52545L14.2131 5.49791C13.0366 3.96946 11.0096 2.16666 8.00016 2.16666ZM2.57964 6.10786C3.66592 4.69661 5.43374 3.16666 8.00016 3.16666C10.5666 3.16666 12.3344 4.69661 13.4207 6.10786C13.7131 6.48772 13.8843 6.7147 13.997 6.9697C14.1023 7.20801 14.1668 7.49929 14.1668 8C14.1668 8.50071 14.1023 8.79199 13.997 9.0303C13.8843 9.28529 13.7131 9.51227 13.4207 9.89213C12.3344 11.3034 10.5666 12.8333 8.00016 12.8333C5.43374 12.8333 3.66592 11.3034 2.57964 9.89213C2.28725 9.51227 2.11599 9.28529 2.00334 9.0303C1.89805 8.79199 1.8335 8.50071 1.8335 8C1.8335 7.49929 1.89805 7.20801 2.00334 6.9697C2.11599 6.7147 2.28725 6.48772 2.57964 6.10786Z" />
                                                            </svg>
                                                        </Link>

                                                        {/* Add To Cart */}
                                                        <button
                                                            onClick={handleAddToCart.bind(null, item)}
                                                            className="inline-flex font-medium text-xs py-[6px] px-3 rounded-[5px] text-white ease-out duration-200"
                                                            style={{
                                                                background: addedToCart[item.id] ? "#16a34a" : "#0A0A0A",
                                                                transform: addedToCart[item.id] ? "scale(1.05)" : "scale(1)",
                                                            }}
                                                        >
                                                            {addedToCart[item.id] ? "Added ✓" : "Add to cart"}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="p-4 flex flex-col flex-1">
                                                    <p className="text-[10px] font-light tracking-[0.1em] uppercase mb-0.5" style={{ color: "#8A8A8A" }}>{item.category}</p>
                                                    <h3 className="text-sm font-light text-dark mb-1 truncate" title={item.name}>{item.name}</h3>
                                                    <p className="text-[10px] font-light italic mb-3" style={{ color: "#C8C4BF" }}>{item.matchReason}</p>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-light text-sm text-dark">${item.price}</span>
                                                    </div>

                                                    {/* Push Wishlist button to the very bottom */}
                                                    <button
                                                        onClick={() => handleToggleWishlist(item)}
                                                        className="w-full mt-auto flex items-center justify-center gap-2 text-[10px] font-light py-1.5 uppercase tracking-[0.08em] ease-out duration-200"
                                                        style={{
                                                            background: "transparent",
                                                            color: wishlistItems.some(w => w.id === item.id) ? "#ef4444" : "#8A8A8A",
                                                            border: `1px solid ${wishlistItems.some(w => w.id === item.id) ? "#ef4444" : "#E8E4DF"}`,
                                                        }}
                                                    >
                                                        {wishlistItems.some(w => w.id === item.id) ? (
                                                            <>
                                                                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M8 13.4s-6.3-4-6.3-7.5C1.7 3.6 3.2 2 5 2c1 0 2.1.6 3 1.7C8.9 2.6 10 2 11 2c1.8 0 3.3 1.6 3.3 3.9C14.3 9.4 8 13.4 8 13.4z" />
                                                                </svg>
                                                                Saved
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path fillRule="evenodd" clipRule="evenodd" d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914c0 1.46493.59948 2.59409 1.45886 3.56178C5.91664 10.4507 6.77405 11.1118 7.61025 11.7564c.19861.1531.39602.3053.58995.4582.35069.2764.66352.5191.96504.6953.30169.1763.54453.2568.75093.2568.2064 0 .44924-.0805.75093-.2568.30152-.1762.61435-.4189.96504-.6953.19393-.1529.39134-.3051.58995-.4582.8362-.6446 1.6936-1.3057 2.4019-2.10322.8594-.96769 1.4589-2.09685 1.4589-3.56178 0-1.43391-.8103-2.63638-1.9163-3.14194-1.0744-.49114-2.51816-.36107-3.89014 1.06436-.09426.09793-.22432.15327-.36024.15327-.13592 0-.26598-.05534-.36025-.15327-1.37198-1.42543-2.81571-1.5555-3.89018-1.06436zM7.99992 2.97255C6.45855 1.5935 4.73256 1.40058 3.33376 2.03998 1.85639 2.71528.833252 4.28336.833252 6.0914c0 1.77702.740328 3.13264 1.711148 4.2258C3.32183 11.1926 4.2734 11.9253 5.1138 12.5724c.19051.1467.37531.289.55106.4275.3415.2692.70809.5563 1.07961.7734.37135.217.79518.3934 1.25545.3934s.8841-.1764 1.25545-.3934c.37152-.2171.73811-.5042 1.07961-.7734.1758-.1385.3606-.2808.5511-.4275.8404-.6471 1.792-1.3798 2.5694-2.2552C14.4263 9.22404 15.1666 7.86842 15.1666 6.0914c0-1.80804-1.0232-3.37612-2.5005-4.05142-1.3988-.6394-3.1249-.44648-4.66618.93257z" fill="currentColor" />
                                                                </svg>
                                                                Wishlist
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
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
