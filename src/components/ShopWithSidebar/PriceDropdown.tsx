"use client";
import { useState, useEffect, useRef } from "react";

const PriceDropdown = ({
  minPrice = 0,
  maxPrice = 1000,
  onPriceChange,
}: {
  minPrice?: number;
  maxPrice?: number;
  onPriceChange?: (min: number, max: number) => void;
}) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Sync from parent
  useEffect(() => { setLocalMin(minPrice); setLocalMax(maxPrice); }, [minPrice, maxPrice]);

  const handleChange = (min: number, max: number) => {
    setLocalMin(min);
    setLocalMax(max);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onPriceChange?.(min, max);
    }, 400);
  };

  return (
    <div className="border border-[#E8E4DF] bg-white">
      <button
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className="w-full flex items-center justify-between py-4 px-5 hover:bg-[#FAFAF9] transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#0A0A0A]">Price</span>
          {(localMin > 0 || localMax < 1000) && (
            <span className="w-5 h-5 rounded-full bg-[#0A0A0A] text-white text-[10px] flex items-center justify-center font-light">
              1
            </span>
          )}
        </div>
        <svg className={`fill-current transition-transform duration-200 ${toggleDropdown ? "rotate-180" : ""}`}
          width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
            fill="" />
        </svg>
      </button>

      {toggleDropdown && (
        <div className="pb-5 px-5">
          {/* Dual range slider using native inputs */}
          <div className="relative h-1 bg-[#E8E4DF] rounded-full mt-2 mb-4">
            {/* Active range bar */}
            <div
              className="absolute h-full bg-[#0A0A0A] rounded-full"
              style={{
                left: `${(localMin / 1000) * 100}%`,
                right: `${100 - (localMax / 1000) * 100}%`,
              }}
            />
            {/* Min slider */}
            <input
              type="range"
              min={0}
              max={1000}
              step={10}
              value={localMin}
              onChange={(e) => {
                const v = Math.min(Number(e.target.value), localMax - 10);
                handleChange(v, localMax);
              }}
              className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0A0A0A] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#0A0A0A] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-pointer"
            />
            {/* Max slider */}
            <input
              type="range"
              min={0}
              max={1000}
              step={10}
              value={localMax}
              onChange={(e) => {
                const v = Math.max(Number(e.target.value), localMin + 10);
                handleChange(localMin, v);
              }}
              className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0A0A0A] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#0A0A0A] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>

          {/* Min / Max labels */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#4A4A4A] flex border border-[#E8E4DF]">
              <span className="block border-r border-[#E8E4DF] px-2 py-1 text-[#8A8A8A]">$</span>
              <span className="block px-2.5 py-1 font-light min-w-[40px] text-center">{localMin}</span>
            </div>
            <span className="text-[#D4D0CB] text-xs">—</span>
            <div className="text-xs text-[#4A4A4A] flex border border-[#E8E4DF]">
              <span className="block border-r border-[#E8E4DF] px-2 py-1 text-[#8A8A8A]">$</span>
              <span className="block px-2.5 py-1 font-light min-w-[40px] text-center">{localMax}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceDropdown;
