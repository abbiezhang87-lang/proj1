import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCartApi,
  addCartItemApi,
  updateCartItemApi,
  removeCartItemApi,
  applyPromoApi,
  clearCartApi,
} from '../../api/cart.js';

import {
  updateProduct as updateProductThunk,
  deleteProduct as deleteProductThunk,
} from '../product/productSlice.js';



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


export const syncCartAfterProductChange = createAsyncThunk(
  'cart/syncCartAfterProductChange',
  async (product, { dispatch, rejectWithValue }) => {
    try {
   
      if (isLoggedIn()) {
        await dispatch(fetchCart());
        return { handled: true };
      }
   
      return { guest: true, product };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product, quantity = 1 }, { getState, rejectWithValue }) => {

    const stock = product?.inStockQuantity ?? 0;
    if (stock <= 0) {
      return rejectWithValue('Product is out of stock');
    }
    const existing = getState().cart.items.find(
      (it) => it.product?._id === product._id,
    );
    const nextQty = (existing?.quantity || 0) + quantity;
    if (nextQty > stock) {
      return rejectWithValue(`Only ${stock} in stock`);
    }
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
    
    const stock = product?.inStockQuantity ?? 0;
    if (quantity > 0 && quantity > stock) {
      return rejectWithValue(`Only ${stock} in stock`);
    }
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
        if (!payload) return; 
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

 
      .addCase(updateProductThunk.fulfilled, (state, { payload }) => {
        if (!payload?._id) return;
        let changed = false;
        state.items.forEach((it) => {
          if (it.product?._id === payload._id) {
            it.product = payload; 
            changed = true;
          }
        });
        
        if (changed && !isLoggedIn()) recomputeGuestCart(state);
      })

      
      .addCase(deleteProductThunk.fulfilled, (state, { payload: id }) => {
        const before = state.items.length;
        state.items = state.items.filter((it) => it.product?._id !== id);
        if (state.items.length !== before && !isLoggedIn()) {
          recomputeGuestCart(state);
        }
      })

    
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


export const selectCartCount = (state) =>
  state.cart.items.reduce((n, it) => n + it.quantity, 0);
export const selectCartQuantityFor = (productId) => (state) =>
  state.cart.items.find((it) => it.product._id === productId)?.quantity || 0;

export default cartSlice.reducer;
