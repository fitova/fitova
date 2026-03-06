"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/app/context/AuthContext";
import { createLookbook, LookbookCategory } from "@/lib/queries/lookbooks";
import StepIndicator from "@/components/Lookbook/CreateLookbook/StepIndicator";
import Step1BasicInfo from "@/components/Lookbook/CreateLookbook/Step1BasicInfo";
import Step2ProductSelection from "@/components/Lookbook/CreateLookbook/Step2ProductSelection";
import Step3TagGeneration from "@/components/Lookbook/CreateLookbook/Step3TagGeneration";
import toast from "react-hot-toast";

interface SelectedProduct {
    id: string;
    name: string;
    slug: string;
    price: number;
    brand?: string | null;
    piece_type?: string | null;
    imgs?: { previews?: string[] } | null;
    styles?: string[] | null;
    tags?: string[] | null;
    material?: string | null;
    colors?: string[] | null;
}

type Slots = Record<LookbookCategory, SelectedProduct | null>;

const EMPTY_SLOTS: Slots = {
    top: null,
    pants: null,
    shoes: null,
    accessories: null,
    perfumes: null,
};

export default function CreateLookbookPage() {
    const router = useRouter();
    const { user } = useCurrentUser();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [submitting, setSubmitting] = useState(false);

    // Step 1 data
    const [basicInfo, setBasicInfo] = useState({
        title: "",
        description: "",
        coverImage: null as string | null,
    });

    // Step 2 data
    const [slots, setSlots] = useState<Slots>(EMPTY_SLOTS);

    // Step 3 data
    const [tagsData, setTagsData] = useState({
        tags: [] as string[],
        colors: [] as string[],
        mood: "",
    });

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-sm font-light text-[#8A8A8A] mb-4">Sign in to create a lookbook</p>
                    <button
                        onClick={() => router.push("/signin")}
                        className="px-6 py-3 bg-[#0A0A0A] text-white text-xs font-light tracking-[0.2em] uppercase hover:bg-[#2C2C2C] transition"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const productSlots = (Object.entries(slots) as [LookbookCategory, SelectedProduct | null][])
                .filter(([, p]) => p !== null)
                .map(([category, p]) => ({ category, product_id: p!.id }));

            const lookbook = await createLookbook(
                {
                    title: basicInfo.title,
                    description: basicInfo.description || undefined,
                    cover_image: basicInfo.coverImage || undefined,
                    tags: tagsData.tags,
                    colors: tagsData.colors,
                    mood: tagsData.mood || undefined,
                },
                productSlots,
                user.id
            );

            toast.success("Lookbook created successfully!");
            router.push(`/lookbook/${lookbook.slug}`);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to create lookbook");
        } finally {
            setSubmitting(false);
        }
    };

    const selectedProducts = Object.values(slots).filter(Boolean) as SelectedProduct[];

    return (
        <div className="min-h-screen py-16 px-4">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="block text-[10px] font-light tracking-[0.3em] uppercase text-[#8A8A8A] mb-3">
                        Create Lookbook
                    </span>
                    <h1 className="font-playfair text-3xl font-normal text-[#0A0A0A]">
                        {step === 1 ? "Basic Information" : step === 2 ? "Select Products" : "Tags & Colors"}
                    </h1>
                </div>

                <StepIndicator currentStep={step} />

                <div className="bg-white border border-[#E8E4DF] p-6 sm:p-8">
                    {step === 1 && (
                        <Step1BasicInfo
                            data={basicInfo}
                            onChange={setBasicInfo}
                            onNext={() => setStep(2)}
                        />
                    )}
                    {step === 2 && (
                        <Step2ProductSelection
                            slots={slots}
                            onChange={setSlots}
                            onNext={() => setStep(3)}
                            onBack={() => setStep(1)}
                        />
                    )}
                    {step === 3 && (
                        <Step3TagGeneration
                            selectedProducts={selectedProducts}
                            tags={tagsData.tags}
                            colors={tagsData.colors}
                            mood={tagsData.mood}
                            onChange={setTagsData}
                            onSubmit={handleSubmit}
                            onBack={() => setStep(2)}
                            submitting={submitting}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
