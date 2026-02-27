import { Metadata } from "next";
import AIStyling from "@/components/AIStyling";

export const metadata: Metadata = {
    title: "AI Styling | Fitova",
    description: "Upload a clothing piece and let our AI suggest a complete outfit for you.",
};

export default function AIStylingPage() {
    return (
        <>
            <AIStyling />
        </>
    );
}
