import React from "react";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ReactNode;
    color?: string;
}

const StatsCard = ({ title, value, description, icon, color = "#8B7355" }: StatsCardProps) => {
    return (
        <div className="bg-white border border-[#E8E4DF] rounded-sm p-6 flex items-start justify-between group hover:border-[#0A0A0A] ease-out duration-200">
            <div>
                <p className="text-xs font-light tracking-[0.2em] uppercase text-[#8A8A8A] mb-3">{title}</p>
                <p className="font-playfair text-4xl font-normal text-[#0A0A0A]" style={{ letterSpacing: "-0.03em" }}>
                    {value}
                </p>
                {description && (
                    <p className="text-xs font-light text-[#8A8A8A] mt-2">{description}</p>
                )}
            </div>
            <div
                className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
                style={{ backgroundColor: `${color}18`, color }}
            >
                {icon}
            </div>
        </div>
    );
};

export default StatsCard;
