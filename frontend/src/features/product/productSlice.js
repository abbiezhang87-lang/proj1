import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listProductsApi,
  getProductApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from '../../api/product.js';
import { extractError } from '../../utils/thunkUtils.js';

/**
 * fetchProducts — paginated + search + sort. Replaces the whole list
 * each time so pagination math is authoritative server-side.
 */
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await listProductsApi(params);
      return data; // { items, total, page, pages, limit }
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getProductApi(id);
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await createProductApi(payload);
      return data.product;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await updateProductApi(id, payload);
      return data.product;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await deleteProductApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

const initialState = {
  items: [],
  total: 0,
  page: 1,
  pages: 1,
  limit: 10,
  q: '',
  sort: 'latest',
  current: null, // detail/edit page
  status: 'idle',
  error: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setQuery: (state, { payload }) => {
      state.q = payload ?? '';
      state.page = 1;
    },
    setSort: (state, { payload }) => {
      state.sort = payload || 'latest';
      state.page = 1;
    },
    setPage: (state, { payload }) => {
      state.page = payload || 1;
    },
    clearCurrent: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        state.items = payload.items || [];
        state.total = payload.total || 0;
        state.page = payload.page || 1;
        state.pages = payload.pages || 1;
        state.limit = payload.limit || state.limit;
      })
      .addCase(fetchProducts.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload;
      })

      .addCase(fetchProductById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.current = null;
      })
      .addCase(fetchProductById.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        state.current = payload;
      })
      .addCase(fetchProductById.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload;
      })

      .addCase(createProduct.fulfilled, (state, { payload }) => {
        // Phase III #2a: new product should appear immediately
        state.items.unshift(payload);
        state.total += 1;
      })

      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((p) => p._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
        if (state.current?._id === payload._id) state.current = payload;
      })

      .addCase(deleteProduct.fulfilled, (state, { payload: id }) => {
        state.items = state.items.filter((p) => p._id !== id);
        state.total = Math.max(0, state.total - 1);
      });
  },
});

export const { setQuery, setSort, setPage, clearCurrent } =
  productSlice.actions;
export default productSlice.reducer;
