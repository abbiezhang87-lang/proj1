import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { placeOrderApi, getMyOrdersApi } from '../../api/order.js';
import { extractError, isUserLoggedIn } from '../../utils/thunkUtils.js';

/**
 * 订单 slice —— 额外功能（Order History）
 * ------------------------------------------------------------------
 * 设计要点：
 *   - 跟 cart 完全解耦：下单由 cartDrawer 触发 placeOrder thunk，
 *     该 thunk 成功后再由调用方自己 dispatch(clearCart/fetchCart)
 *   - 订单列表 orders 是全量列表（默认按时间倒序，来自后端）
 *   - 列表只在进 /orders 页时按需 fetch，不随应用启动就加载
 *   - extractError / isUserLoggedIn 从 utils/thunkUtils.js 共用一份
 */

export const placeOrder = createAsyncThunk(
  'order/placeOrder',
  async (_, { getState, rejectWithValue }) => {
    if (!isUserLoggedIn(getState())) {
      return rejectWithValue('Please sign in to place an order');
    }
    try {
      const { data } = await placeOrderApi();
      return data; // 新创建的订单
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const fetchMyOrders = createAsyncThunk(
  'order/fetchMyOrders',
  async (_, { getState, rejectWithValue }) => {
    if (!isUserLoggedIn(getState())) return [];
    try {
      const { data } = await getMyOrdersApi();
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

const initialState = {
  orders: [],        // 历史订单列表
  status: 'idle',    // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  placing: false,    // 下单专用 loading 标志
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // 退出登录时一并清空本地订单缓存（在 authSlice.logout 后调用）
    resetOrders: (s) => {
      s.orders = [];
      s.status = 'idle';
      s.error = null;
      s.placing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 下单
      .addCase(placeOrder.pending, (s) => {
        s.placing = true;
        s.error = null;
      })
      .addCase(placeOrder.fulfilled, (s, { payload }) => {
        s.placing = false;
        // 把新订单塞到列表最前面，这样从 cart 点完下单直接切到
        // Order History 页也能第一时间看到它
        if (payload) s.orders = [payload, ...s.orders];
      })
      .addCase(placeOrder.rejected, (s, { payload }) => {
        s.placing = false;
        s.error = payload || 'Failed to place order';
      })
      // 列表查询
      .addCase(fetchMyOrders.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (s, { payload }) => {
        s.status = 'succeeded';
        s.orders = payload || [];
      })
      .addCase(fetchMyOrders.rejected, (s, { payload }) => {
        s.status = 'failed';
        s.error = payload || 'Failed to load orders';
      });
  },
});

export const { resetOrders } = orderSlice.actions;

export default orderSlice.reducer;
