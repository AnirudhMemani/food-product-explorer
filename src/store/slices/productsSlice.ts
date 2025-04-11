import { foodProductsApi } from "@/services/api";
import { Product } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalProducts: number;
  currentPage: number;
  searchQuery: string;
  selectedCategories: string[];
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
  totalProducts: 0,
  currentPage: 1,
  searchQuery: "",
  selectedCategories: [],
};

export const searchProducts = createAsyncThunk(
  "products/searchProducts",
  async ({ query, page = 1 }: { query: string; page?: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const effectivePage = page || state.products.currentPage;

      const response = await foodProductsApi.searchProducts(query, effectivePage);
      return {
        products: response.products || [],
        count: response.count || 0,
        page: effectivePage,
        query,
      };
    } catch (error) {
      return rejectWithValue("Failed to search products. Please try again later.");
    }
  },
);

export const getProductsByCategory = createAsyncThunk(
  "products/getProductsByCategory",
  async ({ category, page = 1 }: { category: string; page?: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const effectivePage = page || state.products.currentPage;

      const response = await foodProductsApi.getProductByCategory(category);

      return {
        products: response.products || [],
        count: response.count || 0,
        page: effectivePage,
        category,
      };
    } catch (error) {
      return rejectWithValue(`Failed to fetch products in category "${category}". Please try again later.`);
    }
  },
);

export const getProductsByCategories = createAsyncThunk(
  "products/getProductsByCategories",
  async ({ categories, page = 1 }: { categories: string[]; page?: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const effectivePage = page || state.products.currentPage;

      const requests = categories.map((category) => foodProductsApi.getProductByCategory(category, effectivePage));

      const responses = await Promise.all(requests);

      const allProducts = responses.flatMap((response) => response.products || []);
      const uniqueProducts = Array.from(new Map(allProducts.map((product) => [product._id, product])).values());

      const totalCount = responses.reduce((sum, response) => sum + (response.count || 0), 0);

      return {
        products: uniqueProducts,
        count: totalCount,
        page: effectivePage,
        categories,
      };
    } catch (error) {
      return rejectWithValue(`Failed to fetch products in selected categories. Please try again later.`);
    }
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearFilters: (state) => {
      state.products = [];
      state.searchQuery = "";
      state.selectedCategories = [];
      state.currentPage = 1;
      state.totalProducts = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search products
      .addCase(searchProducts.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        const payload = action.meta.arg;
        if (payload.page === 1 || !payload.page) {
          state.products = [];
        }
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        const { products, count, page, query } = action.payload;
        if (page === 1) {
          state.products = products;
        } else {
          state.products = [...state.products, ...products];
        }
        state.totalProducts = count;
        state.currentPage = page;
        state.searchQuery = query;
        state.selectedCategories = [];
        state.loading = false;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getProductsByCategory.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        const payload = action.meta.arg;
        if (payload.page === 1 || !payload.page) {
          state.products = [];
        }
      })
      .addCase(getProductsByCategory.fulfilled, (state, action) => {
        const { products, count, page, category } = action.payload;
        if (page === 1) {
          state.products = products;
        } else {
          state.products = [...state.products, ...products];
        }
        state.totalProducts = count;
        state.currentPage = page;
        state.selectedCategories.push(category);
        state.searchQuery = "";
        state.loading = false;
      })
      .addCase(getProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getProductsByCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsByCategories.fulfilled, (state, action) => {
        const { products, count, page, categories } = action.payload;

        if (page === 1) {
          state.products = products;
        } else {
          const existingIds = new Set(state.products.map((p) => p._id));
          const newProducts = products.filter((p) => !existingIds.has(p._id));
          state.products = [...state.products, ...newProducts];
        }

        state.totalProducts = count;
        state.currentPage = page;
        state.selectedCategories = categories;
        state.loading = false;
      })
      .addCase(getProductsByCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFilters } = productsSlice.actions;
export default productsSlice.reducer;
