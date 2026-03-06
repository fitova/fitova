import { Metadata } from "next";
import LookbookDetailClient from "./LookbookDetailClient";

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: `Lookbook | Fitova`,
        description: "Explore this curated lookbook and shop the complete outfit.",
    };
}

export default function LookbookDetailPage({ params }: Props) {
    return <LookbookDetailClient slug={params.slug} />;
}
