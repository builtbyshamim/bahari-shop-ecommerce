import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartProduct {
  product_id: string;
  image: string; 
  assigned_variant_price_id?: string;
  name: string;
  sale_price: number;
  without_discount_price: number;
  quantity: number;
  [key: string]: any;
}

interface CartState {
  products: CartProduct[];
  selectedItems: number;
  subTotal: number;
  discount: number;
  totalPrice: number;
  couponDiscount: number; // separated from product-level discount
}

const initialState: CartState = {
  products: [],
  selectedItems: 0,
  subTotal: 0,
  discount: 0,
  totalPrice: 0,
  couponDiscount: 0,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const isSameCartItem = (product: CartProduct, payload: Partial<CartProduct>) => {
  const sameProduct = product.product_id === payload.product_id;

  // If either has a variant, both must match on variant id
  if (product.assigned_variant_price_id || payload.assigned_variant_price_id) {
    return sameProduct && product.assigned_variant_price_id === payload.assigned_variant_price_id;
  }

  return sameProduct;
};

const recalculate = (state: CartState) => {
  const products = state.products;

  state.selectedItems = products.reduce((sum, p) => sum + p.quantity, 0);

  state.subTotal = products.reduce(
    (sum, p) => sum + p.without_discount_price * p.quantity,
    0
  );

  // Product-level discount (e.g. sale prices, markdowns)
  state.discount = products.reduce((sum, p) => {
    const discountPerItem = p.without_discount_price - p.sale_price;
    return sum + discountPerItem * p.quantity;
  }, 0);

  // Final price after product discounts and any coupon
  state.totalPrice = Math.max(
    0,
    products.reduce((sum, p) => sum + p.sale_price * p.quantity, 0) -
      state.couponDiscount
  );
};

// ─── Slice ───────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Partial<CartProduct> & { quantity?: number }>) => {
      const incomingQty = Math.max(0, parseFloat(String(action.payload.quantity)) || 1);
      const existingProduct = state.products.find((p) => isSameCartItem(p, action.payload));

      if (existingProduct) {
        existingProduct.quantity += incomingQty;
      } else {
        state.products.push({
          ...action.payload,
          quantity: incomingQty,
        } as CartProduct);
      }

      recalculate(state);
    },

    removeFromCart: (state, action: PayloadAction<{ index: number }>) => {
      state.products.splice(action.payload.index, 1);
      recalculate(state);
    },

    updateQuantity: (state, action: PayloadAction<{ index: number; quantity: number }>) => {
      const { index, quantity } = action.payload;
      const product = state.products[index];

      if (!product) return;

      const parsed = parseFloat(String(quantity));

      if (parsed <= 0 || isNaN(parsed)) {
        // Remove product if quantity dropped to 0 or below
        state.products.splice(index, 1);
      } else {
        product.quantity = parsed;
      }

      recalculate(state);
    },

    // Coupon / promo code discount — separated from product-level discount
    applyCoupon: (state, action: PayloadAction<number>) => {
      state.couponDiscount = Math.max(0, action.payload);
      recalculate(state);
    },

    removeCoupon: (state) => {
      state.couponDiscount = 0;
      recalculate(state);
    },

    clearCart: () => initialState, // ✅ Cleanest way to reset
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;