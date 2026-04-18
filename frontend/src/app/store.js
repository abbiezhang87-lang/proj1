import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice.js';

export const store = configureStore({
    reducer: {
        auth: authReducer, // 这里的 key 名决定了你以后怎么拿数据，比如 state.auth.isAdmin
    },
});