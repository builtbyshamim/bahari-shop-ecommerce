import { configureStore } from "@reduxjs/toolkit";
import { Persistor, persistStore } from "redux-persist";
import { baseApi } from "./baseApi";
import {reducer} from './rootReducer'

const isClient = typeof window !== "undefined";
export const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST"],
                ignoredActionPaths: ["register"],
                ignoredPaths: ["register"],
            },
        }).concat(baseApi.middleware),
});

export const persistor: Persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
