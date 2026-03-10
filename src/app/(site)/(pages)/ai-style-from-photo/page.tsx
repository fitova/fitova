import type { Metadata } from "next";
import AIStyleFromPhoto from "@/components/AIStyleFromPhoto";

export const metadata: Metadata = {
    title: "AI Style From Photo | FITOVA",
    description: "Upload your photo and get personalized AI fashion recommendations tailored to your appearance, body shape, and skin tone.",
};

export default function AIStyleFromPhotoPage() {
    return <AIStyleFromPhoto />;
}
