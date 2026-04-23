import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCartApi,
  addCartItemApi,
  updateCartItemApi,
  removeCartItemApi,
  applyPromoApi,
  clearCartApi,
} from '../../api/cart.js';
// 监听 product 的增删改，让购物车里的商品快照保持最新
import {
  updateProduct as updateProductThunk,
  deleteProduct as deleteProductThunk,
} from '../product/productSlice.js';
import { extractError, isUserLoggedIn } from '../../utils/thunkUtils.js';

/**
 * 购物车 slice —— 仅支持登录用户
 * ------------------------------------------------------------------
 * 设计要点：
 *   - 所有购物车数据都在后端 MongoDB 里（符合 Phase III #2h/#3d 的 real api 路径）
 *   - 每个 thunk 就做两件事：调对应的 API，把返回的 cart 塞到 Redux state
 *   - 没登录的用户点 Add → thunk 返回 rejectWithValue，前端静默忽略
 *   - extractError / isUserLoggedIn 从 utils/thunkUtils.js 共用一份
 */

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { getState, rejectWithValue }) => {
    if (!isUserLoggedIn(getState())) return null; // 没登录 → 啥也不干
    try {
      const { data } = await getCartApi();
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product, quantity = 1 }, { getState, rejectWithValue }) => {
    if (!isUserLoggedIn(getState())) {
      return rejectWithValue('Please sign in to add items to cart');
    }
    // 库存校验（缺货/超库存一律拒绝）
    const stock = product?.inStockQuantity ?? 0;
    if (stock <= 0) return rejectWithValue('Product is out of stock');

    const existing = getState().cart.items.find(
      (it) => it.product?._id === product._id,
    );
    const nextQty = (existing?.quantity || 0) + quantity;
    if (nextQty > stock) return rejectWithValue(`Only ${stock} in stock`);

    try {
      const { data } = await addCartItemApi(product._id, quantity);
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ product, quantity }, { getState, rejectWithValue }) => {
    if (!isUserLoggedIn(getState())) return rejectWithValue('Please sign in');
    // quantity=0 表示移除，不校验库存
    const stock = product?.inStockQuantity ?? 0;
    if (quantity > 0 && quantity > stock) {
      return rejectWithValue(`Only ${stock} in stock`);
    }
    try {
      const { data } = await updateCartItemApi(product._id, quantity);
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ product }, { getState, rejectWithValue }) => {
    if (!isUserLoggedIn(getState())) return rejectWithValue('Please sign in');
    try {
      const { data } = await removeCartItemApi(product._id);
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const applyPromo = createAsyncThunk(
  'cart/applyPromo',
  async (code, { getState, rejectWithValue }) => {
    if (!isUserLoggedIn(getState())) return rejectWithValue('Please sign in');
    try {
      const { data } = await applyPromoApi(code);
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState, rejectWithValue }) => {
    if (!isUserLoggedIn(getState())) return rejectWithValue('Please sign in');
    try {
      const { data } = await clearCartApi();
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

// 初始状态一律为空，用户登录之后由 fetchCart 拉服务端数据填进来
const initialState = {
  items: [],
  discountCode: '',
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
  status: 'idle',
  error: null,
  drawerOpen: false,
};

// 服务端返回的 cart 直接覆盖到 state，对所有 thunk 通用
const replaceFromServer = (state, payload) => {
  state.items = payload.items || [];
  state.discountCode = payload.discountCode || '';
  state.subtotal = payload.subtotal || 0;
  state.tax = payload.tax || 0;
  state.discount = payload.discount || 0;
  state.total = payload.total || 0;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    openDrawer: (s) => {
      s.drawerOpen = true;
    },
    closeDrawer: (s) => {
      s.drawerOpen = false;
    },
    // 退出登录时清空购物车（authSlice 的 logout 之后会 dispatch 它）
    resetCart: (s) => {
      s.items = [];
      s.discountCode = '';
      s.subtotal = 0;
      s.tax = 0;
      s.discount = 0;
      s.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        if (payload) replaceFromServer(state, payload);
      })
      .addCase(addToCart.fulfilled, (state, { payload }) => {
        replaceFromServer(state, payload);
      })
      .addCase(updateCartItem.fulfilled, (state, { payload }) => {
        replaceFromServer(state, payload);
      })
      .addCase(removeFromCart.fulfilled, (state, { payload }) => {
        replaceFromServer(state, payload);
      })
      .addCase(applyPromo.fulfilled, (state, { payload }) => {
        replaceFromServer(state, payload);
      })
      .addCase(applyPromo.rejected, (state, { payload }) => {
        state.error = payload;
      })
      .addCase(clearCart.fulfilled, (state, { payload }) => {
        replaceFromServer(state, payload);
      })
      // 管理员改了商品 → 把购物车里对应商品的快照更新（保持名字/价格/图片最新）
      .addCase(updateProductThunk.fulfilled, (state, { payload }) => {
        if (!payload?._id) return;
        state.items.forEach((it) => {
          if (it.product?._id === payload._id) it.product = payload;
        });
      })
      // 商品被删了 → 从购物车里剔除
      .addCase(deleteProductThunk.fulfilled, (state, { payload: id }) => {
        state.items = state.items.filter((it) => it.product?._id !== id);
      });
  },
});

export const { openDrawer, closeDrawer, resetCart } = cartSlice.actions;

// 购物车里总数量（给 Header 的红色小数字用）
export const selectCartCount = (state) =>
  state.cart.items.reduce((n, it) => n + it.quantity, 0);

// 某个商品在购物车里的数量（给商品卡 / 详情页用）
export const selectCartQuantityFor = (productId) => (state) =>
  state.cart.items.find((it) => it.product._id === productId)?.quantity || 0;

export default cartSlice.reducer;
