"use client";
import React from "react";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductHoverActions from "@/components/Common/ProductHoverActions";

const SingleItem = ({ item }: { item: Product }) => {
  const router = useRouter();

  const handleImageClick = () => {
    if (item.slug) {
      router.push(`/products/${item.slug}`);
    }
  };

  return (
    <div className="group">
      <div
        className="relative overflow-hidden rounded-none border border-[#E8E4DF] transition-colors duration-300 hover:border-dark"
        style={{ backgroundColor: "#F6F5F2", minHeight: "403px" }}
      >
        {/* Product info (top) */}
        <div className="text-center px-4 py-7.5">
          <div className="flex items-center justify-center gap-1 mb-2" aria-label={`${item.reviews ?? 0} reviews`}>
            {[...Array(5)].map((_, i) => (
              <Image key={i} src="/images/icons/icon-star.svg" alt="" width={14} height={14} aria-hidden="true" />
            ))}
            <p className="text-custom-sm ml-1">({item.reviews})</p>
          </div>

          <h3 className="font-light tracking-wide text-dark ease-out duration-200 hover:opacity-70 mb-1.5">
            <Link href={item.slug ? `/products/${item.slug}` : `/products/${item.id}`}>
              {item.title}
            </Link>
          </h3>

          <span className="flex items-center justify-center gap-2 font-light text-lg">
            <span className="text-dark" style={{ fontWeight: 400 }}>
              ${item.discountedPrice}
            </span>
            {item.price !== item.discountedPrice && (
              <span className="text-dark-4 line-through text-base">${item.price}</span>
            )}
          </span>
        </div>

        {/* Product image (clickable) */}
        <div
          className="flex justify-center items-center cursor-pointer"
          onClick={handleImageClick}
          role="button"
          tabIndex={0}
          aria-label={`View ${item.title}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleImageClick();
          }}
        >
          <Image
            src={item?.imgs?.previews?.[0] || "/images/products/product-1-bg-1.png"}
            alt={item?.title || "Best Seller"}
            width={280}
            height={280}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Unified right-slide hover panel */}
        <ProductHoverActions item={item} />
      </div>
    </div>
  );
};

export default SingleItem;
