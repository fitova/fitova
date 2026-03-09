"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, mapProductFromDB } from "@/types/product";
import ProductHoverActions from "@/components/Common/ProductHoverActions";

const ProductItem = ({ item }: { item: Product }) => {
  const router = useRouter();
  const mapped = item.imgs ? item : mapProductFromDB(item as any);

  const handleImageClick = () => {
    if (mapped.slug) {
      router.push(`/products/${mapped.slug}`);
    }
  };

  return (
    <div className="group">
      {/* Image container */}
      <div
        className="relative overflow-hidden flex items-center justify-center rounded-none bg-[#F6F5F2] min-h-[270px] mb-4 cursor-pointer"
        onClick={handleImageClick}
        role="button"
        tabIndex={0}
        aria-label={`View ${mapped.title}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleImageClick();
        }}
      >
        <Image
          src={mapped.imgs?.previews?.[0] || "/images/products/product-1-bg-1.png"}
          alt={mapped.title || "Product"}
          width={250}
          height={250}
          loading="lazy"
          className="transition-transform duration-500 group-hover:scale-105"
        />

        {/* Unified right-slide hover panel */}
        <ProductHoverActions item={mapped} />
      </div>

      {/* Stars */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex items-center gap-1" aria-label={`${item.reviews ?? 0} reviews`}>
          {[...Array(5)].map((_, i) => (
            <Image key={i} src="/images/icons/icon-star.svg" alt="" width={14} height={14} aria-hidden="true" />
          ))}
        </div>
        <p className="text-custom-sm">({item.reviews})</p>
      </div>

      {/* Title */}
      <h3 className="font-medium text-dark ease-out duration-200 hover:opacity-70 mb-1.5">
        <Link href={mapped.slug ? `/products/${mapped.slug}` : `/products/${mapped.id}`}>
          {mapped.title}
        </Link>
      </h3>

      {/* Price */}
      <span className="flex items-center gap-2 font-medium text-lg">
        <span className="text-dark">${item.discountedPrice}</span>
        {item.price !== item.discountedPrice && (
          <span className="text-dark-4 line-through">${item.price}</span>
        )}
      </span>
    </div>
  );
};

export default React.memo(ProductItem);
