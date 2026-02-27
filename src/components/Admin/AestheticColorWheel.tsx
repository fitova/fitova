import React, { useState } from "react";

interface AestheticColorWheelProps {
    selectedColors: string[];
    onChange: (color: string) => void;
    size?: number;
    theme?: "dark" | "light";
    customColors?: string[];
    overridePresets?: boolean;
}

// 40 Beautiful smooth colors traversing the full fashion spectrum
const WHEEL_COLORS = [
    "#FF0000", "#FF2400", "#FF4500", "#FF7F00", "#FF8C00", "#FFA500", "#FFD700", "#FFFF00",
    "#CCFF00", "#ADFF2F", "#7FFF00", "#32CD32", "#00FF00", "#00FA9A", "#00FF7F", "#00FFFF",
    "#00CED1", "#20B2AA", "#5F9EA0", "#4682B4", "#4169E1", "#0000FF", "#0000CD", "#00008B",
    "#4B0082", "#8A2BE2", "#9400D3", "#9932CC", "#8B008B", "#800080", "#FF00FF", "#EE82EE",
    "#DA70D6", "#FF1493", "#FF69B4", "#FFC0CB", "#FFE4E1", "#FFFFFF", "#808080", "#000000"
];

const PRESET_GRID_COLORS = [
    // Neutrals - 8
    "#FFFFFF", "#F6F5F2", "#E8E4DF", "#D1C9BE", "#A39E93", "#76736A", "#4A4843", "#0A0A0A",
    // Earth Tones - 8
    "#8B7355", "#A0522D", "#CD853F", "#DEB887", "#F5DEB3", "#FFF8DC", "#556B2F", "#8FBC8F",
    // Warm Tones - 8
    "#800000", "#A52A2A", "#B22222", "#DC143C", "#FF6347", "#FF7F50", "#FFA07A", "#FFDAB9",
    // Cool Tones - 8
    "#000080", "#0000CD", "#4169E1", "#4682B4", "#87CEEB", "#B0E0E6", "#2F4F4F", "#708090",
    // Accents - 8
    "#4B0082", "#800080", "#9932CC", "#DA70D6", "#FFC0CB", "#FFB6C1", "#FFD700", "#BDB76B"
];

const AestheticColorWheel: React.FC<AestheticColorWheelProps> = ({
    selectedColors,
    onChange,
    size = 240,
    theme = "light",
    customColors = [],
    overridePresets = false,
}) => {
    const [viewMode, setViewMode] = useState<"wheel" | "grid">("wheel");

    const segmentAngle = 360 / WHEEL_COLORS.length;

    // If overridePresets is true and custom colors exist, strictly show only them
    // Otherwise, combine them to prevent an empty grid component
    const combinedPresets = overridePresets && customColors.length > 0
        ? customColors
        : Array.from(new Set([...customColors, ...PRESET_GRID_COLORS]));

    return (
        <div className="w-full relative flex flex-col items-center">
            {/* View Toggle */}
            <div className={`flex border rounded-full p-1 mb-6 relative z-30 transition-colors ${theme === "dark" ? "bg-white/10 border-white/10" : "bg-black/5 border-black/5"}`}>
                <button
                    onClick={() => setViewMode("wheel")}
                    className={`px-4 py-1.5 text-[10px] font-medium tracking-[0.1em] uppercase rounded-full transition-all duration-300 ${viewMode === "wheel"
                        ? (theme === "dark" ? "bg-white text-black shadow-md" : "bg-black text-white shadow-md")
                        : (theme === "dark" ? "text-white/50 hover:text-white" : "text-black/50 hover:text-black")
                        }`}
                >
                    Color Wheel
                </button>
                <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-1.5 text-[10px] font-medium tracking-[0.1em] uppercase rounded-full transition-all duration-300 ${viewMode === "grid"
                        ? (theme === "dark" ? "bg-white text-black shadow-md" : "bg-black text-white shadow-md")
                        : (theme === "dark" ? "text-white/50 hover:text-white" : "text-black/50 hover:text-black")
                        }`}
                >
                    Presets
                </button>
            </div>

            {viewMode === "wheel" ? (
                <div
                    className="relative rounded-full shadow-2xl"
                    style={{ width: size, height: size }}
                >
                    {/* Outer shadow/border for depth */}
                    <div className="absolute inset-0 rounded-full border-[4px] border-black/5 dark:border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none z-10" />

                    {WHEEL_COLORS.map((color, index) => {
                        const startAngle = index * segmentAngle;
                        const endAngle = startAngle + segmentAngle;
                        const isSelected = selectedColors.includes(color);

                        return (
                            <div
                                key={color}
                                onClick={() => onChange(color)}
                                className="absolute rounded-full cursor-pointer hover:brightness-125 transition-all duration-200"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * (Math.PI / 180))
                                        }% ${50 + 50 * Math.sin((startAngle - 90) * (Math.PI / 180))
                                        }%, ${50 + 50 * Math.cos((endAngle - 90) * (Math.PI / 180))
                                        }% ${50 + 50 * Math.sin((endAngle - 90) * (Math.PI / 180))}%)`,
                                    backgroundColor: color,
                                    zIndex: isSelected ? 5 : 1,
                                }}
                            >
                                {/* Selection indicator overlay */}
                                {isSelected && (
                                    <div
                                        className="absolute inset-0 z-20"
                                        style={{
                                            background: `linear-gradient(${startAngle + segmentAngle / 2
                                                }deg, rgba(255,255,255,0.4) 0%, transparent 100%)`,
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Inner circle (creates the wheel/donut look and adds depth) */}
                    <div
                        className="absolute inset-0 m-auto rounded-full bg-white dark:bg-[#0A0A0A] shadow-[0_0_15px_rgba(0,0,0,0.5)] dark:shadow-[0_0_15px_rgba(0,0,0,0.8)] z-20 flex items-center justify-center pointer-events-none"
                        style={{ width: size * 0.35, height: size * 0.35 }}
                    >
                        <div className="w-[80%] h-[80%] rounded-full border border-black/5 dark:border-white/5" />
                    </div>

                    {/* Active selection dot markers placed around the inner circle */}
                    {WHEEL_COLORS.map((color, index) => {
                        const isSelected = selectedColors.includes(color);
                        if (!isSelected) return null;

                        const middleAngle = index * segmentAngle + segmentAngle / 2;
                        const radius = size * 0.25; // Just outside the inner circle

                        const x =
                            50 +
                            (Math.cos((middleAngle - 90) * (Math.PI / 180)) * radius * 100) /
                            (size / 2);
                        const y =
                            50 +
                            (Math.sin((middleAngle - 90) * (Math.PI / 180)) * radius * 100) /
                            (size / 2);

                        return (
                            <div
                                key={`marker-${color}`}
                                className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_white] border border-black/20 z-30 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                                style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                }}
                            />
                        );
                    })}
                </div>
            ) : (
                /* Presets Grid */
                <div className="grid grid-cols-8 gap-2 w-full max-w-xs relative z-30">
                    {combinedPresets.map((color) => {
                        const isSelected = selectedColors.includes(color);
                        return (
                            <button
                                key={color}
                                onClick={() => onChange(color)}
                                className="w-full aspect-square rounded-full ease-out duration-200 relative group flex-shrink-0"
                                style={{
                                    backgroundColor: color,
                                    border: isSelected
                                        ? "2px solid #F6F5F2"
                                        : "1px solid rgba(10,10,10,0.1)",
                                    boxShadow:
                                        color === "#FFFFFF" || color === "#F6F5F2"
                                            ? "inset 0 0 0 1px rgba(0,0,0,0.1)"
                                            : undefined,
                                    transform: isSelected ? "scale(1.15)" : "scale(1)",
                                }}
                            >
                                {/* Hover ring effect */}
                                <div
                                    className={`absolute inset-[-4px] rounded-full border border-black/30 dark:border-white/30 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ${isSelected ? "hidden" : "block"
                                        }`}
                                />
                                {/* Selected indicator */}
                                {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div
                                            className={`w-1.5 h-1.5 rounded-full ${["#FFFFFF", "#F6F5F2", "#FFF8DC"].includes(color)
                                                ? "bg-black"
                                                : "bg-white"
                                                }`}
                                        />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AestheticColorWheel;
