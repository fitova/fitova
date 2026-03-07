"use client";
import React, { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Step1Props {
    data: { title: string; description: string; coverImage: string | null };
    onChange: (data: { title: string; description: string; coverImage: string | null }) => void;
    onNext: () => void;
}

export default function Step1BasicInfo({ data, onChange, onNext }: Step1Props) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(data.coverImage);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const [fileNameState, setFileNameState] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately and store file name
        setFileNameState(file.name);
        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);

        setUploading(true);
        const ext = file.name.split(".").pop();
        const fileName = `lookbook-covers/${Date.now()}.${ext}`;

        const { data: uploaded, error } = await supabase.storage
            .from("lookbook-images")
            .upload(fileName, file, { upsert: true });

        if (!error && uploaded) {
            const { data: urlData } = supabase.storage
                .from("lookbook-images")
                .getPublicUrl(uploaded.path);
            const url = urlData.publicUrl;
            // Update to real URL after upload
            setPreview(url);
            onChange({ ...data, coverImage: url });
        }
        setUploading(false);
    };

    const canProceed = data.title.trim().length >= 3;

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-[11px] font-light tracking-[0.2em] uppercase text-[#8A8A8A] mb-2">
                    Lookbook Name *
                </label>
                <input
                    type="text"
                    value={data.title}
                    onChange={(e) => onChange({ ...data, title: e.target.value })}
                    placeholder="e.g. Summer Street Style 2025"
                    className="w-full border border-[#E8E4DF] px-4 py-3 text-sm font-light focus:outline-none focus:border-[#0A0A0A] transition-colors bg-white placeholder-[#C8C8C8]"
                    maxLength={80}
                />
                <p className="text-[10px] text-[#C8C8C8] mt-1 text-right">{data.title.length}/80</p>
            </div>

            <div>
                <label className="block text-[11px] font-light tracking-[0.2em] uppercase text-[#8A8A8A] mb-2">
                    Description (optional)
                </label>
                <textarea
                    value={data.description}
                    onChange={(e) => onChange({ ...data, description: e.target.value })}
                    placeholder="Describe your lookbook..."
                    rows={3}
                    className="w-full border border-[#E8E4DF] px-4 py-3 text-sm font-light focus:outline-none focus:border-[#0A0A0A] transition-colors bg-white placeholder-[#C8C8C8] resize-none"
                    maxLength={300}
                />
            </div>

            {/* Cover image */}
            <div>
                <label className="block text-[11px] font-light tracking-[0.2em] uppercase text-[#8A8A8A] mb-2">
                    Cover Image (optional)
                </label>
                <div
                    className="group relative border-2 border-dashed border-[#E8E4DF] hover:border-[#0A0A0A] transition-colors cursor-pointer overflow-hidden rounded-md"
                    style={{ height: 180 }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {preview ? (
                        <>
                            <img src={preview} alt="Cover" className="w-full h-full object-cover" />
                            {fileNameState && (
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs px-3 py-2 truncate transition-opacity duration-300">
                                    {fileNameState}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                                <span className="text-white text-sm font-medium">Change Image</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-[#C8C8C8]">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="m21 15-5-5L5 21" />
                            </svg>
                            <span className="text-xs font-light">Click to upload cover image</span>
                        </div>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                            <div className="w-6 h-6 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                />
            </div>

            <button
                onClick={onNext}
                disabled={!canProceed}
                className={`w-full py-3.5 text-xs font-light tracking-[0.2em] uppercase transition-all duration-200 ${canProceed
                    ? "bg-[#0A0A0A] text-white hover:bg-[#2C2C2C]"
                    : "bg-[#E8E4DF] text-[#C8C8C8] cursor-not-allowed"
                    }`}
            >
                Next — Select Products →
            </button>
        </div>
    );
}
