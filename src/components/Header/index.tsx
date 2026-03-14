"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { menuData } from "./menuData";
import Dropdown from "./Dropdown";
import MegaMenu from "./MegaMenu";
import MobileMegaMenu from "./MobileMegaMenu";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useCartModal } from "@/app/context/CartModalContext";
import { useWishlistModal } from "@/app/context/WishlistModalContext";
import { useStyleHub } from "@/app/context/StyleHubContext";
import Image from "next/image";
import { useCurrentUser } from "@/app/context/AuthContext";
import { getCategoryHierarchy, getCategoryImages, CategoryWithChildren, CategoryImage } from "@/lib/queries/categories";
import GlobalSearchDropdown from "./GlobalSearchDropdown";

/* ── All-Categories dropdown for scoping search ──────────── */
function AllCategoriesDropdown({
  categories,
  isTransparent,
}: {
  categories: CategoryWithChildren[];
  isTransparent: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Flatten children for the dropdown
  const allChildren = useMemo(
    () => categories.flatMap((p) => p.children.map((c) => ({ ...c, parentName: p.name }))),
    [categories]
  );

  const handleSelect = (slug: string) => {
    setOpen(false);
    router.push(`/outfits?category=${slug}`);
  };

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs font-light tracking-wide whitespace-nowrap px-3 py-2 border transition-all duration-300 ${isTransparent
          ? "border-white/30 text-white hover:bg-white/10"
          : "border-[#E8E4DF] text-[#0A0A0A] hover:bg-[#FAFAF9]"
          }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
        All Categories
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-[#E8E4DF] shadow-lg z-50 max-h-[360px] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
          {/* All */}
          <button
            onClick={() => { setOpen(false); router.push("/outfits"); }}
            className="w-full text-left px-4 py-2.5 text-xs font-medium tracking-wide text-[#0A0A0A] hover:bg-[#FAFAF9] border-b border-[#E8E4DF]"
          >
            View All Products
          </button>

          {categories.map((parent) => (
            <div key={parent.id}>
              <p className="px-4 pt-3 pb-1 text-[9px] font-medium tracking-[0.2em] uppercase text-[#8A8A8A]">
                {parent.name}
              </p>
              {parent.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleSelect(child.slug)}
                  className="w-full text-left px-4 py-2 text-[13px] text-[#4A4A4A] hover:text-[#0A0A0A] hover:bg-[#FAFAF9] transition-colors capitalize"
                >
                  {child.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const Header = () => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [categoryHierarchy, setCategoryHierarchy] = useState<CategoryWithChildren[]>([]);
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const { openCartModal } = useCartModal();
  const { openWishlistModal } = useWishlistModal();
  const { openStyleHub } = useStyleHub();
  const { user } = useCurrentUser();
  const pathname = usePathname();

  // Transparent navbar only on homepage when scrolled to top
  const isHomepage = pathname === "/";
  const isTransparent = isHomepage && isAtTop;

  // Dynamic icon color based on navbar state
  const iconColor = isTransparent ? "#FFFFFF" : "#1A1A1A";
  const textClass = isTransparent ? "text-white" : "text-dark";
  const textSubClass = isTransparent ? "text-white/60" : "text-dark-4";

  const product = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);

  const handleOpenCartModal = () => {
    openCartModal();
  };

  // Sticky menu + transparent-to-solid transition
  useEffect(() => {
    const handleStickyMenu = () => {
      if (window.scrollY >= 20) {
        setStickyMenu(true);
        setIsAtTop(false);
      } else {
        setStickyMenu(false);
        setIsAtTop(true);
      }
    };

    handleStickyMenu(); // set initial state
    window.addEventListener("scroll", handleStickyMenu, { passive: true });
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  // Fetch category hierarchy and images once
  useEffect(() => {
    getCategoryHierarchy()
      .then(setCategoryHierarchy)
      .catch(() => setCategoryHierarchy([]));

    getCategoryImages()
      .then(setCategoryImages)
      .catch(() => setCategoryImages([]));
  }, []);

  return (
    <header
      className={`fixed left-0 top-0 w-full z-50 transition-all duration-500 ease-in-out ${isTransparent
        ? "bg-transparent border-transparent"
        : stickyMenu
          ? "bg-white shadow-sm border-b border-[#E8E4DF]"
          : "bg-white border-b border-[#E8E4DF]"
        }`}
    >
      <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
        {/* ── Mobile Top Bar (xl:hidden) ─────────────────────────────── */}
        <div className="relative flex xl:hidden items-center justify-between py-3">
          {/* Left: Search + Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center -ml-2"
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={() => setNavigationOpen(true)}
              className="w-9 h-9 flex items-center justify-center -ml-1"
              aria-label="Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {/* Center: Logo — absolute centered */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <img
              src={isTransparent ? "/images/logo/logo-white.svg" : "/images/logo/logo.svg"}
              alt="Fitova"
              className="h-8 w-auto"
              onError={(e) => { (e.target as HTMLImageElement).src = "/images/logo/logo.svg"; }}
            />
          </Link>
          {/* Right: Cart + Wishlist + StyleHub */}
          <div className="flex items-center gap-1">
            <button onClick={handleOpenCartModal} className="relative w-9 h-9 flex items-center justify-center" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" />
                <circle cx="9" cy="21" r="1.5" /><circle cx="20" cy="21" r="1.5" />
              </svg>
              {product.length > 0 && (
                <span className="absolute top-0 right-0 w-4.5 h-4.5 rounded-full bg-[#0A0A0A] text-white text-[9px] flex items-center justify-center font-medium">
                  {product.length}
                </span>
              )}
            </button>
            <button onClick={openWishlistModal} className="w-9 h-9 flex items-center justify-center" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button onClick={openStyleHub} className="w-9 h-9 flex items-center justify-center mr-[-4px]" aria-label="Style Hub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Full-Screen Overlay */}
        {mobileSearchOpen && (
          <div className="fixed inset-0 z-[200] bg-white xl:hidden flex flex-col animate-in slide-in-from-top-2 duration-300 w-screen h-screen">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E4DF] bg-white">
              <div className="flex-1">
                <GlobalSearchDropdown isTransparent={false} autoFocus={true} />
              </div>
              <button onClick={() => setMobileSearchOpen(false)} className="p-2 -mr-2 text-[#4A4A4A] flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {/* Dark opaque area to close when clicking below the results */}
            <div className="flex-1 bg-black/5" onClick={() => setMobileSearchOpen(false)} />
          </div>
        )}

        {/* ── Desktop Top Row (hidden on mobile) ───────────────────────── */}
        <div
          className={`hidden xl:flex items-center xl:justify-between ease-out duration-200 ${stickyMenu ? "py-4" : "py-6"}`}
        >
          {/* Desktop left: Logo + Search */}
          <div className="xl:w-auto flex-col sm:flex-row w-full flex sm:justify-between sm:items-center gap-5 sm:gap-10">
            <Link className="flex-shrink-0" href="/">
              <img
                src={isTransparent ? "/images/logo/logo-white.svg" : "/images/logo/logo.svg"}
                alt="Fitova Logo"
                className="h-10 lg:h-14 w-auto transition-opacity duration-300"
                onError={(e) => { (e.target as HTMLImageElement).src = "/images/logo/logo.svg"; }}
              />
            </Link>
            <div className="flex items-center gap-2 max-w-[550px] w-full">
              <AllCategoriesDropdown categories={categoryHierarchy} isTransparent={isTransparent} />
              <div className="flex-1 min-w-0">
                <GlobalSearchDropdown isTransparent={isTransparent} />
              </div>
            </div>
          </div>

          {/* <!-- header top right --> */}
          <div className="flex w-full lg:w-auto items-center gap-7.5">
            <div className="flex w-full lg:w-auto justify-between items-center gap-5">
              <div className="flex items-center gap-5">
                {user ? (
                  <Link
                    href="/my-account"
                    className="flex items-center gap-2.5"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full object-cover w-8 h-8 border border-gray-3"
                      />
                    ) : (
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium flex-shrink-0 transition-colors duration-300 ${isTransparent ? "bg-white text-[#0A0A0A]" : "bg-[#0A0A0A] text-white"
                          }`}
                      >
                        {(user.user_metadata?.full_name || user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                    <div>
                      <span className={`block text-2xs uppercase transition-colors duration-300 ${textSubClass}`}>
                        account
                      </span>
                      <p className={`font-medium text-custom-sm truncate max-w-[100px] transition-colors duration-300 ${textClass}`}>
                        {user.user_metadata?.full_name
                          ? user.user_metadata.full_name.split(" ")[0]
                          : user.email?.split("@")[0] ?? "My Account"}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 1.25C9.37666 1.25 7.25001 3.37665 7.25001 6C7.25001 8.62335 9.37666 10.75 12 10.75C14.6234 10.75 16.75 8.62335 16.75 6C16.75 3.37665 14.6234 1.25 12 1.25ZM8.75001 6C8.75001 4.20507 10.2051 2.75 12 2.75C13.7949 2.75 15.25 4.20507 15.25 6C15.25 7.79493 13.7949 9.25 12 9.25C10.2051 9.25 8.75001 7.79493 8.75001 6Z"
                        fill={iconColor}
                        className="transition-all duration-300"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 12.25C9.68646 12.25 7.55494 12.7759 5.97546 13.6643C4.4195 14.5396 3.25001 15.8661 3.25001 17.5L3.24995 17.602C3.24882 18.7638 3.2474 20.222 4.52642 21.2635C5.15589 21.7761 6.03649 22.1406 7.22622 22.3815C8.41927 22.6229 9.97424 22.75 12 22.75C14.0258 22.75 15.5808 22.6229 16.7738 22.3815C17.9635 22.1406 18.8441 21.7761 19.4736 21.2635C20.7526 20.222 20.7512 18.7638 20.7501 17.602L20.75 17.5C20.75 15.8661 19.5805 14.5396 18.0246 13.6643C16.4451 12.7759 14.3136 12.25 12 12.25ZM4.75001 17.5C4.75001 16.6487 5.37139 15.7251 6.71085 14.9717C8.02681 14.2315 9.89529 13.75 12 13.75C14.1047 13.75 15.9732 14.2315 17.2892 14.9717C18.6286 15.7251 19.25 16.6487 19.25 17.5C19.25 18.8078 19.2097 19.544 18.5264 20.1004C18.1559 20.4022 17.5365 20.6967 16.4762 20.9113C15.4193 21.1252 13.9742 21.25 12 21.25C10.0258 21.25 8.58075 21.1252 7.5238 20.9113C6.46354 20.6967 5.84413 20.4022 5.4736 20.1004C4.79033 19.544 4.75001 18.8078 4.75001 17.5Z"
                        fill={iconColor}
                        className="transition-all duration-300"
                      />
                    </svg>

                    <div>
                      <span className={`block text-2xs uppercase transition-colors duration-300 ${textSubClass}`}>
                        account
                      </span>
                      <p className={`font-medium text-custom-sm flex items-center gap-1.5 transition-colors duration-300 ${textClass}`}>
                        <Link href="/signin" className={isTransparent ? "hover:text-white/70" : "hover:text-blue"}>
                          Sign In
                        </Link>
                        <span className={isTransparent ? "text-white/40" : "text-gray-4"}>/</span>
                        <Link href="/signup" className={isTransparent ? "hover:text-white/70" : "hover:text-blue"}>
                          Sign Up
                        </Link>
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleOpenCartModal}
                  className="flex items-center gap-2.5"
                >
                  <span className="inline-block relative">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.5433 9.5172C15.829 9.21725 15.8174 8.74252 15.5174 8.45686C15.2175 8.17119 14.7428 8.18277 14.4571 8.48272L12.1431 10.9125L11.5433 10.2827C11.2576 9.98277 10.7829 9.97119 10.483 10.2569C10.183 10.5425 10.1714 11.0173 10.4571 11.3172L11.6 12.5172C11.7415 12.6658 11.9378 12.75 12.1431 12.75C12.3483 12.75 12.5446 12.6658 12.6862 12.5172L15.5433 9.5172Z"
                        fill={iconColor}
                        className="transition-all duration-300"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M1.29266 2.7512C1.43005 2.36044 1.8582 2.15503 2.24896 2.29242L2.55036 2.39838C3.16689 2.61511 3.69052 2.79919 4.10261 3.00139C4.54324 3.21759 4.92109 3.48393 5.20527 3.89979C5.48725 4.31243 5.60367 4.76515 5.6574 5.26153C5.66124 5.29706 5.6648 5.33321 5.66809 5.36996L17.1203 5.36996C17.9389 5.36995 18.7735 5.36993 19.4606 5.44674C19.8103 5.48584 20.1569 5.54814 20.4634 5.65583C20.7639 5.76141 21.0942 5.93432 21.3292 6.23974C21.711 6.73613 21.7777 7.31414 21.7416 7.90034C21.7071 8.45845 21.5686 9.15234 21.4039 9.97723L21.3935 10.0295L21.3925 10.0341L20.8836 12.5033C20.7339 13.2298 20.6079 13.841 20.4455 14.3231C20.2731 14.8346 20.0341 15.2842 19.6076 15.6318C19.1811 15.9793 18.6925 16.1226 18.1568 16.1882C17.6518 16.25 17.0278 16.25 16.2862 16.25L10.8804 16.25C9.53464 16.25 8.44479 16.25 7.58656 16.1283C6.69032 16.0012 5.93752 15.7285 5.34366 15.1022C4.79742 14.526 4.50529 13.9144 4.35897 13.0601C4.22191 12.2598 4.20828 11.2125 4.20828 9.75996V7.03832C4.20828 6.29837 4.20726 5.80316 4.16611 5.42295C4.12678 5.0596 4.05708 4.87818 3.96682 4.74609C3.87876 4.61723 3.74509 4.4968 3.44186 4.34802C3.11902 4.18961 2.68026 4.03406 2.01266 3.79934L1.75145 3.7075C1.36068 3.57012 1.15527 3.14197 1.29266 2.7512ZM5.70828 6.86996L5.70828 9.75996C5.70828 11.249 5.72628 12.1578 5.83744 12.8068C5.93933 13.4018 6.11202 13.7324 6.43219 14.0701C6.70473 14.3576 7.08235 14.5418 7.79716 14.6432C8.53783 14.7482 9.5209 14.75 10.9377 14.75H16.2406C17.0399 14.75 17.5714 14.7487 17.9746 14.6993C18.3573 14.6525 18.5348 14.571 18.66 14.469C18.7853 14.3669 18.9009 14.2095 19.024 13.8441C19.1537 13.4592 19.2623 12.9389 19.4237 12.156L19.9225 9.73591L19.9229 9.73369C20.1005 8.84376 20.217 8.2515 20.2444 7.80793C20.2704 7.38648 20.2043 7.23927 20.1429 7.15786C20.1367 7.15259 20.0931 7.11565 19.9661 7.07101C19.8107 7.01639 19.5895 6.97049 19.2939 6.93745C18.6991 6.87096 17.9454 6.86996 17.089 6.86996H5.70828Z"
                        fill={iconColor}
                        className="transition-all duration-300"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.2502 19.5C5.2502 20.7426 6.25756 21.75 7.5002 21.75C8.74285 21.75 9.7502 20.7426 9.7502 19.5C9.7502 18.2573 8.74285 17.25 7.5002 17.25C6.25756 17.25 5.2502 18.2573 5.2502 19.5ZM7.5002 20.25C7.08599 20.25 6.7502 19.9142 6.7502 19.5C6.7502 19.0857 7.08599 18.75 7.5002 18.75C7.91442 18.75 8.2502 19.0857 8.2502 19.5C8.2502 19.9142 7.91442 20.25 7.5002 20.25Z"
                        fill={iconColor}
                        className="transition-all duration-300"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14.25 19.5001C14.25 20.7427 15.2574 21.7501 16.5 21.7501C17.7426 21.7501 18.75 20.7427 18.75 19.5001C18.75 18.2574 17.7426 17.2501 16.5 17.2501C15.2574 17.2501 14.25 18.2574 14.25 19.5001ZM16.5 20.2501C16.0858 20.2501 15.75 19.9143 15.75 19.5001C15.75 19.0859 16.0858 18.7501 16.5 18.7501C16.9142 18.7501 17.25 19.0859 17.25 19.5001C17.25 19.9143 16.9142 20.2501 16.5 20.2501Z"
                        fill={iconColor}
                        className="transition-all duration-300"
                      />
                    </svg>

                    <span className={`flex items-center justify-center font-medium text-2xs absolute -right-2 -top-2.5 w-4.5 h-4.5 rounded-full transition-colors duration-300 ${isTransparent ? "bg-white text-[#0A0A0A]" : "bg-dark text-white"
                      }`}>
                      {product.length}
                    </span>
                  </span>

                  <div>
                    <span className={`block text-2xs uppercase transition-colors duration-300 ${textSubClass}`}>
                      cart
                    </span>
                    <p className={`font-medium text-custom-sm transition-colors duration-300 ${textClass}`}>
                      ${totalPrice}
                    </p>
                  </div>
                </button>
              </div>

              {/* ── StyleHub Icon — always visible on mobile ── */}
              <button
                onClick={openStyleHub}
                aria-label="Open Style Hub"
                className="flex items-center justify-center w-9 h-9 xl:hidden"
                title="Style Hub"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    stroke={iconColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                </svg>
              </button>

              {/* <!-- Hamburger Toggle BTN --> */}
              <button
                id="Toggle"
                aria-label="Toggler"
                className="xl:hidden block"
                onClick={() => setNavigationOpen(!navigationOpen)}
              >
                <span className="block relative cursor-pointer w-5.5 h-5.5">
                  <span className="du-block absolute right-0 w-full h-full">
                    <span
                      className={`block relative top-0 left-0 rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-[0] transition-colors ${isTransparent ? "bg-white" : "bg-dark"} ${!navigationOpen && "!w-full delay-300"
                        }`}
                    ></span>
                    <span
                      className={`block relative top-0 left-0 rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-150 transition-colors ${isTransparent ? "bg-white" : "bg-dark"} ${!navigationOpen && "!w-full delay-400"
                        }`}
                    ></span>
                    <span
                      className={`block relative top-0 left-0 rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-200 transition-colors ${isTransparent ? "bg-white" : "bg-dark"} ${!navigationOpen && "!w-full delay-500"
                        }`}
                    ></span>
                  </span>

                  <span className="block absolute right-0 w-full h-full rotate-45">
                    <span
                      className={`block rounded-sm ease-in-out duration-200 delay-300 absolute left-2.5 top-0 w-0.5 h-full transition-colors ${isTransparent ? "bg-white" : "bg-dark"} ${!navigationOpen && "!h-0 delay-[0] "
                        }`}
                    ></span>
                    <span
                      className={`block rounded-sm ease-in-out duration-200 delay-400 absolute left-0 top-2.5 w-full h-0.5 transition-colors ${isTransparent ? "bg-white" : "bg-dark"} ${!navigationOpen && "!h-0 dealy-200"
                        }`}
                    ></span>
                  </span>
                </span>
              </button>
              {/* //   <!-- Hamburger Toggle BTN --> */}
            </div>
          </div>
        </div>
        {/* <!-- header top end --> */}
      </div>

      <div className={`border-t transition-colors duration-300 ${isTransparent ? "border-white/20" : "border-gray-3"}`}>
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
          <div className="flex items-center justify-between">
            {/* <!--=== Main Nav Start ===--> */}
            {/* Mobile Drawer Overlay */}
            {navigationOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-[100] transition-opacity xl:hidden"
                onClick={() => setNavigationOpen(false)}
              />
            )}
            <div
              className={`fixed top-0 left-0 w-[300px] h-full bg-white z-[110] transform transition-transform duration-300 ease-in-out shadow-2xl xl:static xl:w-auto xl:h-auto xl:bg-transparent xl:shadow-none xl:translate-x-0 xl:flex items-center justify-between ${navigationOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
              {/* Mobile Drawer Header (Logo & Close) */}
              <div className="flex items-center justify-between px-5 py-6 border-b border-[#E8E4DF] xl:hidden">
                <div className="flex-1 flex justify-center">
                  <Link href="/" onClick={() => setNavigationOpen(false)}>
                    <img
                      src="/images/logo/logo.svg"
                      alt="Fitova Logo"
                      className="h-8 w-auto px-4"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/images/logo/logo.svg"; }}
                    />
                  </Link>
                </div>
                <button
                  onClick={() => setNavigationOpen(false)}
                  className="p-1 -mr-1 text-[#0A0A0A]"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* ── Desktop Nav (xl only) ─────────────────────── */}
              <nav className="hidden xl:block">
                <ul className="flex items-center gap-8">
                  <li className="group relative before:w-0 before:h-[2px] before:absolute before:left-0 before:top-0 before:rounded-b-[2px] before:ease-out before:duration-200 hover:before:w-full"
                    style={{ "--tw-before-bg": isTransparent ? "white" : "#1a1a1a" } as React.CSSProperties}
                  >
                    <Link href="/" onClick={() => setNavigationOpen(false)}
                      className={`text-custom-sm font-light tracking-wide flex transition-colors duration-300 ${stickyMenu ? "py-4" : "py-6"} ${isTransparent ? "text-white hover:text-white/70" : "text-dark hover:text-dark-2"}`}
                    >Home</Link>
                  </li>
                  <MegaMenu categories={categoryHierarchy} categoryImages={categoryImages} stickyMenu={stickyMenu} isTransparent={isTransparent} />
                  {menuData.filter(m => m.id !== 1).map((menuItem, i) =>
                    menuItem.submenu ? (
                      <Dropdown key={i} menuItem={menuItem} stickyMenu={stickyMenu} isTransparent={isTransparent} />
                    ) : (
                      <li key={i} className="group relative before:w-0 before:h-[2px] before:absolute before:left-0 before:top-0 before:rounded-b-[2px] before:ease-out before:duration-200 hover:before:w-full"
                        style={{ "--tw-before-bg": isTransparent ? "white" : "#1a1a1a" } as React.CSSProperties}
                      >
                        <Link href={menuItem.path} onClick={() => setNavigationOpen(false)}
                          className={`text-custom-sm font-light tracking-wide flex transition-colors duration-300 ${stickyMenu ? "py-4" : "py-6"} ${isTransparent ? "text-white hover:text-white/70" : "text-dark hover:text-dark-2"}`}
                        >{menuItem.title}</Link>
                      </li>
                    )
                  )}
                </ul>
              </nav>

              {/* ── Mobile Drawer Nav ─────────────── */}
              <div className="xl:hidden flex flex-col h-[calc(100%-73px)] overflow-y-auto">
                <div className="pt-2">
                  <MobileMegaMenu categories={categoryHierarchy} onClose={() => setNavigationOpen(false)} />
                </div>

                {/* Section 2: Explore */}
                <div className="px-5 pt-6 pb-2">
                  <p className="text-[9px] font-medium tracking-[0.25em] uppercase text-[#C8C8C8] mb-3">Explore</p>
                  {[
                    { title: "Lookbooks", path: "/lookbook" },
                    { title: "Deals", path: "/deals" },
                    { title: "Coupons", path: "/coupons" },
                    { title: "AI Styling", path: "#", onClick: () => { setNavigationOpen(false); openStyleHub(); } },
                    { title: "Mirror Style", path: "/mirror-style" },
                  ].map(({ title, path, onClick }) => onClick ? (
                    <button key={title} onClick={onClick} className="flex w-full items-center justify-between py-3 border-b border-[#F0EDE8] text-sm font-light text-[#0A0A0A] hover:text-[#4A4A4A] transition-colors text-left">
                      {title}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8C8C8" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  ) : (
                    <Link key={path} href={path} onClick={() => setNavigationOpen(false)}
                      className="flex items-center justify-between py-3 border-b border-[#F0EDE8] text-sm font-light text-[#0A0A0A] hover:text-[#4A4A4A] transition-colors"
                    >
                      {title}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8C8C8" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
                    </Link>
                  ))}
                </div>

                {/* Section 3: Help */}
                <div className="px-5 pt-6 pb-2">
                  <p className="text-[9px] font-medium tracking-[0.25em] uppercase text-[#C8C8C8] mb-3">Help</p>
                  {[
                    { title: "About", path: "/about" },
                    { title: "Contact", path: "/contact" },
                  ].map(({ title, path }) => (
                    <Link key={path} href={path} onClick={() => setNavigationOpen(false)}
                      className="flex items-center justify-between py-3 border-b border-[#F0EDE8] text-sm font-light text-[#0A0A0A] hover:text-[#4A4A4A] transition-colors"
                    >
                      {title}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8C8C8" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
                    </Link>
                  ))}
                </div>

                {/* Bottom: Auth */}
                <div className="mt-auto px-5 py-6 border-t border-[#E8E4DF]">
                  {user ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-sm font-medium flex-shrink-0 overflow-hidden">
                        {user.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-light text-[#0A0A0A] truncate">{user.user_metadata?.full_name || user.email?.split("@")[0]}</p>
                        <Link href="/my-account" onClick={() => setNavigationOpen(false)} className="text-[11px] text-[#8A8A8A] font-light underline">My Account →</Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Link href="/signin" onClick={() => setNavigationOpen(false)}
                        className="flex-1 py-3 text-center text-xs font-light tracking-[0.15em] uppercase border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition"
                      >Sign In</Link>
                      <Link href="/signup" onClick={() => setNavigationOpen(false)}
                        className="flex-1 py-3 text-center text-xs font-light tracking-[0.15em] uppercase bg-[#0A0A0A] text-white hover:bg-[#2C2C2C] transition"
                      >Sign Up</Link>
                    </div>
                  )}
                </div>
              </div>
              {/* //   <!-- Main Nav End --> */}
            </div>
            {/* // <!--=== Main Nav End ===--> */}

            {/* // <!--=== Nav Right Start ===--> */}
            <div className="hidden xl:block">
              <ul className="flex items-center gap-5.5">
                <li className="py-4">
                  <button
                    onClick={openWishlistModal}
                    className={`flex items-center gap-1.5 text-custom-sm font-light tracking-wide transition-colors duration-300 ${isTransparent ? "text-white hover:text-white/70" : "text-dark hover:text-dark-2"
                      }`}
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
                        d="M5.97441 12.6073L6.43872 12.0183L5.97441 12.6073ZM7.99992 3.66709L7.45955 4.18719C7.60094 4.33408 7.79604 4.41709 7.99992 4.41709C8.2038 4.41709 8.3989 4.33408 8.54028 4.18719L7.99992 3.66709ZM10.0254 12.6073L10.4897 13.1962L10.0254 12.6073ZM6.43872 12.0183C5.41345 11.21 4.33627 10.4524 3.47904 9.48717C2.64752 8.55085 2.08325 7.47831 2.08325 6.0914H0.583252C0.583252 7.94644 1.3588 9.35867 2.35747 10.4832C3.33043 11.5788 4.57383 12.4582 5.51009 13.1962L6.43872 12.0183ZM2.08325 6.0914C2.08325 4.75102 2.84027 3.63995 3.85342 3.17683C4.81929 2.73533 6.15155 2.82823 7.45955 4.18719L8.54028 3.14699C6.84839 1.38917 4.84732 1.07324 3.22983 1.8126C1.65962 2.53035 0.583252 4.18982 0.583252 6.0914H2.08325ZM5.51009 13.1962C5.84928 13.4636 6.22932 13.7618 6.61834 13.9891C7.00711 14.2163 7.47619 14.4167 7.99992 14.4167V12.9167C7.85698 12.9167 7.65939 12.8601 7.37512 12.694C7.0911 12.5281 6.79171 12.2965 6.43872 12.0183L5.51009 13.1962ZM10.4897 13.1962C11.426 12.4582 12.6694 11.5788 13.6424 10.4832C14.641 9.35867 15.4166 7.94644 15.4166 6.0914H13.9166C13.9166 7.47831 13.3523 8.55085 12.5208 9.48717C11.6636 10.4524 10.5864 11.21 9.56112 12.0183L10.4897 13.1962ZM15.4166 6.0914C15.4166 4.18982 14.3402 2.53035 12.77 1.8126C11.1525 1.07324 9.15145 1.38917 7.45955 3.14699L8.54028 4.18719C9.84828 2.82823 11.1805 2.73533 12.1464 3.17683C13.1596 3.63995 13.9166 4.75102 13.9166 6.0914H15.4166ZM9.56112 12.0183C9.20813 12.2965 8.90874 12.5281 8.62471 12.694C8.34044 12.8601 8.14285 12.9167 7.99992 12.9167V14.4167C8.52365 14.4167 8.99273 14.2163 9.3815 13.9891C9.77052 13.7618 10.1506 13.4636 10.4897 13.1962L9.56112 12.0183Z"
                        fill=""
                      />
                    </svg>
                    Wishlist
                  </button>
                </li>

                <li className="py-4">
                  <button
                    onClick={openStyleHub}
                    className={`flex items-center gap-1.5 text-custom-sm font-light tracking-wide transition-colors duration-300 ${isTransparent ? "text-white hover:text-white/70" : "text-dark hover:text-dark-2"
                      }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Style Hub
                  </button>
                </li>
              </ul>
            </div>
            {/* <!--=== Nav Right End ===--> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
