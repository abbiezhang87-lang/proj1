import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCartApi,
  addCartItemApi,
  updateCartItemApi,
  removeCartItemApi,
  applyPromoApi,
  clearCartApi,
} from '../../api/cart.js';
// 跨 slice 监听用：在 extraReducers 里引用 product thunk 的 action types
// 这样 product 被 edit/delete 时 cart 能自动同步（Chuwa 遗留 bug #1）
import {
  updateProduct as updateProductThunk,
  deleteProduct as deleteProductThunk,
} from '../product/productSlice.js';

/**
 * cartSlice — syncs with the server cart for logged-in users, and falls
 * back to a localStorage-backed cart when the user is anonymous.
 *
 * Requirement Phase III #2h + #3d: previous cart info must persist on
 * login AND on refresh. Shape returned by server is:
 *   { items, discountCode, subtotal, tax, discount, total }
 */

const extractError = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';

const LOCAL_KEY = 'guest_cart';

const readGuestCart = () => {
  try {
    return (
      JSON.parse(localStorage.getItem(LOCAL_KEY)) || {
        items: [],
        discountCode: '',
      }
    );
  } catch {
    return { items: [], discountCode: '' };
  }
};

const writeGuestCart = (cart) =>
  localStorage.setItem(
    LOCAL_KEY,
    JSON.stringify({ items: cart.items, discountCode: cart.discountCode || '' }),
  );

const isLoggedIn = () => Boolean(localStorage.getItem('token'));

/**
 * Reshape a guest cart (items stored as plain product snapshots) into the
 * same shape the backend returns, with totals computed client-side.
 */
const recomputeGuestCart = (state) => {
  const items = state.items;
  const subtotal = items.reduce(
    (s, it) => s + (it.product?.price || 0) * it.quantity,
    0,
  );
  const tax = +(subtotal * 0.1).toFixed(2);
  const promos = {
    '20 DOLLAR OFF': { type: 'fixed', value: 20 },
    WELCOME10: { type: 'percent', value: 0.1 },
  };
  const promo = promos[(state.discountCode || '').toUpperCase()];
  let discount = 0;
  if (promo) {
    discount =
      promo.type === 'fixed'
        ? Math.min(promo.value, subtotal)
        : +(subtotal * promo.value).toFixed(2);
  }
  state.subtotal = +subtotal.toFixed(2);
  state.tax = tax;
  state.discount = discount;
  state.total = +(subtotal + tax - discount).toFixed(2);
  writeGuestCart(state);
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    if (!isLoggedIn()) return null; // signal guest mode
    try {
      const { data } = await getCartApi();
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

/**
 * syncCartAfterProductChange —— 修复 Chuwa 遗留 bug #1：
 * "Product edit 没有触发 cart refresh (product 修改后检查 cart 是否有该
 *  商品存在则 refetch)"
 *
 * 使用场景：管理员改完商品价格/库存后，购物车里该商品的显示应该同步。
 * 策略：
 *  - 已登录：直接重新拉服务端 cart（服务端会用最新 product.price 算总价）
 *  - 游客：把 Redux 里 cart.items.product 的快照替换为最新版本，
 *          然后本地重算 subtotal/tax/total
 *
 * 传入的 product 是完整的新 product 文档（带 _id）；
 * 如果是删除，传 { _id, deleted: true } 让 reducer 知道要剔除。
 */
export const syncCartAfterProductChange = createAsyncThunk(
  'cart/syncCartAfterProductChange',
  async (product, { dispatch, getState, rejectWithValue }) => {
    try {
      // 登录用户：服务端已持有最新 product 价格，直接重新拉一次就够
      if (isLoggedIn()) {
        await dispatch(fetchCart());
        return { handled: true };
      }
      // 游客：返回 product 给 reducer，在本地同步快照
      return { guest: true, product };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product, quantity = 1 }, { rejectWithValue }) => {
    if (!isLoggedIn()) return { guest: true, product, quantity };
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
  async ({ product, quantity }, { rejectWithValue }) => {
    if (!isLoggedIn()) return { guest: true, product, quantity };
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
  async ({ product }, { rejectWithValue }) => {
    if (!isLoggedIn()) return { guest: true, product };
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
  async (code, { rejectWithValue }) => {
    if (!isLoggedIn()) return { guest: true, code };
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
  async (_, { rejectWithValue }) => {
    if (!isLoggedIn()) return { guest: true };
    try {
      const { data } = await clearCartApi();
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

const guestInit = readGuestCart();
const initialState = {
  items: guestInit.items || [],
  discountCode: guestInit.discountCode || '',
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
  status: 'idle',
  error: null,
  drawerOpen: false,
};

// Compute initial totals so the cart badge is correct on first paint
(() => {
  const s = initialState;
  const subtotal = s.items.reduce(
    (sum, it) => sum + (it.product?.price || 0) * it.quantity,
    0,
  );
  s.subtotal = +subtotal.toFixed(2);
  s.tax = +(subtotal * 0.1).toFixed(2);
  s.total = +(s.subtotal + s.tax).toFixed(2);
})();

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
    /**
     * Called by authSlice on logout — wipe the in-memory cart so a new
     * user isn't greeted with the previous user's items.
     */
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
        if (!payload) return; // guest — leave localStorage state alone
        replaceFromServer(state, payload);
      })
      .addCase(addToCart.fulfilled, (state, { payload }) => {
        if (payload?.guest) {
          const existing = state.items.find(
            (it) => it.product._id === payload.product._id,
          );
          if (existing) existing.quantity += payload.quantity;
          else
            state.items.push({
              product: payload.product,
              quantity: payload.quantity,
            });
          recomputeGuestCart(state);
          return;
        }
        replaceFromServer(state, payload);
      })
      .addCase(updateCartItem.fulfilled, (state, { payload }) => {
        if (payload?.guest) {
          if (payload.quantity <= 0) {
            state.items = state.items.filter(
              (it) => it.product._id !== payload.product._id,
            );
          } else {
            const it = state.items.find(
              (x) => x.product._id === payload.product._id,
            );
            if (it) it.quantity = payload.quantity;
          }
          recomputeGuestCart(state);
          return;
        }
        replaceFromServer(state, payload);
      })
      .addCase(removeFromCart.fulfilled, (state, { payload }) => {
        if (payload?.guest) {
          state.items = state.items.filter(
            (it) => it.product._id !== payload.product._id,
          );
          recomputeGuestCart(state);
          return;
        }
        replaceFromServer(state, payload);
      })
      .addCase(applyPromo.fulfilled, (state, { payload }) => {
        if (payload?.guest) {
          state.discountCode = (payload.code || '').toUpperCase();
          recomputeGuestCart(state);
          return;
        }
        replaceFromServer(state, payload);
      })
      .addCase(applyPromo.rejected, (state, { payload }) => {
        state.error = payload;
      })
      .addCase(clearCart.fulfilled, (state, { payload }) => {
        if (payload?.guest) {
          state.items = [];
          state.discountCode = '';
          recomputeGuestCart(state);
          return;
        }
        replaceFromServer(state, payload);
      })

      /**
       * 跨 slice 监听 —— 修复 Chuwa 遗留 bug #1
       * ----------------------------------------------------------------
       * 场景：管理员在 EditProduct 页面改了某个商品的名字/价格/图片
       * 后，购物车里那个商品还是旧价格旧图 —— 用户会困惑。
       *
       * 解决：product/updateProduct/fulfilled 触发时，在 cart 里找出
       * 同 _id 的 item，把 product 快照换成最新版本，并就地重算
       * 金额（仅游客；已登录用户由 syncCartAfterProductChange 发
       * fetchCart 从服务端重拉，服务端的 populate 会拿到最新 price）。
       */
      .addCase(updateProductThunk.fulfilled, (state, { payload }) => {
        if (!payload?._id) return;
        let changed = false;
        state.items.forEach((it) => {
          if (it.product?._id === payload._id) {
            it.product = payload; // 替换快照 —— 新 price / name / imageUrl
            changed = true;
          }
        });
        // 游客购物车在这里即时重算；登录用户会收到 fetchCart 的数据覆盖
        if (changed && !isLoggedIn()) recomputeGuestCart(state);
      })

      /**
       * product/deleteProduct/fulfilled：商品被删了，购物车里也要剔除 ——
       * 否则结算时后端 populate 会拿到 null，前端显示成 "$0.00 × n"。
       */
      .addCase(deleteProductThunk.fulfilled, (state, { payload: id }) => {
        const before = state.items.length;
        state.items = state.items.filter((it) => it.product?._id !== id);
        if (state.items.length !== before && !isLoggedIn()) {
          recomputeGuestCart(state);
        }
      })

      /**
       * syncCartAfterProductChange：显式触发的同步（组件可以主动 dispatch）
       * 登录用户走 fetchCart 分支，这里只处理游客 payload。
       */
      .addCase(syncCartAfterProductChange.fulfilled, (state, { payload }) => {
        if (payload?.guest && payload.product?._id) {
          const it = state.items.find(
            (x) => x.product?._id === payload.product._id,
          );
          if (it) {
            it.product = payload.product;
            recomputeGuestCart(state);
          }
        }
      });
  },
});

export const { openDrawer, closeDrawer, resetCart } = cartSlice.actions;

/**
 * Selector helpers.
 */
export const selectCartCount = (state) =>
  state.cart.items.reduce((n, it) => n + it.quantity, 0);
export const selectCartQuantityFor = (productId) => (state) =>
  state.cart.items.find((it) => it.product._id === productId)?.quantity || 0;

export default cartSlice.reducer;
