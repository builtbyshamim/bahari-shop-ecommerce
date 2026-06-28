import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import cartSlice from './features/cartSlice';
import servicesSlice from './features/servicesSlice';
import categorySlice from './features/categorySlice';
import cartReducer from './features/cartSlice';
import wishlistSlice from './features/wishlistSlice';
import toggleReducer from './features/toggleSlice';

import { baseApi } from './baseApi';
const makePersistConfig = (key: string) => ({
  key,
  storage,
});

const persistedCartSlice = persistReducer(makePersistConfig('toggle'), cartSlice);

const persistedServicesSlice = persistReducer(makePersistConfig('services'), servicesSlice);
const persistedActivateCategory = persistReducer(makePersistConfig('services'), categorySlice);
const persistedCartReducer = persistReducer(makePersistConfig('cart'), cartReducer);
const persistedWishlistReducer = persistReducer(makePersistConfig('wishlist'), wishlistSlice);

export const reducer = {
  [baseApi.reducerPath]: baseApi.reducer,
  carts: persistedCartSlice,
  cart: persistedCartReducer,
  wishlist: persistedWishlistReducer,
  sidebarToggle: toggleReducer,
  service: persistedServicesSlice,
  categoryStatus: persistedActivateCategory,
};
