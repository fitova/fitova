"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { tracking } from "@/lib/queries/tracking";
import { useCurrentUser } from "@/app/context/AuthContext";
import { getRelatedProducts } from "@/lib/queries/products";
import { mapProductFromDB } from "@/types/product";

/* ─── Breadcrumb ──────────────────────────────────────────── */
const Crumb = ({ label, href }: { label: string; href?: string }) =>
  href ? (
    <Link
      href={href}
      className="text-xs font-light tracking-[0.15em] uppercase hover:text-dark transition-colors duration-200"
      style={{ color: "#8A8A8A" }}
    >
      {label}
    </Link>
  ) : (
    <span
      className="text-xs font-light tracking-[0.15em] uppercase"
      style={{ color: "#0A0A0A" }}
    >
      {label}
    </span>
  );

/* ─── Star rating ─────────────────────────────────────────── */
const StarRating = ({ count }: { count: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} width="12" height="12" viewBox="0 0 18 18" fill="none">
        <path
          d="M16.79 6.72L11.7 5.93 9.39 1.1a.83.83 0 00-1.48 0L5.6 5.93l-5.06.79a.84.84 0 00-.47 1.43l3.68 3.79-.87 5.32a.84.84 0 001.23.88L9 15.7l4.55 2.44a.84.84 0 001.23-.88l-.87-5.32 3.68-3.79a.84.84 0 00-.78-1.43z"
          fill={s <= Math.round(count / Math.max(count, 1) * 5) ? "#C8A97E" : "#E8E4DF"}
        />
      </svg>
    ))}
    <span className="text-xs font-light ml-1" style={{ color: "#8A8A8A" }}>
      ({count})
    </span>
  </div>
);

/* ─── Related product mini card ──────────────────────────── */
const RelatedCard = ({ item }: { item: any }) => {
  const imgs = item.product_images ?? [];
  const sorted = [...imgs].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  const imgUrl = sorted[0]?.url ?? "/images/products/product-1-bg-1.png";
  const price = item.discounted_price ?? item.price;
  const wasPrice = item.discounted_price ? item.price : null;

  return (
    <Link href="/shop-details" className="block group">
      <div
        className="relative overflow-hidden mb-3"
        style={{ aspectRatio: "3/4", backgroundColor: "#F6F5F2" }}
      >
        <Image
          src={imgUrl}
          alt={item.name}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <p className="text-xs font-light tracking-[0.1em] uppercase mb-0.5" style={{ color: "#8A8A8A" }}>
        {item.brand || "Fitova"}
      </p>
      <h4 className="font-light text-sm text-dark leading-snug mb-1 truncate">{item.name}</h4>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-dark">SAR {price}</span>
        {wasPrice && (
          <span className="text-xs line-through" style={{ color: "#B0A99A" }}>
            SAR {wasPrice}
          </span>
        )}
      </div>
    </Link>
  );
};

/* ─── Loading skeleton ────────────────────────────────────── */
const Skeleton = () => (
  <div className="animate-pulse">
    <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
      <div className="lg:w-[52%]">
        <div className="w-full bg-gray-200" style={{ aspectRatio: "3/4" }} />
      </div>
      <div className="lg:w-[48%] space-y-4 pt-4">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-3/4 bg-gray-200 rounded" />
        <div className="h-5 w-1/3 bg-gray-200 rounded" />
        <div className="h-px w-full bg-gray-200" />
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 rounded" />
        <div className="h-12 w-full bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

/* ─── Tab content ─────────────────────────────────────────── */
const Tabs = ({ product }: { product: any }) => {
  const [tab, setTab] = useState<"description" | "details" | "reviews">("description");
  const tabs = [
    { id: "description" as const, label: "Description" },
    { id: "details" as const, label: "Details" },
    { id: "reviews" as const, label: "Reviews" },
  ];

  return (
    <div className="mt-14 border-t" style={{ borderColor: "#E8E4DF" }}>
      {/* Tab nav */}
      <div className="flex gap-8 mt-0 border-b" style={{ borderColor: "#E8E4DF" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`py-4 text-xs font-light tracking-[0.2em] uppercase border-b-[1.5px] -mb-px transition-colors duration-200 ${tab === t.id
                ? "border-dark text-dark"
                : "border-transparent hover:text-dark"
              }`}
            style={{ color: tab === t.id ? "#0A0A0A" : "#8A8A8A" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab body */}
      <div className="py-8">
        {tab === "description" && (
          <div className="max-w-2xl">
            {product.description ? (
              <p className="font-light leading-relaxed text-sm" style={{ color: "#4A4A4A" }}>
                {product.description}
              </p>
            ) : (
              <p className="font-light text-sm italic" style={{ color: "#8A8A8A" }}>
                No description available for this product.
              </p>
            )}
          </div>
        )}

        {tab === "details" && (
          <div className="max-w-lg space-y-3">
            {[
              { label: "Brand", value: product.brand },
              { label: "Material", value: product.material },
              { label: "Season", value: product.season },
              { label: "Type", value: product.piece_type },
              { label: "Gender", value: product.gender ? product.gender.charAt(0).toUpperCase() + product.gender.slice(1) : null },
              { label: "Tags", value: product.tags?.join(", ") },
            ]
              .filter((r) => r.value)
              .map((row) => (
                <div
                  key={row.label}
                  className="flex py-3 border-b"
                  style={{ borderColor: "#E8E4DF" }}
                >
                  <span
                    className="w-32 text-xs font-light tracking-[0.15em] uppercase flex-shrink-0"
                    style={{ color: "#8A8A8A" }}
                  >
                    {row.label}
                  </span>
                  <span className="text-sm font-light text-dark">{row.value}</span>
                </div>
              ))}
          </div>
        )}

        {tab === "reviews" && (
          <div>
            {product.product_reviews?.length ? (
              <div className="space-y-6 max-w-2xl">
                {product.product_reviews.map((r: any) => (
                  <div key={r.id} className="border-b pb-6" style={{ borderColor: "#E8E4DF" }}>
                    <StarRating count={r.rating} />
                    <p className="mt-2 text-sm font-light leading-relaxed" style={{ color: "#4A4A4A" }}>
                      {r.comment ?? "—"}
                    </p>
                    <span className="text-xs" style={{ color: "#B0A99A" }}>
                      {new Date(r.created_at).toLocaleDateString("en-GB", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-light italic" style={{ color: "#8A8A8A" }}>
                No reviews yet. Be the first to share your thoughts.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────── */
const ShopDetails = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useCurrentUser();

  /* ------------- Product from Redux / localStorage ---------- */
  const productFromRedux = useAppSelector((state) => state.productDetailsReducer.value);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fromStorage = typeof window !== "undefined"
      ? localStorage.getItem("productDetails")
      : null;
    const raw = fromStorage ? JSON.parse(fromStorage) : productFromRedux;
    if (raw && raw.id) {
      setProduct(raw);
      localStorage.setItem("productDetails", JSON.stringify(raw));
    }
    setLoading(false);
  }, [productFromRedux]);

  /* ------------- Track view --------------------------------- */
  useEffect(() => {
    if (product?.id) {
      tracking.trackProductView(product.id, user?.id);
    }
  }, [product, user]);

  /* ------------- Gallery ------------------------------------ */
  const images: string[] = product?.imgs?.previews?.length
    ? product.imgs.previews
    : ["/images/products/product-1-bg-1.png"];
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => { setActiveImg(0); }, [product?.id]);

  /* ------------- Color / Size selectors --------------------- */
  const colors: string[] = product?.colors ?? [];
  const sizes: string[] = product?.size ?? [];
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [activeSize, setActiveSize] = useState<string | null>(null);
  useEffect(() => {
    setActiveColor(colors[0] ?? null);
    setActiveSize(sizes[0] ?? null);
  }, [product?.id]);

  /* ------------- Related products --------------------------- */
  const [related, setRelated] = useState<any[]>([]);
  useEffect(() => {
    if (!product?.category_id || !product?.id) return;
    getRelatedProducts(product.category_id, product.id, 6)
      .then((data) => setRelated(data))
      .catch(() => { });
  }, [product?.category_id, product?.id]);

  /* ------------- Actions ------------------------------------ */
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    dispatch(addItemToCart({ ...product, quantity: 1 }));
    if (product.id) tracking.trackCartEvent(product.id, user?.id, "add");
  }, [product, dispatch, user]);

  const handleWishlist = useCallback(() => {
    if (!product) return;
    dispatch(addItemToWishlist({ ...product, status: "available", quantity: 1 }));
  }, [product, dispatch]);

  const handleAffiliate = useCallback(() => {
    if (product?.id) tracking.trackAffiliateClick(product.id);
  }, [product]);

  /* ------------- Price logic -------------------------------- */
  const currentPrice = product?.discountedPrice ?? product?.price ?? 0;
  const originalPrice = product?.discountedPrice && product.discountedPrice !== product.price
    ? product.price
    : null;
  const hasDiscount = originalPrice !== null && originalPrice > currentPrice;

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <div style={{ backgroundColor: "#F6F5F2", minHeight: "100vh" }}>
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-8 xl:py-14">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-10">
          <Crumb label="Home" href="/" />
          <span style={{ color: "#C8BFB5" }}>›</span>
          <Crumb label="Shop" href="/shop-with-sidebar" />
          {product?.brand && (
            <>
              <span style={{ color: "#C8BFB5" }}>›</span>
              <Crumb label={product.brand} />
            </>
          )}
          <span style={{ color: "#C8BFB5" }}>›</span>
          <Crumb label={product?.title ?? "Product"} />
        </nav>

        {/* ───── Loading ───── */}
        {loading && <Skeleton />}

        {/* ───── Empty state ───── */}
        {!loading && !product && (
          <div className="flex flex-col items-center justify-center py-32">
            <p className="font-playfair text-2xl text-dark mb-4">No product selected</p>
            <Link
              href="/shop-with-sidebar"
              className="text-xs font-light tracking-[0.2em] uppercase border border-dark text-dark px-8 py-3 hover:bg-dark hover:text-white transition-colors duration-300"
            >
              Browse Collection
            </Link>
          </div>
        )}

        {/* ───── Main product layout ───── */}
        {!loading && product && (
          <>
            <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">

              {/* ── Left: Image Gallery ── */}
              <div className="lg:w-[52%]">
                {/* Main image */}
                <div
                  className="relative w-full overflow-hidden mb-4"
                  style={{ aspectRatio: "3/4", backgroundColor: "#EDEAE5" }}
                >
                  <Image
                    src={images[activeImg]}
                    alt={product.title}
                    fill
                    className="object-cover object-top"
                    priority
                  />
                  {hasDiscount && (
                    <span
                      className="absolute top-4 left-4 text-[10px] font-light tracking-[0.2em] uppercase px-3 py-1 bg-dark text-white"
                    >
                      Sale
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {images.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`relative overflow-hidden transition-all duration-200 ${i === activeImg
                            ? "ring-1 ring-dark ring-offset-1"
                            : "opacity-60 hover:opacity-100"
                          }`}
                        style={{ width: 72, height: 90, flexShrink: 0, backgroundColor: "#EDEAE5" }}
                      >
                        <Image src={src} alt={`View ${i + 1}`} fill className="object-cover object-top" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Right: Product Info ── */}
              <div className="lg:w-[48%] flex flex-col justify-start pt-0 lg:pt-2">

                {/* Brand eyebrow */}
                {product.brand && (
                  <span
                    className="block text-xs font-light tracking-[0.3em] uppercase mb-3"
                    style={{ color: "#8A8A8A" }}
                  >
                    {product.brand}
                  </span>
                )}

                {/* Title */}
                <h1
                  className="font-playfair font-normal text-3xl xl:text-4xl text-dark mb-4 leading-tight"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {product.title}
                </h1>

                {/* Reviews */}
                {product.reviews > 0 && (
                  <div className="mb-5">
                    <StarRating count={product.reviews} />
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-7">
                  <span className="text-2xl font-light text-dark">SAR {currentPrice}</span>
                  {hasDiscount && (
                    <span
                      className="text-base font-light line-through"
                      style={{ color: "#B0A99A" }}
                    >
                      SAR {originalPrice}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className="w-full h-px mb-7" style={{ backgroundColor: "#E8E4DF" }} />

                {/* Color selector */}
                {colors.length > 0 && (
                  <div className="mb-6">
                    <h4
                      className="text-xs font-light tracking-[0.2em] uppercase mb-3"
                      style={{ color: "#8A8A8A" }}
                    >
                      Color
                      {activeColor && (
                        <span className="ml-2 normal-case tracking-normal capitalize text-dark">
                          — {activeColor}
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-3 flex-wrap">
                      {colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setActiveColor(c)}
                          title={c}
                          className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${activeColor === c
                              ? "border-dark scale-110"
                              : "border-transparent hover:border-dark/40"
                            }`}
                          style={{ backgroundColor: c.toLowerCase() }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size selector */}
                {sizes.length > 0 && (
                  <div className="mb-8">
                    <h4
                      className="text-xs font-light tracking-[0.2em] uppercase mb-3"
                      style={{ color: "#8A8A8A" }}
                    >
                      Size
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setActiveSize(s)}
                          className={`px-4 py-2 text-xs font-light tracking-[0.1em] uppercase border transition-all duration-200 ${activeSize === s
                              ? "border-dark bg-dark text-white"
                              : "border-[#E8E4DF] text-dark hover:border-dark"
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  {/* Affiliate / Shop This Look */}
                  <a
                    href={product.affiliate_link || "#"}
                    target={product.affiliate_link ? "_blank" : "_self"}
                    rel="noreferrer"
                    onClick={handleAffiliate}
                    className="flex-1 flex items-center justify-center gap-2 py-4 text-xs font-light tracking-[0.2em] uppercase transition-all duration-300 bg-dark text-white hover:bg-dark/80"
                  >
                    Shop This Look
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>

                  {/* Wishlist */}
                  <button
                    onClick={handleWishlist}
                    className="flex items-center justify-center gap-2 px-6 py-4 text-xs font-light tracking-[0.2em] uppercase border border-dark text-dark hover:bg-dark hover:text-white transition-all duration-300"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.62 4.42C3.96 5.18 2.75 6.99 2.75 9.14c0 2.2.9 3.89 2.19 5.34C6 15.68 7.29 16.67 8.54 17.63c.3.23.6.46.89.69.53.41 1 .77 1.45 1.04.45.26.81.38 1.12.38s.67-.12 1.13-.38c.45-.26.92-.63 1.45-1.04.29-.23.58-.46.88-.69 1.25-.96 2.54-1.95 3.6-3.16 1.29-1.45 2.19-3.14 2.19-5.34 0-2.15-1.22-3.96-2.88-4.72-1.61-.74-3.78-.54-5.84 1.6a.75.75 0 01-1.1 0C9.4 3.88 7.24 3.68 5.62 4.42z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                    Wishlist
                  </button>
                </div>

                {/* Short description */}
                {product.description && (
                  <p
                    className="text-sm font-light leading-relaxed"
                    style={{ color: "#6A6561" }}
                  >
                    {product.description.length > 180
                      ? product.description.slice(0, 180) + "…"
                      : product.description}
                  </p>
                )}

                {/* Meta tags */}
                <div className="mt-7 pt-6 border-t space-y-2" style={{ borderColor: "#E8E4DF" }}>
                  {product.styles?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-light tracking-[0.15em] uppercase w-16" style={{ color: "#8A8A8A" }}>Style</span>
                      {product.styles.map((s: string) => (
                        <span key={s} className="text-xs font-light px-2 py-0.5 border border-[#E8E4DF] text-dark">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {product.tags?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-light tracking-[0.15em] uppercase w-16" style={{ color: "#8A8A8A" }}>Tags</span>
                      {product.tags.map((t: string) => (
                        <span key={t} className="text-xs font-light px-2 py-0.5 border border-[#E8E4DF] text-dark">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Tabs: Description / Details / Reviews ── */}
            <Tabs product={product} />

            {/* ── Related Products ── */}
            {related.length > 0 && (
              <section className="mt-16 pt-12 border-t" style={{ borderColor: "#E8E4DF" }}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span
                      className="block text-xs font-light tracking-[0.25em] uppercase mb-2"
                      style={{ color: "#8A8A8A" }}
                    >
                      You May Also Like
                    </span>
                    <h2
                      className="font-playfair font-normal text-2xl xl:text-3xl text-dark"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      Related Pieces
                    </h2>
                  </div>
                  <Link
                    href="/shop-with-sidebar"
                    className="hidden sm:inline-flex items-center gap-2 text-xs font-light tracking-[0.15em] uppercase border border-dark text-dark px-6 py-2.5 hover:bg-dark hover:text-white transition-colors duration-300"
                  >
                    View All
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>

                <Swiper
                  slidesPerView={2}
                  spaceBetween={16}
                  breakpoints={{
                    640: { slidesPerView: 3, spaceBetween: 20 },
                    1024: { slidesPerView: 4, spaceBetween: 24 },
                  }}
                >
                  {related.map((item) => (
                    <SwiperSlide key={item.id}>
                      <RelatedCard item={item} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopDetails;
