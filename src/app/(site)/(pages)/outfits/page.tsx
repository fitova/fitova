import React, { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Outfits | Fitova – Curated Fashion",
    description: "Explore the full Fitova outfits collection. Filter by gender, category, style, color and more.",
};

const OutfitsPage = () => {
    return (
        <main>
            <Suspense fallback={
                <div className="min-h-screen bg-[#F6F5F2] flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                </div>
            }>
                <ShopWithSidebar />
            </Suspense>
        </main>
    );
};

export default OutfitsPage;
