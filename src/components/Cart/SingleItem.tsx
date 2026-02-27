import React, { useState } from "react";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import {
  removeItemFromCart,
  updateCartItemQuantity,
} from "@/redux/features/cart-slice";

import Image from "next/image";
import Link from "next/link";

const SingleItem = ({ item }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const dispatch = useDispatch<AppDispatch>();

  const handleRemoveFromCart = () => {
    dispatch(removeItemFromCart(item.id));
  };

  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
    dispatch(updateCartItemQuantity({ id: item.id, quantity: quantity + 1 }));
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      dispatch(updateCartItemQuantity({ id: item.id, quantity: quantity - 1 }));
    } else {
      return;
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center py-6 px-4 sm:px-6 md:px-7.5 gap-4 md:gap-0">
      {/* Product Image & Info Mobile Header */}
      <div className="w-full md:w-5/12 lg:w-[400px]">
        <div className="flex flex-row items-center gap-4 sm:gap-5.5">
          <div className="relative flex-shrink-0 flex items-center justify-center bg-[#FAFAF9] overflow-hidden w-20 h-24 sm:w-24 sm:h-28 border border-[#E8E4DF]">
            {item.imgs?.thumbnails?.[0] ? (
              <Image fill className="object-cover" src={item?.imgs?.thumbnails?.[0] || "/images/products/product-1-bg-1.png"} alt={item?.title || "product"} />
            ) : (
              <div className="w-full h-full bg-gray-2" />
            )}
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-[#0A0A0A] ease-out duration-200 hover:text-blue mb-1 line-clamp-2">
              <Link href={`/product/${item.slug || item.id}`}> {item.title || "Untitled Product"} </Link>
            </h3>
            {/* Mobile inline price (hidden on desktop config) */}
            <div className="flex md:hidden items-center gap-2 mt-1">
              <span className="text-xs font-light text-[#8A8A8A]">Price:</span>
              <span className="text-sm font-medium text-[#0A0A0A]">${item.discountedPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Price Column */}
      <div className="hidden md:flex md:w-2/12 lg:w-[180px] items-center">
        <p className="text-sm text-[#4A4A4A]">${item.discountedPrice}</p>
      </div>

      {/* Mobile Actions Row (Quantity + Subtotal + Remove) */}
      <div className="flex items-center justify-between w-full md:w-auto md:contents border-t md:border-t-0 border-[#E8E4DF] pt-4 md:pt-0 mt-2 md:mt-0">

        {/* Quantity Controls */}
        <div className="flex items-center md:w-2/12 lg:w-[275px]">
          <div className="inline-flex items-center border border-[#C8C4BF] bg-white h-10 w-28 text-sm">
            <button
              onClick={handleDecreaseQuantity}
              aria-label="Decrease quantity"
              className="flex items-center justify-center w-8 h-full text-[#0A0A0A] hover:bg-[#FAFAF9] ease-out duration-200"
            >
              <span className="text-lg">−</span>
            </button>

            <span className="flex-1 text-center font-medium text-[#0A0A0A] border-x border-[#E8E4DF]">
              {quantity}
            </span>

            <button
              onClick={handleIncreaseQuantity}
              aria-label="Increase quantity"
              className="flex items-center justify-center w-8 h-full text-[#0A0A0A] hover:bg-[#FAFAF9] ease-out duration-200"
            >
              <span className="text-lg">+</span>
            </button>
          </div>
        </div>

        {/* Subtotal Desktop/Mobile */}
        <div className="flex flex-col md:w-2/12 lg:w-[200px] items-end md:items-start ml-auto md:ml-0 mr-4 md:mr-0">
          <p className="md:hidden text-[10px] tracking-[0.1em] uppercase text-[#8A8A8A]">Subtotal</p>
          <p className="text-sm font-medium text-[#0A0A0A]">${(item.discountedPrice * quantity).toFixed(2)}</p>
        </div>

        {/* Remove Button */}
        <div className="flex justify-end items-center md:w-1/12 lg:w-[50px] md:ml-auto">
          <button
            onClick={handleRemoveFromCart}
            aria-label="Remove item"
            className="group flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 ease-out duration-200"
          >
            <svg
              className="text-[#8A8A8A] group-hover:text-red transition-colors"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
