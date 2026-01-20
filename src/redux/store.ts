/* eslint-disable @typescript-eslint/no-unused-vars */
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice"; // Import your auth slice
// import conversationReducer from "./features/conversation/conversationSlice";

import { baseApi } from "./api/baseApi";
import { persistStore, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// Handle storage creation for SSR (Server-Side Rendering)
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

// Use appropriate storage based on SSR or browser
const storage =
  typeof window === "undefined"
    ? createNoopStorage()
    : createWebStorage("local");

// Configuration for persisting only the auth state (accessToken)
const persistConfig = {
  key: "pianofesta",
  storage,
  whitelist: ["auth"], // Persist only the `auth` slice (for accessToken)
  blacklist: ["baseApi"], // Do not persist the `baseApi` slice
};

// Combine reducers (add `baseApi` and `auth` reducers)
const rootReducer = {
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer, // Persisted auth reducer
  // conversation: conversationReducer,
};

// Create persisted reducer for the auth slice
const persistedAuthReducer = persistReducer(
  persistConfig,
  combineReducers(rootReducer),
);

// Configure the Redux store with persisted reducer and middleware for API
export const store = configureStore({
  reducer: persistedAuthReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware), // Add `baseApi` middleware
});

// Create persistor for Redux store persistence
export const persistor = persistStore(store);

// Define RootState type to infer the store's state shape
export type RootState = ReturnType<typeof store.getState>;

// Define AppDispatch type for dispatching actions in the app
export type AppDispatch = typeof store.dispatch;
