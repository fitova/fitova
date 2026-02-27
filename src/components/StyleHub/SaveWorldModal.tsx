"use client";
import React, { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, imageUrl?: string) => void;
};

const SaveWorldModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
    const supabase = createClient();
    const [name, setName] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Please enter a name for your world.");
            return;
        }

        setLoading(true);
        let imageUrl: string | undefined;

        if (imageFile) {
            const ext = imageFile.name.split(".").pop();
            const filename = `world-${Date.now()}.${ext}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("world-images")
                .upload(filename, imageFile, {
                    upsert: true,
                    contentType: imageFile.type,
                });

            if (!uploadError && uploadData) {
                const { data: urlData } = supabase.storage
                    .from("world-images")
                    .getPublicUrl(uploadData.path);
                imageUrl = urlData.publicUrl;
                console.log("[SaveWorld] Image URL:", imageUrl);
            } else if (uploadError) {
                console.error("[SaveWorld] Upload error:", uploadError);
                toast.error("Image upload failed — world saved without image.");
            }
        }

        await onSave(name.trim(), imageUrl);
        setLoading(false);
        setName("");
        setImageFile(null);
        setImagePreview(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div
                className="relative w-full max-w-sm p-6 rounded-sm max-h-[85vh] overflow-y-auto"
                style={{ background: "#0A0A0A", border: "1px solid rgba(246,245,242,0.12)" }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4"
                    style={{ color: "rgba(246,245,242,0.4)" }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                <h3
                    className="font-playfair text-lg font-normal mb-1"
                    style={{ color: "#F6F5F2" }}
                >
                    Save Your World
                </h3>
                <p className="text-xs font-light mb-5" style={{ color: "rgba(246,245,242,0.4)" }}>
                    Name your style world and optionally add a cover image.
                </p>

                {/* World Name */}
                <div className="mb-4">
                    <label className="block text-xs font-light tracking-[0.1em] uppercase mb-2" style={{ color: "rgba(246,245,242,0.5)" }}>
                        World Name
                    </label>
                    <input
                        type="text"
                        placeholder="E.g., Summer in Paris"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        className="w-full px-3 py-2.5 text-sm font-light outline-none"
                        style={{
                            background: "rgba(246,245,242,0.05)",
                            border: "1px solid rgba(246,245,242,0.15)",
                            color: "#F6F5F2",
                        }}
                        autoFocus
                    />
                </div>

                {/* Image Upload */}
                <div className="mb-6">
                    <label className="block text-xs font-light tracking-[0.1em] uppercase mb-2" style={{ color: "rgba(246,245,242,0.5)" }}>
                        Cover Image <span style={{ color: "rgba(246,245,242,0.3)" }}>(optional)</span>
                    </label>
                    <div
                        onClick={() => fileRef.current?.click()}
                        className="relative flex items-center justify-center h-24 cursor-pointer ease-out duration-200 overflow-hidden"
                        style={{ border: "1px dashed rgba(246,245,242,0.2)" }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(246,245,242,0.4)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(246,245,242,0.2)";
                        }}
                    >
                        {imagePreview ? (
                            <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center">
                                <svg className="mx-auto mb-1" width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "rgba(246,245,242,0.3)" }}>
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-xs font-light" style={{ color: "rgba(246,245,242,0.3)" }}>Upload image</span>
                            </div>
                        )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-xs font-light tracking-[0.1em] uppercase ease-out duration-200"
                        style={{ border: "1px solid rgba(246,245,242,0.2)", color: "rgba(246,245,242,0.6)" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 py-2.5 text-xs font-light tracking-[0.1em] uppercase ease-out duration-200 disabled:opacity-50"
                        style={{ background: "#F6F5F2", color: "#0A0A0A" }}
                    >
                        {loading ? "Saving..." : "Save World"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveWorldModal;
