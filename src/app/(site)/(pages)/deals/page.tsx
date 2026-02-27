import { Metadata } from "next";
import Deals from "@/components/Deals";

export const metadata: Metadata = {
    title: "Deals & Offers | Fitova",
    description: "Browse the latest fashion deals and discounts curated just for you.",
};

export default function DealsPage() {
    return (
        <>
            <Deals />
        </>
    );
}
