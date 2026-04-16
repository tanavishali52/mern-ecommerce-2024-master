import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const initialState = {
  cartItems: { items: [] },
  isLoading: false,
  error: null,
};

// Configure axios defaults
const getConfig = () => ({
  withCredentials: true,
  headers: {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache"
  }
});

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/shop/cart/add`,
        { userId, productId, quantity },
        getConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to add item to cart"
      });
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/shop/cart/get/${userId}`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to fetch cart items"
      });
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/shop/cart/${userId}/${productId}`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to delete cart item"
      });
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, type }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/shop/cart/update-cart`,
        { userId, productId, type },
        getConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to update cart quantity"
      });
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cartItems = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to add item to cart";
      })

      // Fetch cart items
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch cart items";
        // Don't clear cart items on fetch error, keep existing state
      })

      // Delete cart item
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        state.error = null;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to delete cart item";
      })

      // Update cart quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        state.error = null;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to update cart quantity";
      });
  },
});

export const { clearCart, clearError } = cartSlice.actions;
export default cartSlice.reducer;