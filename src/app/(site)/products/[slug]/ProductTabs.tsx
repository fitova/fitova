import React, { useState } from "react";

const ProductTabs = ({ product }: { product: any }) => {
    const [tab, setTab] = useState<"description" | "details">("description");
    const tabs = [
        { id: "description" as const, label: "Description" },
        { id: "details" as const, label: "Additional Info" },
    ];

    return (
        <div className="mt-16 border-t pt-2 max-w-4xl" style={{ borderColor: "#E8E4DF" }}>
            {/* Tab nav */}
            <div className="flex gap-8 mb-8 border-b" style={{ borderColor: "#E8E4DF" }}>
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`py-4 text-xs font-light tracking-[0.2em] uppercase border-b-[1.5px] -mb-px transition-colors duration-200 ${tab === t.id
                            ? "border-dark text-dark"
                            : "border-transparent hover:text-dark"
                            }`}
                        style={{ color: tab === t.id ? "#0A0A0A" : "#8A8A8A" }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab body */}
            <div className="py-2">
                {tab === "description" && (
                    <div className="max-w-3xl">
                        {product.description ? (
                            <p className="font-light leading-relaxed text-sm whitespace-pre-line" style={{ color: "#4A4A4A" }}>
                                {product.description}
                            </p>
                        ) : (
                            <p className="font-light text-sm italic" style={{ color: "#8A8A8A" }}>
                                No description available for this product.
                            </p>
                        )}
                    </div>
                )}

                {tab === "details" && (
                    <div className="max-w-xl space-y-3">
                        {[
                            { label: "Brand", value: product.brand },
                            { label: "Material", value: product.material },
                            { label: "Season", value: product.season },
                            { label: "Type", value: product.piece_type },
                            { label: "Gender", value: product.gender ? product.gender.charAt(0).toUpperCase() + product.gender.slice(1) : null },
                        ]
                            .filter((r) => r.value)
                            .map((row) => (
                                <div
                                    key={row.label}
                                    className="flex py-3 border-b"
                                    style={{ borderColor: "#E8E4DF" }}
                                >
                                    <span
                                        className="w-32 text-xs font-light tracking-[0.15em] uppercase flex-shrink-0"
                                        style={{ color: "#8A8A8A" }}
                                    >
                                        {row.label}
                                    </span>
                                    <span className="text-sm font-light text-dark">{row.value}</span>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductTabs;
