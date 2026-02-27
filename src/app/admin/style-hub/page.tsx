"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import AestheticColorWheel from "@/components/Admin/AestheticColorWheel";
import Image from "next/image";
import toast from "react-hot-toast";

type World = {
    id: string;
    name: string;
    user_id: string;
    image_url?: string;
    filters: Record<string, string>;
    created_at: string;
    profiles?: { full_name?: string; email?: string };
};

type FilterOption = {
    id: string;
    category: string;
    label: string;
    value: string;
    sort_order: number;
    is_active: boolean;
};

const CATEGORIES = ["color", "style", "mood", "occasion", "season", "material", "brand"];

export default function AdminStyleHub() {
    const supabase = createClient();
    const [tab, setTab] = useState<"worlds" | "filters">("worlds");

    // Worlds state
    const [worlds, setWorlds] = useState<World[]>([]);
    const [worldsLoading, setWorldsLoading] = useState(true);

    // Filter options state
    const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
    const [filtersLoading, setFiltersLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState("style");
    const [newLabel, setNewLabel] = useState("");
    const [newValue, setNewValue] = useState("");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchWorlds();
        fetchFilterOptions();
    }, []);

    const fetchWorlds = async () => {
        setWorldsLoading(true);
        const { data, error } = await supabase
            .from("saved_style_worlds")
            .select("*, profiles(full_name, email)")
            .order("created_at", { ascending: false });

        if (!error && data) setWorlds(data as World[]);
        setWorldsLoading(false);
    };

    const deleteWorld = async (id: string) => {
        if (!confirm("Delete this world?")) return;
        const { error } = await supabase.from("saved_style_worlds").delete().eq("id", id);
        if (!error) {
            setWorlds((prev) => prev.filter((w) => w.id !== id));
            toast.success("World deleted.");
        }
    };

    const fetchFilterOptions = async () => {
        setFiltersLoading(true);
        const { data, error } = await supabase
            .from("style_hub_filters")
            .select("*")
            .order("category")
            .order("sort_order");

        if (!error && data) setFilterOptions(data as FilterOption[]);
        setFiltersLoading(false);
    };

    const addFilterOption = async () => {
        if (!newLabel.trim()) return;
        setAdding(true);
        const valueToInsert = filterCategory === "color" ? newValue.trim() || newLabel.trim() : newLabel.trim();
        const existing = filterOptions.filter((f) => f.category === filterCategory);
        const { data, error } = await supabase
            .from("style_hub_filters")
            .insert({
                category: filterCategory,
                label: newLabel.trim(),
                value: valueToInsert,
                sort_order: existing.length + 1,
            })
            .select()
            .single();

        if (!error && data) {
            setFilterOptions((prev) => [...prev, data as FilterOption]);
            setNewLabel("");
            setNewValue("");
            toast.success("Filter option added!");
        } else {
            toast.error("Failed to add option.");
        }
        setAdding(false);
    };

    const toggleActive = async (option: FilterOption) => {
        const { error } = await supabase
            .from("style_hub_filters")
            .update({ is_active: !option.is_active })
            .eq("id", option.id);

        if (!error) {
            setFilterOptions((prev) =>
                prev.map((f) => (f.id === option.id ? { ...f, is_active: !f.is_active } : f))
            );
        }
    };

    const deleteFilterOption = async (id: string) => {
        if (!confirm("Delete this filter option?")) return;
        const { error } = await supabase.from("style_hub_filters").delete().eq("id", id);
        if (!error) {
            setFilterOptions((prev) => prev.filter((f) => f.id !== id));
            toast.success("Option deleted.");
        }
    };

    const categoryOptions = filterOptions.filter((f) => f.category === filterCategory);

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-medium text-dark">Style Hub Admin</h1>
                <p className="text-sm text-dark-4 mt-1">
                    Manage saved worlds and control all filter options shown to users.
                </p>
            </div>

            {/* Tab switcher */}
            <div className="flex mb-6 border-b border-gray-3">
                {(["worlds", "filters"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-6 py-3 text-sm font-medium transition ${tab === t
                            ? "text-dark border-b-2 border-dark -mb-px"
                            : "text-dark-4 hover:text-dark"
                            }`}
                    >
                        {t === "worlds" ? "User Worlds" : "Filter Options"}
                    </button>
                ))}
            </div>

            {/* ── Worlds Tab ─────────────────────────────────────── */}
            {tab === "worlds" && (
                <>
                    {worldsLoading ? (
                        <div className="text-center py-12 text-dark-4">Loading worlds...</div>
                    ) : worlds.length === 0 ? (
                        <div className="text-center py-12 text-dark-4">No saved worlds yet.</div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-1 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-3">
                                            <th className="text-left px-5 py-4 font-medium text-dark-3">World</th>
                                            <th className="text-left px-5 py-4 font-medium text-dark-3">User</th>
                                            <th className="text-left px-5 py-4 font-medium text-dark-3">Filters</th>
                                            <th className="text-left px-5 py-4 font-medium text-dark-3">Created</th>
                                            <th className="text-left px-5 py-4 font-medium text-dark-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {worlds.map((world) => (
                                            <tr key={world.id} className="border-b border-gray-3 hover:bg-gray-1 transition">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-gray-2 relative">
                                                            {world.image_url ? (
                                                                <Image src={world.image_url} alt={world.name} fill className="object-cover" sizes="40px" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xs">🌍</div>
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-dark">{world.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-dark-4">
                                                    {world.profiles?.full_name || world.profiles?.email || "—"}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.entries(world.filters)
                                                            .filter(([, v]) => v)
                                                            .map(([k, v]) => (
                                                                <span key={k} className="text-[10px] px-2 py-0.5 bg-gray-2 text-dark-4 rounded capitalize">
                                                                    {k}: {v}
                                                                </span>
                                                            ))}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-dark-4">
                                                    {new Date(world.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <button onClick={() => deleteWorld(world.id)} className="text-red hover:underline text-xs">
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    <p className="mt-4 text-sm text-dark-4">
                        {worlds.length} world{worlds.length !== 1 ? "s" : ""} from{" "}
                        {new Set(worlds.map((w) => w.user_id)).size} user{new Set(worlds.map((w) => w.user_id)).size !== 1 ? "s" : ""}.
                    </p>
                </>
            )}

            {/* ── Filter Options Tab ─────────────────────────────── */}
            {tab === "filters" && (
                <div>
                    {/* Category selector */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-1.5 text-xs rounded-full capitalize transition ${filterCategory === cat
                                    ? "bg-dark text-white"
                                    : "bg-gray-2 text-dark-4 hover:bg-gray-3"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Add new option */}
                    <div className="bg-white rounded-xl shadow-1 p-5 mb-6">
                        <h3 className="text-base font-medium text-dark mb-4 capitalize">
                            Add new &ldquo;{filterCategory}&rdquo; option
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder={filterCategory === "color" ? "Label (e.g. Purple)" : "Label (e.g. Bohemian)"}
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addFilterOption()}
                                    className="flex-1 px-4 py-2.5 border border-gray-3 rounded-md text-sm outline-none focus:border-dark"
                                />
                                <button
                                    onClick={addFilterOption}
                                    disabled={adding || !newLabel.trim()}
                                    className="px-5 py-2.5 bg-dark text-white text-sm rounded-md hover:bg-dark-2 transition disabled:opacity-50"
                                >
                                    {adding ? "Adding..." : "Add"}
                                </button>
                            </div>

                            {filterCategory === "color" && (
                                <div className="w-full flex flex-col items-center justify-center p-6 border border-gray-3 rounded-lg bg-gray-1">
                                    <p className="text-sm font-medium text-dark mb-6">Select the color value for &ldquo;{newLabel || "New Option"}&rdquo;</p>
                                    <AestheticColorWheel
                                        size={180}
                                        theme="light"
                                        selectedColors={newValue ? [newValue] : []}
                                        onChange={(c) => setNewValue(c)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Options list */}
                    {filtersLoading ? (
                        <div className="text-center py-8 text-dark-4">Loading options...</div>
                    ) : categoryOptions.length === 0 ? (
                        <div className="text-center py-8 text-dark-4">No options for this category yet.</div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-1 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-3">
                                        <th className="text-left px-5 py-3 font-medium text-dark-3">Label</th>
                                        <th className="text-left px-5 py-3 font-medium text-dark-3">Value</th>
                                        <th className="text-left px-5 py-3 font-medium text-dark-3">Status</th>
                                        <th className="text-left px-5 py-3 font-medium text-dark-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryOptions.map((opt) => (
                                        <tr key={opt.id} className="border-b border-gray-3 hover:bg-gray-1 transition">
                                            <td className="px-5 py-3 text-dark flex items-center gap-2">
                                                {filterCategory === "color" && (
                                                    <span
                                                        className="w-4 h-4 rounded-full inline-block border border-gray-3"
                                                        style={{ background: opt.value }}
                                                    />
                                                )}
                                                {opt.label}
                                            </td>
                                            <td className="px-5 py-3 text-dark-4 font-mono text-xs">{opt.value}</td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${opt.is_active ? "bg-green-1 text-green" : "bg-gray-2 text-dark-4"}`}>
                                                    {opt.is_active ? "Active" : "Hidden"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => toggleActive(opt)}
                                                        className="text-blue-600 hover:underline text-xs"
                                                    >
                                                        {opt.is_active ? "Hide" : "Show"}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteFilterOption(opt.id)}
                                                        className="text-red hover:underline text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
