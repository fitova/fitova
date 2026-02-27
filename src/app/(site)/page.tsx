import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitova | Your Smart Fashion Hub",
  description: "Fitova is an advanced affiliate fashion platform offering AI-powered styling, personalized lookbooks, and a unique Style Hub experience.",
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
