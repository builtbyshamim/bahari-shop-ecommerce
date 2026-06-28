import { ProductCategory } from '@/types/product';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WishlistItem {
  id: string;
  name: string;
  sale_price: number;
  image?: string;
  without_discount_price?: number;
  rating?: number;
  slug?: string;
  category?: ProductCategory | null;
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.find((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.push({
          ...action.payload,
          sale_price: Number(action.payload.sale_price) || 0,
          without_discount_price: Number(action.payload.without_discount_price) || 0,
        });
      }
    },

    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.find((item) => item.id === action.payload.id);

      if (exists) {
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      } else {
        state.items.push({
          ...action.payload,
          sale_price: Number(action.payload.sale_price) || 0,
          without_discount_price: Number(action.payload.without_discount_price) || 0,
        });
      }
    },

    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const { addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
