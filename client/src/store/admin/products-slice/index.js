import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const initialState = {
  isLoading: false,
  productList: [],
  error: null
};

export const addNewProduct = createAsyncThunk(
  "products/addNewProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const result = await axios.post(
        `${API_BASE_URL}/api/admin/products/add`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to add product" });
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const result = await axios.get(
        `${API_BASE_URL}/api/admin/products/get`
      );
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch products" });
    }
  }
);

export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const result = await axios.put(
        `${API_BASE_URL}/api/admin/products/edit/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to edit product" });
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const result = await axios.delete(
        `${API_BASE_URL}/api/admin/products/delete/${id}`
      );
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to delete product" });
    }
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add product
      .addCase(addNewProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.data) {
          state.productList = [action.payload.data, ...state.productList];
        }
        state.error = null;
      })
      .addCase(addNewProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Edit product
      .addCase(editProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedProduct = action.payload.data;
        const index = state.productList.findIndex(p => p._id === updatedProduct._id);
        if (index !== -1) {
          state.productList[index] = updatedProduct;
        }
        state.error = null;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = AdminProductsSlice.actions;
export default AdminProductsSlice.reducer;
