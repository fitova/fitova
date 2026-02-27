"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export type StyleHubFilters = {
    color: string[];
    style: string;
    mood: string;
    occasion: string;
    season: string;
    material: string;
    brand: string;
};

export type SavedWorld = {
    id: string;
    name: string;
    filters: StyleHubFilters;
    image_url?: string;
    created_at: string;
};

export type FilterOption = {
    id: string;
    category: string;
    label: string;
    value: string;
    sort_order: number;
};

type StyleHubContextType = {
    isOpen: boolean;
    openStyleHub: () => void;
    closeStyleHub: () => void;
    filters: StyleHubFilters;
    setFilter: (key: keyof StyleHubFilters, value: string) => void;
    resetFilters: () => void;
    applyWorld: (world: SavedWorld) => void;
    savedWorlds: SavedWorld[];
    saveWorld: (name: string, imageUrl?: string) => Promise<void>;
    deleteWorld: (id: string) => Promise<void>;
    filterOptions: FilterOption[];
};

const defaultFilters: StyleHubFilters = {
    color: [],
    style: "",
    mood: "",
    occasion: "",
    season: "",
    material: "",
    brand: "",
};

// Fallback filter options if DB fetch fails
const fallbackOptions: FilterOption[] = [
    ...(["Casual", "Formal", "Street", "Sporty", "Minimal", "Elegant"].map((v, i) => ({ id: v, category: "style", label: v, value: v, sort_order: i }))),
    ...(["Confident", "Chill", "Bold", "Elegant"].map((v, i) => ({ id: v, category: "mood", label: v, value: v, sort_order: i }))),
    ...(["Date", "Work", "Wedding", "Travel", "Gym"].map((v, i) => ({ id: v, category: "occasion", label: v, value: v, sort_order: i }))),
    ...(["Summer", "Winter", "Spring", "Autumn"].map((v, i) => ({ id: v, category: "season", label: v, value: v, sort_order: i }))),
    ...(["Cotton", "Silk", "Leather", "Denim", "Wool", "Linen"].map((v, i) => ({ id: v, category: "material", label: v, value: v, sort_order: i }))),
    ...(["Nike", "Zara", "H&M", "Gucci", "Adidas", "Uniqlo"].map((v, i) => ({ id: v, category: "brand", label: v, value: v, sort_order: i }))),
    ...([
        { label: "Black", value: "#000000" }, { label: "White", value: "#FFFFFF" },
        { label: "Navy", value: "#1E3A5F" }, { label: "Red", value: "#C0392B" },
        { label: "Green", value: "#27AE60" }, { label: "Beige", value: "#F5E6D3" },
        { label: "Grey", value: "#718096" }, { label: "Brown", value: "#6B4423" },
    ].map((c, i) => ({ id: c.value, category: "color", label: c.label, value: c.value, sort_order: i }))),
];

const StyleHubContext = createContext<StyleHubContextType | undefined>(undefined);

export const StyleHubProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { user } = useAuth();
    const supabase = createClient();

    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<StyleHubFilters>(defaultFilters);
    const [savedWorlds, setSavedWorlds] = useState<SavedWorld[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOption[]>(fallbackOptions);

    // Fetch filter options from DB
    useEffect(() => {
        async function fetchFilterOptions() {
            const { data, error } = await supabase
                .from("style_hub_filters")
                .select("*")
                .eq("is_active", true)
                .order("sort_order", { ascending: true });

            if (!error && data && data.length > 0) {
                setFilterOptions(data as FilterOption[]);
            }
            // If error or no data, keep fallback options
        }
        fetchFilterOptions();
    }, []);

    // Fetch saved worlds when user changes
    useEffect(() => {
        if (!user) {
            setSavedWorlds([]);
            return;
        }

        async function fetchSavedWorlds() {
            const { data, error } = await supabase
                .from("saved_style_worlds")
                .select("*")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching saved worlds:", error);
            } else {
                setSavedWorlds(data as SavedWorld[]);
            }
        }

        fetchSavedWorlds();
    }, [user]);

    const openStyleHub = () => setIsOpen(true);
    const closeStyleHub = () => setIsOpen(false);

    const setFilter = (key: keyof StyleHubFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => setFilters(defaultFilters);

    const applyWorld = (world: SavedWorld) => {
        setFilters({ ...defaultFilters, ...world.filters });
        toast.success(`Applied "${world.name}" world filters!`);
    };

    const saveWorld = async (name: string, imageUrl?: string) => {
        if (!user) {
            toast.error("You must be logged in to save a style world.");
            return;
        }

        const newWorld = {
            user_id: user.id,
            name,
            filters: { ...filters },
            image_url: imageUrl || null,
        };

        const { data, error } = await supabase
            .from("saved_style_worlds")
            .insert(newWorld)
            .select()
            .single();

        if (error) {
            console.error("Error saving style world:", error);
            toast.error("Failed to save style world.");
        } else if (data) {
            setSavedWorlds((prev) => [data as SavedWorld, ...prev]);
            toast.success("Style world saved!");
        }
    };

    const deleteWorld = async (id: string) => {
        const { error } = await supabase
            .from("saved_style_worlds")
            .delete()
            .eq("id", id);

        if (error) {
            toast.error("Failed to delete world.");
        } else {
            setSavedWorlds((prev) => prev.filter((w) => w.id !== id));
            toast.success("World deleted.");
        }
    };

    return (
        <StyleHubContext.Provider
            value={{
                isOpen,
                openStyleHub,
                closeStyleHub,
                filters,
                setFilter,
                resetFilters,
                applyWorld,
                savedWorlds,
                saveWorld,
                deleteWorld,
                filterOptions,
            }}
        >
            {children}
        </StyleHubContext.Provider>
    );
};

export const useStyleHub = (): StyleHubContextType => {
    const ctx = useContext(StyleHubContext);
    if (!ctx) throw new Error("useStyleHub must be used within StyleHubProvider");
    return ctx;
};
