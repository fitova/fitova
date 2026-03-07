import { Metadata } from "next";
import Lookbook from "@/components/Lookbook";

export const metadata: Metadata = {
    title: "Lookbooks | Fitova",
    description: "Explore curated fashion lookbooks from the Fitova community. Shop complete outfits with a single click.",
};

export default function LookbookPage() {
    return <Lookbook />;
}
