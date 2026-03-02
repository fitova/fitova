import React from "react";
import { Wishlist } from "@/components/Wishlist";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist | Fitova — Your Smart Fashion Hub",
  description: "Your saved products and curated looks, all in one place.",
};

const WishlistPage = () => {
  return <Wishlist />;
};

export default WishlistPage;
