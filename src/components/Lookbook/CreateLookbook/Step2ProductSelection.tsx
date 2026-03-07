"use client";
import React, { useState } from "react";
import { LookbookCategory } from "@/lib/queries/lookbooks";
import ProductPickerModal from "./ProductPickerModal";

interface SelectedProduct {
    id: string;
    name: string;
    slug: string;
    price: number;
    brand?: string | null;
    piece_type?: string | null;
    imgs?: { previews?: string[] } | null;
}

type Slots = Record<LookbookCategory, SelectedProduct | null>;

interface Step2Props {
    slots: Slots;
    onChange: (slots: Slots) => void;
    onNext: () => void;
    onBack: () => void;
}

const CATEGORIES: { key: LookbookCategory; label: string; icon: React.ReactNode }[] = [
    {
        key: "top", label: "Top", icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 3.46L16 2a8.96 8.96 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
            </svg>
        )
    },
    {
        key: "pants", label: "Pants", icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16v1.5a2 2 0 0 1-2 2h-1l-3 14.5H8l-3-14.5H4z" />
                <path d="M12 7.5v14" />
            </svg>
        )
    },
    {
        key: "shoes", label: "Shoes", icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 16v-2.38C4 11.5 5.92 9 8.5 9h7c2.58 0 4.5 2.5 4.5 4.62V16" />
                <path d="M2 16h20v4H2z" />
            </svg>
        )
    },
    {
        key: "accessories", label: "Accessories", icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        )
    },
    {
        key: "perfumes", label: "Perfume", icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 10h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z" />
                <path d="M9 10V6a3 3 0 0 1 6 0v4" />
                <rect x="10" y="2" width="4" height="2" rx="1" />
            </svg>
        )
    },
];

export default function Step2ProductSelection({ slots, onChange, onNext, onBack }: Step2Props) {
    const [openCategory, setOpenCategory] = useState<LookbookCategory | null>(null);

    const handleSelect = (product: SelectedProduct) => {
        if (!openCategory) return;
        onChange({ ...slots, [openCategory]: product });
        setOpenCategory(null);
    };

    const handleRemove = (category: LookbookCategory) => {
        onChange({ ...slots, [category]: null });
    };

    const filledCount = Object.values(slots).filter(Boolean).length;

    return (
        <div className="space-y-4">
            <p className="text-[11px] font-light text-[#8A8A8A] tracking-wide">
                Select one product per category. At least 1 slot must be filled.
            </p>

            {CATEGORIES.map(({ key, label, icon }) => {
                const selected = slots[key];
                const img = selected?.imgs?.previews?.[0];

                return (
                    <div
                        key={key}
                        className="flex items-center gap-4 border border-[#E8E4DF] p-3 hover:border-[#0A0A0A] transition-colors group"
                    >
                        {/* Slot Image */}
                        <div className="flex-shrink-0 w-14 h-14 border border-[#E8E4DF] overflow-hidden bg-[#F6F5F2] flex items-center justify-center text-[#8A8A8A]">
                            {img ? (
                                <img src={img} alt={selected!.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <span className="flex items-center justify-center w-full h-full">
                                    {icon}
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-light tracking-[0.2em] uppercase text-[#8A8A8A] mb-0.5">{label}</p>
                            {selected ? (
                                <>
                                    <p className="text-sm font-light text-[#0A0A0A] truncate">{selected.name}</p>
                                    {selected.brand && (
                                        <p className="text-[10px] text-[#8A8A8A] font-light">{selected.brand}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-xs font-light text-[#C8C8C8] italic">No product selected</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {selected && (
                                <button
                                    onClick={() => handleRemove(key)}
                                    className="w-7 h-7 border border-[#E8E4DF] hover:border-red-400 hover:text-red-400 transition-colors flex items-center justify-center"
                                    title="Remove"
                                >
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M1 1L9 9M9 1L1 9" />
                                    </svg>
                                </button>
                            )}
                            <button
                                onClick={() => setOpenCategory(key)}
                                className="px-3 py-1.5 text-[10px] font-light tracking-[0.15em] uppercase border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all duration-200"
                            >
                                {selected ? "Change" : "Add"}
                            </button>
                        </div>
                    </div>
                );
            })}

            {/* Navigation */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={onBack}
                    className="flex-1 py-3.5 text-xs font-light tracking-[0.2em] uppercase border border-[#E8E4DF] text-[#8A8A8A] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-all duration-200"
                >
                    ← Back
                </button>
                <button
                    onClick={onNext}
                    disabled={filledCount === 0}
                    className={`flex-1 py-3.5 text-xs font-light tracking-[0.2em] uppercase transition-all duration-200 ${filledCount > 0
                        ? "bg-[#0A0A0A] text-white hover:bg-[#2C2C2C]"
                        : "bg-[#E8E4DF] text-[#C8C8C8] cursor-not-allowed"
                        }`}
                >
                    Next — Tags & Colors →
                </button>
            </div>

            {/* Product picker modal */}
            {openCategory && (
                <ProductPickerModal
                    category={openCategory}
                    onSelect={handleSelect}
                    onClose={() => setOpenCategory(null)}
                />
            )}
        </div>
    );
}
