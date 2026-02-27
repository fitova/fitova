"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

type FilterOption = {
    id: string;
    category: string;
    value: string;
};

type Product = {
    id: string;
    name: string;
    price: number;
    product_images?: { url: string; type: string }[];
};

const CreateLookbookModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const supabase = createClient();

    const [step, setStep] = useState(1);

    // Step 1: Details
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Step 2: Filters
    const [styleOptions, setStyleOptions] = useState<FilterOption[]>([]);
    const [colorOptions, setColorOptions] = useState<FilterOption[]>([]);
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [loadingFilters, setLoadingFilters] = useState(false);

    // Step 3: Products
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [wishlistProducts, setWishlistProducts] = useState<string[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setTitle("");
            setDescription("");
            setSelectedStyles([]);
            setSelectedColors([]);
            setSelectedProducts([]);
            setShowOnlyWishlist(false);
        }
    }, [isOpen]);

    // Fetch Filters when reaching Step 2
    useEffect(() => {
        if (isOpen && step === 2 && styleOptions.length === 0) {
            const fetchFilters = async () => {
                setLoadingFilters(true);
                const { data } = await supabase.from("style_hub_filters").select("*");
                if (data) {
                    setStyleOptions(data.filter(f => f.category.toLowerCase() === "style"));
                    setColorOptions(data.filter(f => f.category.toLowerCase() === "color"));
                }
                setLoadingFilters(false);
            };
            fetchFilters();
        }
    }, [isOpen, step, supabase]);

    // Fetch Products & Wishlist when reaching Step 3
    useEffect(() => {
        if (isOpen && step === 3 && allProducts.length === 0) {
            const fetchProducts = async () => {
                setLoadingProducts(true);

                // Fetch products with their thumbnail
                const { data: prods } = await supabase
                    .from("products")
                    .select("id, name, price, product_images(url, type)")
                    .order("created_at", { ascending: false });

                if (prods) setAllProducts(prods);

                // Fetch user wishlist
                if (user) {
                    const { data: wishData } = await supabase
                        .from("wishlist")
                        .select("product_id")
                        .eq("user_id", user.id);

                    if (wishData) {
                        setWishlistProducts(wishData.map(w => w.product_id));
                    }
                }

                setLoadingProducts(false);
            };
            fetchProducts();
        }
    }, [isOpen, step, supabase, user]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!user) {
            toast.error("You must be logged in to create a Lookbook.");
            return;
        }

        setIsSubmitting(true);
        const slug = `${title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")}-${Date.now()}`;

        // 1. Insert Collection
        const { data: collection, error } = await supabase.from("collections").insert({
            name: title,
            slug,
            description,
            tag: "User",
            user_id: user.id,
            generated_by_ai: false,
            styles: selectedStyles,
            colors: selectedColors,
        }).select("id").single();

        if (error || !collection) {
            console.error("Lookbook insert error:", error);
            toast.error(`Failed to create Lookbook: ${error?.message}`);
            setIsSubmitting(false);
            return;
        }

        // 2. Insert Products
        if (selectedProducts.length > 0) {
            const collectionProducts = selectedProducts.map(productId => ({
                collection_id: collection.id,
                product_id: productId
            }));

            const { error: prodError } = await supabase
                .from("collection_products")
                .insert(collectionProducts);

            if (prodError) {
                console.error("Failed to link products:", prodError);
                toast.error("Lookbook created, but failed to add some products.");
            }
        }

        setIsSubmitting(false);
        toast.success("Lookbook created successfully!");
        onSuccess();
        onClose();
    };

    const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
        if (list.includes(item)) setList(list.filter(i => i !== item));
        else setList([...list, item]);
    };

    const displayedProducts = showOnlyWishlist
        ? allProducts.filter(p => wishlistProducts.includes(p.id))
        : allProducts;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-t-[20px] sm:rounded-[10px] w-full h-[90vh] sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col relative overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-playfair text-dark mb-1">Create Lookbook</h2>
                        <div className="flex gap-2 text-xs font-light text-dark-4">
                            <span className={step === 1 ? "text-dark font-medium" : ""}>1. Details</span>
                            <span>•</span>
                            <span className={step === 2 ? "text-dark font-medium" : ""}>2. Styles</span>
                            <span>•</span>
                            <span className={step === 3 ? "text-dark font-medium" : ""}>3. Products</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-dark-5 hover:text-dark transition">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* STEP 1: Details */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm text-dark mb-1.5 font-medium">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-3 rounded-md focus:border-dark outline-none transition font-light text-sm"
                                    placeholder="E.g., Summer Minimalist Collection"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-dark mb-1.5 font-medium">Description</label>
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-3 rounded-md focus:border-dark outline-none transition font-light text-sm resize-none"
                                    placeholder="What is the vibe of this lookbook?"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Filters */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {loadingFilters ? (
                                <div className="py-12 flex justify-center"><div className="w-6 h-6 border rounded-full animate-spin border-dark/20 border-t-dark" /></div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm text-dark mb-3 font-medium">Select Styles</label>
                                        <div className="flex flex-wrap gap-2">
                                            {styleOptions.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => toggleSelection(opt.value, selectedStyles, setSelectedStyles)}
                                                    className={`px-3 py-1.5 text-xs font-light tracking-wider rounded-sm transition ${selectedStyles.includes(opt.value)
                                                        ? "bg-dark text-white border-dark"
                                                        : "bg-transparent text-dark-4 border-gray-3 hover:border-dark"
                                                        } border`}
                                                >
                                                    {opt.value}
                                                </button>
                                            ))}
                                            {styleOptions.length === 0 && <p className="text-xs text-dark-4">No styles found.</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-dark mb-3 font-medium">Select Colors</label>
                                        <div className="flex flex-wrap gap-2">
                                            {colorOptions.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => toggleSelection(opt.value, selectedColors, setSelectedColors)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-light tracking-wider rounded-sm transition ${selectedColors.includes(opt.value)
                                                        ? "bg-gray-100 text-dark border-dark"
                                                        : "bg-transparent text-dark-4 border-gray-3 hover:border-dark"
                                                        } border`}
                                                >
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: opt.value.toLowerCase().replace(' ', '') || '#000' }} />
                                                    {opt.value}
                                                </button>
                                            ))}
                                            {colorOptions.length === 0 && <p className="text-xs text-dark-4">No colors found.</p>}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* STEP 3: Products */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm text-dark font-medium">Include Products</label>
                                {user && (
                                    <button
                                        onClick={() => setShowOnlyWishlist(!showOnlyWishlist)}
                                        className={`text-xs font-light underline transition ${showOnlyWishlist ? 'text-dark font-medium' : 'text-dark-4'}`}
                                    >
                                        {showOnlyWishlist ? "Show All Products" : "Show My Wishlist Only"}
                                    </button>
                                )}
                            </div>

                            {loadingProducts ? (
                                <div className="py-12 flex justify-center"><div className="w-6 h-6 border rounded-full animate-spin border-dark/20 border-t-dark" /></div>
                            ) : displayedProducts.length === 0 ? (
                                <div className="py-12 text-center text-sm font-light text-dark-4 border border-dashed border-gray-200 rounded-md">
                                    {showOnlyWishlist ? "No products in your wishlist." : "No products available."}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-1 pb-4">
                                    {displayedProducts.map(product => {
                                        const isSelected = selectedProducts.includes(product.id);
                                        const thumb = product.product_images?.find(i => i.type === 'thumbnail')?.url || product.product_images?.[0]?.url;

                                        return (
                                            <div
                                                key={product.id}
                                                onClick={() => toggleSelection(product.id, selectedProducts, setSelectedProducts)}
                                                className={`cursor-pointer group relative rounded-md overflow-hidden border transition-all ${isSelected ? 'border-dark ring-1 ring-dark' : 'border-gray-200 hover:border-dark-4'
                                                    }`}
                                            >
                                                <div className="aspect-[3/4] bg-gray-50 relative">
                                                    {thumb ? (
                                                        <img src={thumb} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">No Img</div>
                                                    )}

                                                    {/* Checkbox overlay */}
                                                    <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-dark text-white' : 'bg-white/80 text-transparent border border-gray-300'
                                                        }`}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="p-2 bg-white">
                                                    <p className="text-[10px] font-light truncate text-dark">{product.name}</p>
                                                    <p className="text-[10px] font-medium text-dark mt-0.5">${product.price}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer / Actions */}
                <div className="p-6 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        className="text-xs font-medium tracking-wider uppercase text-dark-4 hover:text-dark px-4 py-2"
                    >
                        {step === 1 ? "Cancel" : "Back"}
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-dark-4 font-light mr-2">
                            {step === 3 && selectedProducts.length > 0 ? `${selectedProducts.length} items selected` : ''}
                        </span>

                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={step === 1 && !title.trim()}
                                className="bg-dark text-white px-8 py-2.5 rounded-sm font-medium uppercase tracking-wider text-xs hover:bg-dark-2 transition disabled:opacity-50"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-dark text-white px-8 py-2.5 rounded-sm font-medium uppercase tracking-wider text-xs hover:bg-dark-2 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting && <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
                                Create Lookbook
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateLookbookModal;
