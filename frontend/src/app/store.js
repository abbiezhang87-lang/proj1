import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import productReducer from '../features/product/productSlice.js';
import cartReducer from '../features/cart/cartSlice.js';

/**
 * Single app-wide store. Shape:
 *   state.auth    — user + token + status
 *   state.product — list + current + pagination
 *   state.cart    — items, totals, drawer state
 */
export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        cart: cartReducer,
    },
});
