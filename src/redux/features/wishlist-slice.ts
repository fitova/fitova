import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ItemType } from "@/lib/queries/wishlist";
import { RootState } from "../store";

/* ─── Types ─────────────────────────────────────────────────── */
export type WishlistEntry = {
  id: string;          // wishlist row id
  item_id: string;     // product or collection id
  item_type: ItemType;
  created_at: string;

  // Product fields (populated when item_type === 'product')
  title?: string;
  itemSlug?: string;
  price?: number;
  discountedPrice?: number;
  brand?: string;
  imageUrl?: string;
  affiliateLink?: string;

  // Lookbook fields (populated when item_type === 'lookbook')
  collectionName?: string;
  collectionSlug?: string;
  coverImage?: string;
};

type WishlistState = {
  items: WishlistEntry[];
  loaded: boolean;
};

const initialState: WishlistState = {
  items: [],
  loaded: false,
};

/* ─── Slice ─────────────────────────────────────────────────── */
export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Replace full list (called on initial load from Supabase)
    setWishlistItems: (state, action: PayloadAction<WishlistEntry[]>) => {
      state.items = action.payload;
      state.loaded = true;
    },

    // Optimistic add
    addItemToWishlist: (state, action: PayloadAction<WishlistEntry>) => {
      const exists = state.items.some(
        i => i.item_id === action.payload.item_id && i.item_type === action.payload.item_type
      );
      if (!exists) state.items.unshift(action.payload);
    },

    // Optimistic remove
    removeItemFromWishlist: (
      state,
      action: PayloadAction<{ item_id: string; item_type: ItemType }>
    ) => {
      state.items = state.items.filter(
        i => !(i.item_id === action.payload.item_id && i.item_type === action.payload.item_type)
      );
    },

    removeAllItemsFromWishlist: (state) => {
      state.items = [];
      state.loaded = false;
    },
  },
});

export const {
  setWishlistItems,
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

/* ─── Selectors ─────────────────────────────────────────────── */
export const selectProductWishlist = (state: RootState) =>
  state.wishlistReducer.items.filter(i => i.item_type === "product");

export const selectLookbookWishlist = (state: RootState) =>
  state.wishlistReducer.items.filter(i => i.item_type === "lookbook");

export const selectIsWishlisted = (item_id: string, item_type: ItemType) =>
  (state: RootState) =>
    state.wishlistReducer.items.some(i => i.item_id === item_id && i.item_type === item_type);
