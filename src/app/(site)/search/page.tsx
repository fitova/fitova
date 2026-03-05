import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";

export const metadata = {
    title: "Search — FITOVA",
    description: "Search for products, lookbooks, and exclusive coupons on FITOVA.",
};

export default function SearchPage() {
    return (
        <main className="min-h-screen pt-28 pb-20 bg-white">
            <Suspense fallback={
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 flex justify-center pt-20">
                    <div className="h-8 w-8 rounded-full border-4 border-t-dark border-gray-200 animate-spin" />
                </div>
            }>
                <SearchPageClient />
            </Suspense>
        </main>
    );
}
