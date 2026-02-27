"use client";
import React, { useState } from "react";
import { useStyleHub, SavedWorld } from "@/app/context/StyleHubContext";
import SaveWorldModal from "./SaveWorldModal";
import AestheticColorWheel from "../Admin/AestheticColorWheel";

const StyleHubModal = () => {
    const {
        isOpen, closeStyleHub,
        filters, setFilter, resetFilters,
        saveWorld, savedWorlds, applyWorld, deleteWorld,
        filterOptions,
    } = useStyleHub();

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [activePanel, setActivePanel] = useState<"filters" | "worlds">("filters");
    const [selectedWorld, setSelectedWorld] = useState<SavedWorld | null>(null);

    // Group filter options by category
    const getOptions = (category: string) =>
        filterOptions.filter((o) => o.category === category);

    const colorOptions = getOptions("color");
    const styleOptions = getOptions("style");
    const moodOptions = getOptions("mood");
    const occasionOptions = getOptions("occasion");
    const seasonOptions = getOptions("season");
    const materialOptions = getOptions("material");
    const brandOptions = getOptions("brand");

    const handleSave = async (name: string, imageUrl?: string) => {
        await saveWorld(name, imageUrl);
    };

    const handleApplyWorld = (world: SavedWorld) => {
        applyWorld(world);
        setSelectedWorld(null);
        setActivePanel("filters");
    };

    const handleDeleteWorld = async (world: SavedWorld) => {
        if (!confirm(`Delete "${world.name}"?`)) return;
        await deleteWorld(world.id);
        setSelectedWorld(null);
    };

    if (!isOpen) return null;

    /* ── World Detail View ───────────────────────────────────── */
    if (selectedWorld) {
        const activeFilters = Object.entries(selectedWorld.filters).filter(([, v]) => v);
        const filterLabels: Record<string, string> = {
            color: "Color", style: "Style", mood: "Mood",
            occasion: "Occasion", season: "Season",
            material: "Material", brand: "Brand",
        };

        return (
            <>
                <div className="fixed inset-0 bg-black/60 z-[99998] backdrop-blur-[2px]" onClick={closeStyleHub} />
                <div
                    className="fixed bottom-0 sm:top-0 right-0 h-[85dvh] sm:h-[100dvh] w-full sm:max-w-[400px] rounded-t-3xl sm:rounded-none z-[99999] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300"
                    style={{ background: "#0A0A0A" }}
                >
                    {/* Back header */}
                    <div
                        className="flex items-center gap-3 px-7 py-5 flex-shrink-0"
                        style={{ borderBottom: "1px solid rgba(246,245,242,0.08)" }}
                    >
                        <button
                            onClick={() => setSelectedWorld(null)}
                            className="flex items-center justify-center w-8 h-8"
                            style={{ border: "1px solid rgba(246,245,242,0.15)", color: "rgba(246,245,242,0.6)" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                        <div>
                            <h2 className="font-playfair text-base font-normal" style={{ color: "#F6F5F2" }}>
                                {selectedWorld.name}
                            </h2>
                            <p className="text-[10px] font-light" style={{ color: "rgba(246,245,242,0.35)" }}>
                                {new Date(selectedWorld.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                        </div>
                    </div>

                    {/* World content */}
                    <div className="flex-1 overflow-y-auto px-7 py-5">
                        {/* Cover image */}
                        {selectedWorld.image_url && (
                            <div className="w-full h-40 mb-6 overflow-hidden">
                                <img
                                    src={selectedWorld.image_url}
                                    alt={selectedWorld.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        )}

                        {/* Selected filters */}
                        {activeFilters.length === 0 ? (
                            <p className="text-sm font-light" style={{ color: "rgba(246,245,242,0.4)" }}>
                                No filters were set for this world.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-xs font-light tracking-[0.15em] uppercase" style={{ color: "rgba(246,245,242,0.4)" }}>
                                    Saved Filters
                                </p>
                                {activeFilters.map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between py-3"
                                        style={{ borderBottom: "1px solid rgba(246,245,242,0.06)" }}
                                    >
                                        <span className="text-xs font-light tracking-[0.1em] uppercase" style={{ color: "rgba(246,245,242,0.4)" }}>
                                            {filterLabels[key] || key}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {key === "color" && Array.isArray(value) && (
                                                <div className="flex flex-wrap gap-1">
                                                    {value.map((col: string) => (
                                                        <span
                                                            key={col}
                                                            className="w-4 h-4 inline-block rounded-full border"
                                                            style={{
                                                                background: col,
                                                                borderColor: "rgba(246,245,242,0.3)",
                                                            }}
                                                            title={col}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            <span className="text-sm font-light flex-1 text-right" style={{ color: "#F6F5F2" }}>
                                                {key === "color"
                                                    ? (Array.isArray(value) ? value.join(", ") : value)
                                                    : value}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div
                        className="px-7 py-5 flex gap-3 flex-shrink-0"
                        style={{ borderTop: "1px solid rgba(246,245,242,0.08)" }}
                    >
                        <button
                            onClick={() => handleDeleteWorld(selectedWorld)}
                            className="py-3 px-5 text-xs font-light tracking-[0.1em] uppercase ease-out duration-200"
                            style={{ border: "1px solid rgba(220,50,50,0.4)", color: "rgba(220,50,50,0.8)" }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,50,50,0.8)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,50,50,0.4)";
                            }}
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => handleApplyWorld(selectedWorld)}
                            className="flex-1 py-3 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
                            style={{ background: "#F6F5F2", color: "#0A0A0A" }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "#E8E4DF";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "#F6F5F2";
                            }}
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-[99998] backdrop-blur-[2px]"
                onClick={closeStyleHub}
            />

            {/* Drawer panel */}
            <div
                className="fixed top-0 right-0 h-[100dvh] w-full max-w-[400px] z-[99999] shadow-2xl flex flex-col overflow-hidden"
                style={{ background: "#0A0A0A" }}
            >
                {/* ── Header ───────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-7 py-6 flex-shrink-0"
                    style={{ borderBottom: "1px solid rgba(246,245,242,0.08)" }}
                >
                    <div>
                        <h2
                            className="font-playfair text-lg font-normal tracking-wide"
                            style={{ color: "#F6F5F2" }}
                        >
                            Style Hub
                        </h2>
                        <p
                            className="text-xs font-light mt-0.5 tracking-[0.05em]"
                            style={{ color: "rgba(246,245,242,0.4)" }}
                        >
                            Customize your fashion identity
                        </p>
                    </div>
                    <button
                        onClick={closeStyleHub}
                        className="flex items-center justify-center w-8 h-8 ease-out duration-200"
                        style={{ border: "1px solid rgba(246,245,242,0.15)", color: "rgba(246,245,242,0.6)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(246,245,242,0.1)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* ── Panel Switcher ─────────────────────────────── */}
                <div
                    className="flex flex-shrink-0"
                    style={{ borderBottom: "1px solid rgba(246,245,242,0.08)" }}
                >
                    {(["filters", "worlds"] as const).map((panel) => (
                        <button
                            key={panel}
                            onClick={() => setActivePanel(panel)}
                            className="flex-1 py-3 text-xs font-light tracking-[0.1em] uppercase ease-out duration-200"
                            style={
                                activePanel === panel
                                    ? { color: "#F6F5F2", borderBottom: "1px solid #F6F5F2" }
                                    : { color: "rgba(246,245,242,0.4)" }
                            }
                        >
                            {panel === "filters" ? "Filters" : `My Worlds${savedWorlds.length > 0 ? ` (${savedWorlds.length})` : ""}`}
                        </button>
                    ))}
                </div>

                {/* ── Filters Panel ─────────────────────────────────── */}
                {activePanel === "filters" && (
                    <>
                        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-6">
                            {/* Sleek Circular Color Wheel */}
                            <FilterSection title="Color Palette">
                                <div className="mt-6 mb-4 flex justify-center">
                                    <div className="py-2">
                                        <AestheticColorWheel
                                            size={240}
                                            customColors={colorOptions.map(c => c.value)}
                                            overridePresets={false}
                                            selectedColors={Array.isArray(filters.color) ? filters.color : (filters.color ? [filters.color] : [])}
                                            onChange={(newColor) => {
                                                const currentColors = Array.isArray(filters.color) ? filters.color : (filters.color ? [filters.color] : []);
                                                const newArr = currentColors.includes(newColor)
                                                    ? currentColors.filter(c => c !== newColor)
                                                    : [...currentColors, newColor];
                                                setFilter("color", newArr as any);
                                            }}
                                        />
                                    </div>
                                </div>
                                {Array.isArray(filters.color) && filters.color.length > 0 && (
                                    <div className="mt-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] text-white/40 uppercase tracking-[0.1em]">Selected Colors</span>
                                            <button
                                                onClick={() => setFilter("color", [] as any)}
                                                className="text-[10px] text-white/40 hover:text-white uppercase tracking-wider"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {filters.color.map(c => (
                                                <div key={c} className="flex items-center gap-2 bg-white/5 pl-1.5 pr-2.5 py-1.5 rounded-full border border-white/5">
                                                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                                                    <span className="text-[10px] font-mono text-white/70">{c}</span>
                                                    <button
                                                        onClick={() => setFilter("color", filters.color.filter(cx => cx !== c) as any)}
                                                        className="ml-1 text-white/30 hover:text-white/80"
                                                    >
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </FilterSection>

                            {/* Other chips-based filters */}
                            {([
                                { title: "Style", key: "style" as const, opts: styleOptions },
                                { title: "Mood", key: "mood" as const, opts: moodOptions },
                                { title: "Occasion", key: "occasion" as const, opts: occasionOptions },
                                { title: "Season", key: "season" as const, opts: seasonOptions },
                                { title: "Material", key: "material" as const, opts: materialOptions },
                                { title: "Brand", key: "brand" as const, opts: brandOptions },
                            ]).map(({ title, key, opts }) =>
                                opts.length > 0 ? (
                                    <FilterSection key={key} title={title}>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {opts.map((o) => (
                                                <ChipButton
                                                    key={o.value}
                                                    label={o.label}
                                                    active={filters[key] === o.value}
                                                    onClick={() => setFilter(key, filters[key] === o.value ? "" : o.value)}
                                                />
                                            ))}
                                        </div>
                                    </FilterSection>
                                ) : null
                            )}
                        </div>

                        {/* ── Footer ───────────────────────────────────────── */}
                        <div
                            className="px-7 py-5 flex gap-3 flex-shrink-0"
                            style={{ borderTop: "1px solid rgba(246,245,242,0.08)" }}
                        >
                            <button
                                onClick={resetFilters}
                                className="flex-1 py-3 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200"
                                style={{ border: "1px solid rgba(246,245,242,0.2)", color: "rgba(246,245,242,0.6)" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(246,245,242,0.6)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(246,245,242,0.2)"; }}
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => setShowSaveModal(true)}
                                className="flex-1 py-3 text-xs font-light tracking-[0.12em] uppercase ease-out duration-200 flex items-center justify-center gap-2"
                                style={{ background: "#F6F5F2", color: "#0A0A0A" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#E8E4DF"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#F6F5F2"; }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.5" />
                                    <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="1.5" />
                                    <polyline points="7 3 7 8 15 8" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                                Save World
                            </button>
                        </div>
                    </>
                )}

                {/* ── My Worlds Panel ───────────────────────────────── */}
                {activePanel === "worlds" && (
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        {savedWorlds.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-sm font-light" style={{ color: "rgba(246,245,242,0.4)" }}>
                                    You haven&apos;t saved any worlds yet.
                                </p>
                                <p className="text-xs font-light mt-2" style={{ color: "rgba(246,245,242,0.25)" }}>
                                    Use filters then click &ldquo;Save World&rdquo; to create one.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {savedWorlds.map((world) => {
                                    const activeCount = Object.values(world.filters).filter(Boolean).length;
                                    return (
                                        <button
                                            key={world.id}
                                            onClick={() => setSelectedWorld(world)}
                                            className="w-full flex items-center gap-3 p-3 ease-out duration-200 text-left"
                                            style={{ border: "1px solid rgba(246,245,242,0.08)" }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLElement).style.background = "rgba(246,245,242,0.05)";
                                                (e.currentTarget as HTMLElement).style.borderColor = "rgba(246,245,242,0.2)";
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                                (e.currentTarget as HTMLElement).style.borderColor = "rgba(246,245,242,0.08)";
                                            }}
                                        >
                                            {/* World thumbnail */}
                                            <div
                                                className="w-12 h-12 flex-shrink-0 overflow-hidden"
                                                style={{ background: "rgba(246,245,242,0.05)" }}
                                            >
                                                {world.image_url ? (
                                                    <img
                                                        src={world.image_url}
                                                        alt={world.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: "rgba(246,245,242,0.2)" }}>
                                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                                            <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="1.5" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* World info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-light truncate" style={{ color: "#F6F5F2" }}>
                                                    {world.name}
                                                </p>
                                                <p className="text-[10px] font-light mt-0.5" style={{ color: "rgba(246,245,242,0.35)" }}>
                                                    {activeCount > 0 ? `${activeCount} filter${activeCount !== 1 ? "s" : ""}` : "No filters set"}
                                                </p>
                                            </div>

                                            {/* Arrow */}
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "rgba(246,245,242,0.3)", flexShrink: 0 }}>
                                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Save World Modal */}
            <SaveWorldModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onSave={handleSave}
            />
        </>
    );
};

/* ── Sub-components ────────────────────────────────────────── */
const FilterSection = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <div style={{ borderBottom: "1px solid rgba(246,245,242,0.06)", paddingBottom: "1.25rem" }}>
        <h3
            className="text-xs font-light tracking-[0.2em] uppercase"
            style={{ color: "rgba(246,245,242,0.5)" }}
        >
            {title}
        </h3>
        {children}
    </div>
);

const ChipButton = ({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className="px-3 py-1.5 text-xs font-light tracking-[0.08em] ease-out duration-200"
        style={
            active
                ? { background: "#F6F5F2", color: "#0A0A0A", border: "1px solid #F6F5F2" }
                : {
                    background: "transparent",
                    color: "rgba(246,245,242,0.5)",
                    border: "1px solid rgba(246,245,242,0.15)",
                }
        }
    >
        {label}
    </button>
);

export default StyleHubModal;
