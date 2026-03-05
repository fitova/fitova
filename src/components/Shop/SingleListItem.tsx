"use client";
import React from "react";

import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { tracking } from "@/lib/queries/tracking";
import { useCurrentUser } from "@/app/context/AuthContext";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";

const SingleListItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useCurrentUser();

  const [wishlistAnimating, setWishlistAnimating] = React.useState(false);
  const isInWishlist = useSelector((state: RootState) =>
    state.wishlistReducer.items.some((w) => w.id === String(item.id) || w.item_id === String(item.id))
  );

  // update the QuickView state
  const handleQuickViewUpdate = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    dispatch(updateQuickView({ ...item }));
  };

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    dispatch(
      addItemToCart({
        ...item,
        id: item.id,
        quantity: 1,
      })
    );
    tracking.trackCartEvent(item.id, user?.id, "add");
  };

  const handleItemToWishList = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setWishlistAnimating(true);
    setTimeout(() => setWishlistAnimating(false), 400);

    if (isInWishlist) {
      dispatch(removeItemFromWishlist({ item_id: String(item.id), item_type: "product" }));
      try {
        const { removeFromWishlist } = await import("@/lib/queries/wishlist");
        await removeFromWishlist(String(item.id), "product");
      } catch { /* ignore if not logged in */ }
    } else {
      dispatch(
        addItemToWishlist({
          id: String(item.id),
          item_id: String(item.id),
          item_type: "product",
          created_at: new Date().toISOString(),
          title: item.title,
          price: item.price,
          discountedPrice: item.discountedPrice,
          imageUrl: item.imgs?.previews?.[0] ?? item.imgs?.thumbnails?.[0],
        })
      );
      try {
        const { addToWishlist } = await import("@/lib/queries/wishlist");
        await addToWishlist(String(item.id), "product");
      } catch { /* ignore if not logged in */ }
    }
  };

  return (
    <div className="group rounded-lg bg-white shadow-1">
      <div className="flex">
        <Link href={`/products/${item.slug ?? item.id}`} scroll={false} className="shadow-list relative overflow-hidden flex items-center justify-center max-w-[270px] w-full sm:min-h-[270px] p-4 block">
          <Image src={item?.imgs?.previews?.[0] || "/images/products/product-1-bg-1.png"} alt={item?.title || "Product"} width={250} height={250} className="object-cover transition-transform duration-500 ease-out group-hover:-translate-x-full" />
          {item?.imgs?.previews?.[1] && (
            <Image src={item?.imgs?.previews?.[1]} alt={item?.title || "Product"} fill className="object-cover absolute inset-0 translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0" />
          )}

          <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
            <button
              onClick={() => {
                openModal();
                handleQuickViewUpdate();
              }}
              aria-label="button for quick view"
              className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
            >
              <svg
                className="fill-current"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.00016 5.5C6.61945 5.5 5.50016 6.61929 5.50016 8C5.50016 9.38071 6.61945 10.5 8.00016 10.5C9.38087 10.5 10.5002 9.38071 10.5002 8C10.5002 6.61929 9.38087 5.5 8.00016 5.5ZM6.50016 8C6.50016 7.17157 7.17174 6.5 8.00016 6.5C8.82859 6.5 9.50016 7.17157 9.50016 8C9.50016 8.82842 8.82859 9.5 8.00016 9.5C7.17174 9.5 6.50016 8.82842 6.50016 8Z"
                  fill=""
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.00016 2.16666C4.99074 2.16666 2.96369 3.96946 1.78721 5.49791L1.76599 5.52546C1.49992 5.87102 1.25487 6.18928 1.08862 6.5656C0.910592 6.96858 0.833496 7.40779 0.833496 8C0.833496 8.5922 0.910592 9.03142 1.08862 9.4344C1.25487 9.81072 1.49992 10.129 1.76599 10.4745L1.78721 10.5021C2.96369 12.0305 4.99074 13.8333 8.00016 13.8333C11.0096 13.8333 13.0366 12.0305 14.2131 10.5021L14.2343 10.4745C14.5004 10.129 14.7455 9.81072 14.9117 9.4344C15.0897 9.03142 15.1668 8.5922 15.1668 8C15.1668 7.40779 15.0897 6.96858 14.9117 6.5656C14.7455 6.18927 14.5004 5.87101 14.2343 5.52545L14.2131 5.49791C13.0366 3.96946 11.0096 2.16666 8.00016 2.16666ZM2.57964 6.10786C3.66592 4.69661 5.43374 3.16666 8.00016 3.16666C10.5666 3.16666 12.3344 4.69661 13.4207 6.10786C13.7131 6.48772 13.8843 6.7147 13.997 6.9697C14.1023 7.20801 14.1668 7.49929 14.1668 8C14.1668 8.50071 14.1023 8.79199 13.997 9.0303C13.8843 9.28529 13.7131 9.51227 13.4207 9.89213C12.3344 11.3034 10.5666 12.8333 8.00016 12.8333C5.43374 12.8333 3.66592 11.3034 2.57964 9.89213C2.28725 9.51227 2.11599 9.28529 2.00334 9.0303C1.89805 8.79199 1.8335 8.50071 1.8335 8C1.8335 7.49929 1.89805 7.20801 2.00334 6.9697C2.11599 6.7147 2.28725 6.48772 2.57964 6.10786Z"
                  fill=""
                />
              </svg>
            </button>

            <button
              onClick={(e) => handleAddToCart(e)}
              className="inline-flex font-medium text-custom-sm py-[7px] px-5 rounded-[5px] text-white ease-out duration-200 hover:opacity-80"
              style={{ backgroundColor: "#1a1a1a" }}
            >
              Add to cart
            </button>

            <button
              onClick={() => handleItemToWishList()}
              aria-label="button for favorite select"
              className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
            >
              {isInWishlist ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="none"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
              )}
            </button>
          </div>
        </Link>

        <div className="w-full flex flex-col gap-5 sm:flex-row sm:items-center justify-center sm:justify-between py-5 px-4 sm:px-7.5 lg:pl-11 lg:pr-12">
          <div>
            {item.brand ? (
              <p className="text-[11px] text-[#8A8A8A] font-light uppercase tracking-wider mb-1 truncate">
                {item.brand}
                {(item.gender || item.piece_type || (item.colors && item.colors.length > 0)) && (
                  <span className="inline-flex items-center gap-1.5 ml-1.5 normal-case font-normal text-[11px] md:text-xs">
                    ·
                    {item.gender && (
                      <span className="capitalize">{item.gender}</span>
                    )}
                    {(item.gender && item.piece_type) && <span>·</span>}
                    {item.piece_type && (
                      <span className="capitalize">
                        {item.piece_type.toLowerCase() === "long-sleeve-shirt" ? "L/S Shirt" :
                          item.piece_type.toLowerCase() === "short-sleeve-shirt" ? "S/S Shirt" :
                            item.piece_type.replace(/-/g, ' ')}
                      </span>
                    )}
                    {((item.gender || item.piece_type) && item.colors && item.colors[0]) && <span>·</span>}
                    {item.colors && item.colors[0] && (
                      <span className="flex items-center gap-1 capitalize">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-[#E8E4DF]"
                          style={{
                            backgroundColor: item.colors[0].toLowerCase() === 'black' ? '#1a1a1a' :
                              item.colors[0].toLowerCase() === 'white' ? '#f5f5f5' :
                                item.colors[0].toLowerCase() === 'beige' ? '#d4b896' :
                                  item.colors[0].toLowerCase() === 'navy' ? '#1e2a4a' :
                                    item.colors[0].toLowerCase() === 'grey' || item.colors[0].toLowerCase() === 'gray' ? '#9ca3af' :
                                      item.colors[0].toLowerCase() === 'brown' ? '#92400e' :
                                        item.colors[0].toLowerCase() === 'red' ? '#ef4444' :
                                          item.colors[0].toLowerCase() === 'blue' ? '#3b82f6' :
                                            item.colors[0].toLowerCase() === 'green' ? '#16a34a' :
                                              item.colors[0].toLowerCase() === 'pink' ? '#ec4899' :
                                                item.colors[0].toLowerCase() === 'purple' ? '#9333ea' :
                                                  item.colors[0].toLowerCase() === 'yellow' ? '#facc15' :
                                                    item.colors[0].toLowerCase() === 'orange' ? '#f97316' : '#ccc'
                          }}
                        />
                        {item.colors[0]}
                      </span>
                    )}
                  </span>
                )}
              </p>
            ) : (
              <div className="text-[11px] md:text-xs text-[#8A8A8A] font-light mb-1 truncate flex items-center gap-1.5">
                {item.gender && (
                  <span className="capitalize">{item.gender}</span>
                )}
                {(item.gender && item.piece_type) && <span>·</span>}
                {item.piece_type && (
                  <span className="capitalize">
                    {item.piece_type.toLowerCase() === "long-sleeve-shirt" ? "L/S Shirt" :
                      item.piece_type.toLowerCase() === "short-sleeve-shirt" ? "S/S Shirt" :
                        item.piece_type.replace(/-/g, ' ')}
                  </span>
                )}
                {((item.gender || item.piece_type) && item.colors && item.colors[0]) && <span>·</span>}
                {item.colors && item.colors[0] && (
                  <span className="flex items-center gap-1 capitalize">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-[#E8E4DF]"
                      style={{
                        backgroundColor: item.colors[0].toLowerCase() === 'black' ? '#1a1a1a' :
                          item.colors[0].toLowerCase() === 'white' ? '#f5f5f5' :
                            item.colors[0].toLowerCase() === 'beige' ? '#d4b896' :
                              item.colors[0].toLowerCase() === 'navy' ? '#1e2a4a' :
                                item.colors[0].toLowerCase() === 'grey' || item.colors[0].toLowerCase() === 'gray' ? '#9ca3af' :
                                  item.colors[0].toLowerCase() === 'brown' ? '#92400e' :
                                    item.colors[0].toLowerCase() === 'red' ? '#ef4444' :
                                      item.colors[0].toLowerCase() === 'blue' ? '#3b82f6' :
                                        item.colors[0].toLowerCase() === 'green' ? '#16a34a' :
                                          item.colors[0].toLowerCase() === 'pink' ? '#ec4899' :
                                            item.colors[0].toLowerCase() === 'purple' ? '#9333ea' :
                                              item.colors[0].toLowerCase() === 'yellow' ? '#facc15' :
                                                item.colors[0].toLowerCase() === 'orange' ? '#f97316' : '#ccc'
                      }}
                    />
                    {item.colors[0]}
                  </span>
                )}
              </div>
            )}

            <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5">
              <Link href={`/products/${item.slug ?? item.id}`} scroll={false}> {item.title} </Link>
            </h3>

            <span className="flex items-center gap-2 font-medium text-lg">
              <span className="text-dark">${item.discountedPrice}</span>
              <span className="text-dark-4 line-through">${item.price}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex items-center gap-1">
              <Image
                src="/images/icons/icon-star.svg"
                alt="star icon"
                width={15}
                height={15}
              />
              <Image
                src="/images/icons/icon-star.svg"
                alt="star icon"
                width={15}
                height={15}
              />
              <Image
                src="/images/icons/icon-star.svg"
                alt="star icon"
                width={15}
                height={15}
              />
              <Image
                src="/images/icons/icon-star.svg"
                alt="star icon"
                width={15}
                height={15}
              />
              <Image
                src="/images/icons/icon-star.svg"
                alt="star icon"
                width={15}
                height={15}
              />
            </div>

            <p className="text-custom-sm">({item.reviews})</p>
          </div>
        </div>
      </div>
    </div >
  );
};

export default SingleListItem;
