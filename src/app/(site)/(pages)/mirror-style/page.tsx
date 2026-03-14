import type { Metadata } from "next";
import MirrorStyle from "@/components/MirrorStyle";

export const metadata: Metadata = {
    title: "Mirror Style | FITOVA",
    description: "Upload your photo and get a personalized AI fashion analysis — discover your style, colors, and a styled outfit generated just for you.",
};

export default function MirrorStylePage() {
    return <MirrorStyle />;
}
