import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductCreate, ProductUpdate, fetchProducts, createProduct, updateProduct, deleteProduct } from './productsAPI';

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
};

export const getProducts = createAsyncThunk('products/fetchAll', async (business_id: number) => {
  return await fetchProducts(business_id);
});

export const addProduct = createAsyncThunk('products/create', async (data: ProductCreate) => {
  return await createProduct(data);
});

export const editProduct = createAsyncThunk('products/update', async ({ id, data }: { id: number; data: ProductUpdate }) => {
  return await updateProduct(id, data);
});

export const removeProduct = createAsyncThunk('products/delete', async (id: number) => {
  return await deleteProduct(id);
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(addProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.products.push(action.payload);
      })
      .addCase(editProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        const idx = state.products.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.products[idx] = action.payload;
      })
      .addCase(removeProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.products = state.products.filter(p => p.id !== action.payload.id);
      });
  },
});

export default productsSlice.reducer; 