import type { Metadata } from "next";
import AIStyleResult from "@/components/AIStyleResult";

export const metadata: Metadata = {
    title: "AI Style Profile | FITOVA",
    description: "Discover a personalized AI-generated fashion style profile — browse recommended styles and colors.",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function StyleResultPage({ params }: PageProps) {
    const { id } = await params;
    return <AIStyleResult id={id} />;
}
