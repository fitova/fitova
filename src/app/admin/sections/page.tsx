"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

type Section = {
    section_identifier: string;
    title: string;
    is_active: boolean;
    sort_order: number;
};

const SECTION_LABELS: Record<string, { icon: string; desc: string }> = {
    hero_carousel: { icon: "🎠", desc: "Main hero slides at the top of the page" },
    category_cards: { icon: "📂", desc: "Browse by Category slider" },
    affiliate_promo: { icon: "💎", desc: "Affiliate promo banner" },
    new_arrivals: { icon: "✨", desc: "New Arrivals product grid" },
    best_sellers: { icon: "🏆", desc: "Best Sellers product grid" },
    trending: { icon: "🔥", desc: "Trending Now product grid" },
    this_week: { icon: "📅", desc: "This Week tabbed section" },
    "3d_section": { icon: "🧊", desc: "3D AI model showcase" },
    lookbook_preview: { icon: "📸", desc: "Curated Collections lookbook" },
};

export default function SectionsAdmin() {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from("homepage_sections")
            .select("section_identifier, title, is_active, sort_order")
            .order("sort_order", { ascending: true })
            .then(({ data }) => {
                setSections(data ?? []);
                setLoading(false);
            });
    }, []);

    const toggle = async (identifier: string, current: boolean) => {
        setSaving(identifier);
        const supabase = createClient();
        const { error } = await supabase
            .from("homepage_sections")
            .update({ is_active: !current })
            .eq("section_identifier", identifier);

        if (error) {
            toast.error("Failed to update section");
        } else {
            setSections((prev) =>
                prev.map((s) =>
                    s.section_identifier === identifier ? { ...s, is_active: !current } : s
                )
            );
            toast.success(`${identifier.replace(/_/g, " ")} ${!current ? "enabled" : "disabled"}`);
        }
        setSaving(null);
    };

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <span className="text-xs font-light tracking-[0.3em] uppercase text-[#8A8A8A]">Admin</span>
                <h2 className="font-playfair font-normal text-3xl text-[#0A0A0A] mt-1" style={{ letterSpacing: "-0.02em" }}>
                    Homepage Sections
                </h2>
                <p className="text-sm font-light text-[#8A8A8A] mt-2">
                    Toggle which sections appear on the homepage. Changes take effect immediately.
                </p>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse bg-[#F0EDEA] rounded" />
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-[#E8E4DF] divide-y divide-[#E8E4DF]">
                    {sections.map((section) => {
                        const meta = SECTION_LABELS[section.section_identifier];
                        return (
                            <div
                                key={section.section_identifier}
                                className="flex items-center justify-between px-6 py-4 hover:bg-[#FAFAF9] transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-xl w-6 text-center">{meta?.icon ?? "📄"}</span>
                                    <div>
                                        <p className="text-sm font-medium text-[#0A0A0A]">{section.title}</p>
                                        <p className="text-xs font-light text-[#8A8A8A] mt-0.5">
                                            {meta?.desc ?? section.section_identifier}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span
                                        className={`text-[10px] font-light tracking-wider uppercase px-2.5 py-1 ${section.is_active
                                                ? "bg-green-50 text-green-700"
                                                : "bg-[#F0EDEA] text-[#8A8A8A]"
                                            }`}
                                    >
                                        {section.is_active ? "Visible" : "Hidden"}
                                    </span>

                                    {/* Toggle switch */}
                                    <button
                                        onClick={() => toggle(section.section_identifier, section.is_active)}
                                        disabled={saving === section.section_identifier}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${section.is_active ? "bg-[#0A0A0A]" : "bg-[#D1CEC8]"
                                            }`}
                                        aria-label={`Toggle ${section.title}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${section.is_active ? "translate-x-6" : "translate-x-1"
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
