"use client";
import React, { useState, useEffect, useRef } from "react";

type Props = {
    color: string;
    onChange: (color: string) => void;
    label?: string;
};

const PRESET_COLORS = [
    "#000000", "#FFFFFF", "#1A1A1A", "#F6F5F2",
    "#4A4A4A", "#8A8A8A", "#E8E4DF", "#EF4444",
    "#F97316", "#EAB308", "#22C55E", "#0EA5E9",
    "#3B82F6", "#6366F1", "#A855F7", "#EC4899"
];

export default function ColorPicker({ color, onChange, label = "Color" }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);
    };

    return (
        <div className="relative flex flex-col gap-1.5" ref={popoverRef}>
            <label className="text-sm font-medium text-dark">{label}</label>

            <div className="flex items-center gap-3">
                {/* Trigger Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-10 rounded-full border border-gray-300 shadow-sm transition hover:scale-105 overflow-hidden flex-shrink-0 relative focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2"
                >
                    <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: color || '#000000' }} />
                </button>

                {/* Direct Hex Input */}
                <input
                    type="text"
                    value={color || "#000000"}
                    onChange={handleHexChange}
                    className="flex-1 max-w-[120px] px-3 py-2 border border-gray-300 rounded-md text-sm font-mono tracking-wider focus:border-dark outline-none transition"
                    placeholder="#000000"
                />
            </div>

            {/* Popover */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-[60] bg-white border border-gray-200 shadow-xl rounded-lg p-4 w-[240px] animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-dark uppercase tracking-wider">Presets</span>

                        {/* Native Color Input (Hidden behind a design) */}
                        <div className="relative group cursor-pointer overflow-hidden rounded-md border border-gray-200 w-6 h-6">
                            <input
                                type="color"
                                value={color || "#000000"}
                                onChange={(e) => onChange(e.target.value)}
                                className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer opacity-0"
                            />
                            {/* Custom visual for the native picker trigger */}
                            <div className="w-full h-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 group-hover:opacity-80 transition flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {PRESET_COLORS.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                    onChange(preset);
                                    setIsOpen(false);
                                }}
                                className={`w-10 h-10 rounded-md shadow-sm border transition hover:scale-105 ${(color || "").toLowerCase() === preset.toLowerCase() ? "ring-2 ring-dark ring-offset-1 border-transparent" : "border-gray-200"
                                    }`}
                                style={{ backgroundColor: preset }}
                                title={preset}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
