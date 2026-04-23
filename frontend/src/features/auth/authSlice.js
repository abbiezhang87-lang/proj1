import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInApi,
  signUpApi,
  requestPasswordResetApi,
  confirmPasswordResetApi,
  meApi,
} from '../../api/auth.js';
import { extractError } from '../../utils/thunkUtils.js';

/**
 * authSlice — keeps the logged-in user + token in Redux and localStorage.
 *
 * Requirement (Phase III #1f): on page refresh, user info must persist.
 * We read from localStorage on init and also expose fetchMe() so a valid
 * token re-fetches the user from the server on app bootstrap.
 */

const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
})();
const storedToken = localStorage.getItem('token') || null;

const initialState = {
  user: storedUser,
  token: storedToken,
  isLoggedIn: Boolean(storedToken && storedUser),
  isAdmin: Boolean(storedUser?.isAdmin),
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await signInApi(payload);
      return data; // { user, token, message }
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await signUpApi(payload);
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

// step 1：登录态下发 magic link 邮件
// payload 可以是 { email } 或 undefined —— 后端只认 req.user，email 只是二次确认
export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await requestPasswordResetApi(payload);
      return data; // { message, email }
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

// step 2：用户点邮件链接 → 落地页里填新密码 + 确认 → 提交
// 成功则后端返回 { user, token }，自动登录
export const confirmPasswordReset = createAsyncThunk(
  'auth/confirmPasswordReset',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await confirmPasswordResetApi({ token, newPassword });
      return data; // { user, token, message }
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

/**
 * Hydrate on app boot: if token exists, re-fetch current user.
 */
export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      if (!token) return null;
      const { data } = await meApi();
      return data; // { user }
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.isAdmin = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Shared "we just got {user, token}" handler for signIn + signUp + updatePassword
    const handleAuthed = (state, { payload }) => {
      state.status = 'succeeded';
      state.error = null;
      if (payload?.user) {
        state.user = payload.user;
        state.isAdmin = Boolean(payload.user.isAdmin);
        localStorage.setItem('user', JSON.stringify(payload.user));
      }
      if (payload?.token) {
        state.token = payload.token;
        localStorage.setItem('token', payload.token);
      }
      state.isLoggedIn = Boolean(state.token && state.user);
    };

    builder
      .addCase(signIn.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signIn.fulfilled, handleAuthed)
      .addCase(signIn.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload;
      })

      .addCase(signUp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signUp.fulfilled, handleAuthed)
      .addCase(signUp.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload;
      })

      // 发 magic link：只 loading / success / fail，不碰 user/token
      .addCase(requestPasswordReset.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(requestPasswordReset.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload;
      })

      // 确认 magic link：成功就登录
      .addCase(confirmPasswordReset.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(confirmPasswordReset.fulfilled, handleAuthed)
      .addCase(confirmPasswordReset.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload;
      })

      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        if (payload?.user) {
          state.user = payload.user;
          state.isAdmin = Boolean(payload.user.isAdmin);
          state.isLoggedIn = true;
          localStorage.setItem('user', JSON.stringify(payload.user));
        }
      })
      .addCase(fetchMe.rejected, (state) => {
        // Token was bad — wipe it
        state.user = null;
        state.token = null;
        state.isLoggedIn = false;
        state.isAdmin = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
