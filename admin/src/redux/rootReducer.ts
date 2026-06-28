import { persistReducer } from "redux-persist";
import { baseApi } from "./api/baseApi.ts";
import storage from "redux-persist/lib/storage";
import toggleSlice from "./features/toggleSlice.ts";
import cartSlice from "./features/cartSlice.ts";
const makePersistConfig = (key:any) => ({
    key,
    storage,
});

const persistedToggleSlice = persistReducer(makePersistConfig("toggle"), toggleSlice);
const persistedCartSlice = persistReducer(makePersistConfig("toggle"), cartSlice);


export const reducer = {
    [baseApi.reducerPath]: baseApi.reducer,
    toggle: persistedToggleSlice,
    carts: persistedCartSlice,

};