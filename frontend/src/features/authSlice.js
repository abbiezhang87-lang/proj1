import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn: false, // signedIn
    isAdmin: false,
    user: null         // 额外存储用户信息
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // TOGGLE_SIGN_IN
        toggleSignIn: (state) => {
            state.isLoggedIn = !state.isLoggedIn;
        },

        // 现代标准通常在登录成功后一次性设置所有信息
        setCredentials: (state, action) => {
            const { user, isAdmin } = action.payload;
            state.isLoggedIn = true;
            state.user = user;
            state.isAdmin = isAdmin;
        },

        // 登出逻辑
        logout: (state) => {
            state.isLoggedIn = false;
            state.isAdmin = false;
            state.user = null;
            localStorage.removeItem('token');
        }
    }
});

// 导出 Actions 给组件使用 (dispatch用)
export const { toggleSignIn, setCredentials, logout } = authSlice.actions;

// 导出 Reducer 给 store 使用
export default authSlice.reducer;