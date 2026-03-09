"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

interface AddToLookbookModalProps {
    productId: string;
    onClose: () => void;
}

type Lookbook = { id: string; name: string; cover_image: string | null };

/**
 * Modal — shows the current user's lookbooks and lets them add the product.
 * Includes inline "Create new lookbook" form so user never has to leave the page.
 */
const AddToLookbookModal = ({ productId, onClose }: AddToLookbookModalProps) => {
    const { user } = useCurrentUser();
    const supabase = createClient();

    const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState<string | null>(null);
    const [added, setAdded] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);

    // Create new lookbook form state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);

    /* ── Fetch user's lookbooks ──────────────────────────────────── */
    const fetchLookbooks = () => {
        if (!user) { setLoading(false); return; }
        supabase
            .from("lookbooks")
            .select("id, title, cover_image")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .then(({ data, error }) => {
                if (!error) {
                    const mapped = data.map((lb: any) => ({
                        id: lb.id,
                        name: lb.title, // map title to name for UI
                        cover_image: lb.cover_image
                    }));
                    setLookbooks(mapped);
                }
                setLoading(false);
            });
    };

    useEffect(() => { fetchLookbooks(); }, [user]);

    /* ── Add product to selected lookbook ───────────────────────── */
    const handleAdd = async (lookbookId: string) => {
        setAdding(lookbookId);
        setError(null);
        const { error } = await supabase
            .from("lookbook_products")
            .upsert({ lookbook_id: lookbookId, product_id: productId }, { onConflict: "lookbook_id,product_id" });
        if (error) {
            setError("Failed to add to lookbook. Please try again.");
        } else {
            setAdded((prev) => ({ ...prev, [lookbookId]: true }));
            toast.success("Added to lookbook!");
        }
        setAdding(null);
    };

    /* ── Create new lookbook inline ─────────────────────────────── */
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !user) return;
        setCreating(true);
        setError(null);

        const slug = newName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();

        const { data, error: createErr } = await supabase
            .from("lookbooks")
            .insert({ title: newName.trim(), slug, user_id: user.id, tag: "User" })
            .select("id, title, cover_image")
            .single();

        if (createErr || !data) {
            setError("Failed to create lookbook. Please try again.");
            setCreating(false);
            return;
        }

        // Automatically add the current product to the new lookbook
        await supabase
            .from("lookbook_products")
            .upsert({ lookbook_id: data.id, product_id: productId }, { onConflict: "lookbook_id,product_id" });

        const newLb: Lookbook = { id: data.id, name: data.title, cover_image: data.cover_image };
        setLookbooks((prev) => [newLb, ...prev]);
        setAdded((prev) => ({ ...prev, [data.id]: true }));
        setNewName("");
        setShowCreateForm(false);
        setCreating(false);
        toast.success(`Lookbook "${data.title}" created and product added!`);
    };

    /* ── Backdrop close ─────────────────────────────────────────── */
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(10, 10, 10, 0.5)", backdropFilter: "blur(4px)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Add to Lookbook"
            onClick={handleBackdropClick}
        >
            <div
                className="relative w-full max-w-md bg-white shadow-2xl"
                style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E4DF]">
                    <h2 className="font-playfair font-normal text-xl text-dark" style={{ letterSpacing: "-0.01em" }}>
                        Add to Lookbook
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="w-8 h-8 flex items-center justify-center text-dark hover:opacity-50 transition-opacity"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    {!user && (
                        <div className="text-center py-8">
                            <p className="text-sm font-light text-dark mb-4">Sign in to save products to your lookbooks.</p>
                            <Link
                                href="/signin"
                                className="inline-block text-xs font-light tracking-[0.15em] uppercase px-8 py-3 transition-all duration-300"
                                style={{ background: "#1A1A1A", color: "#F6F5F2" }}
                                onClick={onClose}
                            >
                                Sign In
                            </Link>
                        </div>
                    )}

                    {user && loading && (
                        <div className="space-y-4 py-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse flex items-center gap-4">
                                    <div className="w-14 h-14 bg-[#E8E4DF]" />
                                    <div className="flex-1 h-4 bg-[#E8E4DF] rounded" />
                                </div>
                            ))}
                        </div>
                    )}

                    {user && !loading && (
                        <>
                            {lookbooks.length === 0 && !showCreateForm && (
                                <div className="text-center py-6">
                                    <p className="text-sm font-light mb-4" style={{ color: "#8A8A8A" }}>
                                        You have no lookbooks yet.
                                    </p>
                                </div>
                            )}

                            {lookbooks.length > 0 && (
                                <>
                                    <p className="text-xs font-light tracking-wide uppercase mb-5" style={{ color: "#8A8A8A" }}>
                                        Select a Lookbook
                                    </p>
                                    <ul className="space-y-3 mb-6">
                                        {lookbooks.map((lb) => (
                                            <li
                                                key={lb.id}
                                                className="flex items-center gap-4 border border-[#E8E4DF] p-3 hover:border-dark transition-colors duration-200"
                                            >
                                                {/* Thumbnail */}
                                                <div
                                                    className="w-14 h-14 flex-shrink-0 overflow-hidden"
                                                    style={{ background: lb.cover_image ? undefined : "#1A1A1A" }}
                                                >
                                                    {lb.cover_image ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={lb.cover_image} alt={lb.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                                <rect x="3" y="3" width="7" height="7" stroke="white" strokeWidth="1.2" />
                                                                <rect x="14" y="3" width="7" height="7" stroke="white" strokeWidth="1.2" />
                                                                <rect x="3" y="14" width="7" height="7" stroke="white" strokeWidth="1.2" />
                                                                <rect x="14" y="14" width="7" height="7" stroke="white" strokeWidth="1.2" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Name */}
                                                <p className="flex-1 text-sm font-light text-dark">{lb.name}</p>
                                                {/* Add button */}
                                                <button
                                                    onClick={() => handleAdd(lb.id)}
                                                    disabled={!!adding || added[lb.id]}
                                                    className="flex-shrink-0 text-xs font-light tracking-[0.12em] uppercase px-4 py-2 transition-all duration-200 disabled:opacity-50"
                                                    style={{
                                                        background: added[lb.id] ? "#F6F5F2" : "#1A1A1A",
                                                        color: added[lb.id] ? "#1A1A1A" : "#F6F5F2",
                                                        border: added[lb.id] ? "1px solid #E8E4DF" : "none",
                                                    }}
                                                >
                                                    {adding === lb.id ? "Adding..." : added[lb.id] ? "Added ✓" : "Add"}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

                            {/* Inline Create Lookbook form */}
                            <div className="border-t border-[#E8E4DF] pt-5">
                                {!showCreateForm ? (
                                    <button
                                        onClick={() => setShowCreateForm(true)}
                                        className="text-xs font-light tracking-[0.15em] uppercase text-dark hover:opacity-60 transition-opacity duration-200 flex items-center gap-1.5"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Create New Lookbook
                                    </button>
                                ) : (
                                    <form onSubmit={handleCreate} className="space-y-3">
                                        <p className="text-xs font-light tracking-[0.15em] uppercase" style={{ color: "#8A8A8A" }}>
                                            New Lookbook
                                        </p>
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="Lookbook name…"
                                            autoFocus
                                            className="w-full border border-[#E8E4DF] px-4 py-2.5 text-sm font-light outline-none focus:border-[#1A1A1A] ease-out duration-200"
                                            required
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={creating || !newName.trim()}
                                                className="flex-1 text-xs font-light tracking-[0.15em] uppercase py-2.5 transition-all duration-200 disabled:opacity-50"
                                                style={{ background: "#1A1A1A", color: "#F6F5F2" }}
                                            >
                                                {creating ? "Creating…" : "Create & Add"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setShowCreateForm(false); setNewName(""); }}
                                                className="px-4 py-2.5 text-xs font-light border border-[#E8E4DF] text-dark hover:border-dark transition-colors duration-200"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddToLookbookModal;
