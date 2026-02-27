"use client";
import dynamic from "next/dynamic";

const ThreeDSection = dynamic(() => import("./index"), { ssr: false });

export default function ThreeDSectionClient() {
    return <ThreeDSection />;
}
