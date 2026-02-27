"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/app/context/AuthContext";
import CreateLookbookModal from "./CreateLookbookModal";

// Gradient backgrounds for collections without images
const bgGradients = [
    "linear-gradient(135deg, #0A0A0A 0%, #2C2C2C 100%)",
    "linear-gradient(135deg, #2C1810 0%, #6B3A2A 100%)",
    "linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)",
    "linear-gradient(135deg, #1A1A1A 0%, #3A3A2A 100%)",
    "linear-gradient(135deg, #1A0D0D 0%, #3D1A1A 100%)",
    "linear-gradient(135deg, #1B1B0A 0%, #3B3B1A 100%)",
];

type LookbookItem = {
    id: string;
    name: string;
    slug: string;
    description: string;
    tag: "AI" | "Trending" | "User";
    styles: string[];
    colors: string[];
    cover_image?: string;
    image_url?: string;
    bg?: string;
    profiles?: {
        id: string;
        full_name: string;
        avatar_url: string;
    } | null;
};

export default function Lookbook() {
    const [activeTag, setActiveTag] = useState<string>("All");
    const [saved, setSaved] = useState<string[]>([]);
    const [collections, setCollections] = useState<LookbookItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useCurrentUser();
    const supabase = createClient();
    const router = useRouter();

    const fetchCollections = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("collections")
            .select("*, profiles(id, full_name, avatar_url)")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setCollections(data as LookbookItem[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const tags = ["All", "AI", "Trending", "User"];
    const filtered =
        activeTag === "All"
            ? collections
            : collections.filter((l) => l.tag === activeTag);

    const toggleSave = (id: string) =>
        setSaved((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );

    return (
        <main style={{ background: "#F6F5F2" }}>
            {/* ── Hero ────────────────────────────────────────────── */}
            <section
                className="relative flex flex-col items-center justify-center text-center pt-[120px] lg:pt-[180px] pb-20 px-4"
                style={{ background: "#0A0A0A" }}
            >
                <span
                    className="block text-xs font-light tracking-[0.35em] uppercase mb-6"
                    style={{ color: "rgba(246,245,242,0.45)" }}
                >
                    Curated Collections
                </span>
                <h1
                    className="font-playfair text-5xl md:text-6xl font-normal mb-5"
                    style={{ color: "#F6F5F2", letterSpacing: "-0.03em" }}
                >
                    Lookbook
                </h1>
                <p
                    className="font-light text-sm max-w-md leading-relaxed mb-8"
                    style={{ color: "rgba(246,245,242,0.5)" }}
                >
                    Discover complete outfit ideas crafted by AI, popular trends, or our
                    style team. Every look links directly to shoppable items.
                </p>
                {user && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 border border-white/20 text-white hover:bg-white hover:text-black transition uppercase text-xs tracking-wider"
                    >
                        Create Your Lookbook
                    </button>
                )}
            </section>

            {/* ── Filters ─────────────────────────────────────────── */}
            <section
                className="sticky top-[72px] z-10"
                style={{
                    background: "#F6F5F2",
                    borderBottom: "1px solid #E8E4DF",
                }}
            >
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 py-4 flex gap-2 flex-wrap">
                    {tags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className="px-4 py-1.5 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
                            style={
                                activeTag === tag
                                    ? { background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }
                                    : { background: "transparent", color: "#8A8A8A", border: "1px solid #C8C4BF" }
                            }
                        >
                            {tag === "AI" ? "AI Generated" : tag === "Trending" ? "Trending" : tag === "User" ? "User Created" : "All"}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Grid ────────────────────────────────────────────── */}
            <section className="py-16">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-56 bg-gray-2 rounded-sm mb-4" />
                                    <div className="h-4 bg-gray-2 rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-gray-2 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="font-playfair text-2xl text-dark mb-3">No Lookbooks yet</p>
                            <p className="font-light text-sm text-dark-4">
                                {user
                                    ? "Be the first to create one — click \"Create Your Lookbook\" above."
                                    : "Sign in to create your own lookbook or explore our curated AI collections."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {filtered.map((look, index) => {
                                const bg = look.image_url
                                    ? undefined
                                    : look.bg || bgGradients[index % bgGradients.length];
                                return (
                                    <div
                                        key={look.id}
                                        className="group overflow-hidden"
                                        style={{ border: "1px solid #E8E4DF", background: "#FFFFFF" }}
                                    >
                                        {/* Dark editorial panel */}
                                        <div
                                            className="relative h-56 w-full ease-out duration-500 group-hover:scale-[1.02] overflow-hidden"
                                            style={look.cover_image || look.image_url
                                                ? { backgroundImage: `url(${look.cover_image || look.image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                                                : { background: bg }}
                                        >
                                            {/* Gradient overlay */}
                                            <div
                                                className="absolute inset-0 flex flex-col justify-end p-5"
                                                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)" }}
                                            >
                                                <span
                                                    className="block text-[9px] font-light tracking-[0.25em] uppercase mb-1"
                                                    style={{ color: "rgba(246,245,242,0.55)" }}
                                                >
                                                    {look.tag}
                                                </span>
                                                <h3
                                                    className="font-playfair text-xl font-normal"
                                                    style={{ color: "#F6F5F2" }}
                                                >
                                                    {look.name}
                                                </h3>
                                            </div>

                                            {/* Creator Avatar Overlay */}
                                            {look.profiles && look.tag === "User" && (
                                                <div
                                                    className="absolute bottom-4 right-4 group/avatar"
                                                    title={`Created by ${look.profiles.full_name || 'User'}`}
                                                >
                                                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-100 shadow-md flex justify-center items-center text-dark font-medium text-xs">
                                                        {look.profiles.avatar_url ? (
                                                            <img
                                                                src={look.profiles.avatar_url}
                                                                alt={look.profiles.full_name || 'Creator'}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span>{(look.profiles.full_name || '?').charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>

                                                    {/* Tooltip on hover */}
                                                    <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-dark text-white text-[10px] tracking-wide py-1.5 px-3 rounded-md pointer-events-none z-10">
                                                        By {look.profiles.full_name || 'Anonymous User'}
                                                        <div className="absolute top-full right-4 w-2 h-2 bg-dark transform rotate-45 -mt-1" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card body */}
                                        <div className="p-5">
                                            <p
                                                className="text-sm font-light mb-4 leading-relaxed"
                                                style={{ color: "#8A8A8A" }}
                                            >
                                                {look.description}
                                            </p>

                                            {/* Style tags */}
                                            {look.styles && look.styles.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {look.styles.map((s) => (
                                                        <span
                                                            key={s}
                                                            className="text-[10px] font-light tracking-[0.1em] uppercase px-2 py-1"
                                                            style={{ border: "1px solid #E8E4DF", color: "#8A8A8A" }}
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Colors */}
                                            {look.colors && look.colors.length > 0 && (
                                                <ul className="space-y-1.5 mb-5">
                                                    {look.colors.slice(0, 4).map((item) => (
                                                        <li
                                                            key={item}
                                                            className="text-xs font-light flex items-center gap-2.5"
                                                            style={{ color: "#4A4A4A" }}
                                                        >
                                                            <span
                                                                className="w-1 h-1 flex-shrink-0 rounded-full"
                                                                style={{ background: "#1A1A1A" }}
                                                            />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => router.push(`/lookbook/${look.slug}`)}
                                                    className="flex-1 py-2.5 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
                                                    style={{ background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}
                                                    onMouseEnter={(e) => {
                                                        (e.currentTarget as HTMLElement).style.background = "#2C2C2C";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (e.currentTarget as HTMLElement).style.background = "#0A0A0A";
                                                    }}
                                                >
                                                    Shop This Look
                                                </button>
                                                <button
                                                    onClick={() => toggleSave(look.id)}
                                                    className="py-2.5 px-3 text-xs font-light ease-out duration-200"
                                                    style={
                                                        saved.includes(look.id)
                                                            ? { background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }
                                                            : { background: "transparent", color: "#8A8A8A", border: "1px solid #E8E4DF" }
                                                    }
                                                >
                                                    {saved.includes(look.id) ? "✓ Saved" : "♡ Save"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <CreateLookbookModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCollections}
            />
        </main>
    );
}
