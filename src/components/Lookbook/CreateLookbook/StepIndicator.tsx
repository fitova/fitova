"use client";
import React from "react";

interface StepIndicatorProps {
    currentStep: 1 | 2 | 3;
}

const steps = [
    { n: 1, label: "Basic Info" },
    { n: 2, label: "Products" },
    { n: 3, label: "Tags & Colors" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {steps.map((step, i) => {
                const done = currentStep > step.n;
                const active = currentStep === step.n;
                return (
                    <React.Fragment key={step.n}>
                        {/* Step node */}
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${done
                                    ? "bg-[#0A0A0A] text-white"
                                    : active
                                        ? "bg-[#0A0A0A] text-white"
                                        : "bg-[#E8E4DF] text-[#8A8A8A]"
                                    }`}
                            >
                                {done ? (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M10 3L5 9L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    step.n
                                )}
                            </div>
                            <span className={`text-[10px] tracking-[0.1em] uppercase font-light ${active ? "text-[#0A0A0A]" : "text-[#8A8A8A]"}`}>
                                {step.label}
                            </span>
                        </div>
                        {/* Connector */}
                        {i < steps.length - 1 && (
                            <div
                                className={`w-16 h-px mb-4 transition-all duration-300 ${done ? "bg-[#0A0A0A]" : "bg-[#E8E4DF]"}`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
