"use client";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCurrentUser } from "@/app/context/AuthContext";
import { AppDispatch, RootState } from "@/redux/store";
import { setWishlistItems, removeAllItemsFromWishlist } from "@/redux/features/wishlist-slice";

/**
 * Automatically rehydrates wishlist (and cart) from Supabase on login.
 * Place this hook once in a top-level client layout.
 * On logout, clears the Redux wishlist.
 */
export function useAuthRehydrate() {
    const { user } = useCurrentUser();
    const dispatch = useDispatch<AppDispatch>();
    const loaded = useSelector((state: RootState) => state.wishlistReducer.loaded);
    const prevUserId = useRef<string | null>(null);

    useEffect(() => {
        const uid = user?.id ?? null;

        // User logged out → clear wishlist
        if (!uid && prevUserId.current) {
            dispatch(removeAllItemsFromWishlist());
            prevUserId.current = null;
            return;
        }

        // No user or already loaded for this user
        if (!uid || (loaded && prevUserId.current === uid)) return;

        prevUserId.current = uid;

        // Fetch wishlist from DB → dispatch setWishlistItems
        (async () => {
            try {
                const { getWishlist } = await import("@/lib/queries/wishlist");
                const items = await getWishlist();
                dispatch(
                    setWishlistItems(
                        items.map((w: any) => ({
                            id: w.id,
                            item_id: w.item_id ?? w.product_id ?? w.collection_id ?? "",
                            item_type: w.item_type ?? "product",
                            created_at: w.created_at ?? new Date().toISOString(),
                            title: w.products?.name ?? w.collections?.name,
                            price: w.products?.price,
                            discountedPrice: w.products?.discounted_price,
                            brand: w.products?.brand,
                            imageUrl: w.products?.product_images?.[0]?.url,
                            collectionName: w.collections?.name,
                            collectionSlug: w.collections?.slug,
                            coverImage: w.collections?.thumbnail_url,
                        }))
                    )
                );
            } catch (err) {
                console.error("[useAuthRehydrate] Failed to load wishlist:", err);
            }
        })();

        // Fetch cart from DB → dispatch setCartItems (if the slice supports it)
        (async () => {
            try {
                const { getCartItems } = await import("@/lib/queries/cart");
                const cartItems = await getCartItems();
                // Cart rehydration: dispatch each item to cart-slice
                // This is a best-effort sync — if the slice doesn't support bulk set, individual add is fine
                const { addItemToCart } = await import("@/redux/features/cart-slice");
                for (const item of cartItems) {
                    if (item.products) {
                        const images = (item.products.product_images ?? []).sort(
                            (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
                        );
                        const imageUrls = images.map((img: any) => img.url);
                        dispatch(
                            addItemToCart({
                                id: item.product_id,
                                title: item.products.name,
                                price: item.products.price,
                                discountedPrice: item.products.discounted_price ?? item.products.price,
                                quantity: item.quantity,
                                imgs: {
                                    previews: imageUrls,
                                    thumbnails: imageUrls,
                                },
                            })
                        );
                    }
                }
            } catch (err) {
                console.error("[useAuthRehydrate] Failed to load cart:", err);
            }
        })();
    }, [user, loaded, dispatch]);
}
