import { Metadata } from "next";
import Coupons from "@/components/Coupons";

export const metadata: Metadata = {
    title: "Coupons | Fitova",
    description: "Find and apply exclusive discount coupons for your favorite fashion brands.",
};

export default function CouponsPage() {
    return (
        <>
            <Coupons />
        </>
    );
}
