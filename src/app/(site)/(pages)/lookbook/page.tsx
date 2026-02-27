import { Metadata } from "next";
import Lookbook from "@/components/Lookbook";

export const metadata: Metadata = {
    title: "Lookbook | Fitova",
    description: "Discover curated outfit lookbooks powered by AI and fashion trends.",
};

export default function LookbookPage() {
    return (
        <>
            <Lookbook />
        </>
    );
}
