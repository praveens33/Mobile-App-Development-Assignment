import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice.ts';
import authReducer from './authSlice.ts';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
  },
});