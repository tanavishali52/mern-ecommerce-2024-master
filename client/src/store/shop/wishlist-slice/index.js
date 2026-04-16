import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const initialState = {
  wishlistItems: [],
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

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/shop/wishlist/add`,
        { userId, productId },
        getConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to add item to wishlist"
      });
    }
  }
);

export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchWishlistItems",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/shop/wishlist/get/${userId}`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to fetch wishlist items"
      });
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/shop/wishlist/${userId}/${productId}`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to remove item from wishlist"
      });
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.wishlistItems = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlistItems = action.payload.data;
        state.error = null;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to add item to wishlist";
      })

      // Fetch wishlist items
      .addCase(fetchWishlistItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlistItems = action.payload.data;
        state.error = null;
      })
      .addCase(fetchWishlistItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch wishlist items";
        // Don't clear wishlist items on fetch error, keep existing state
      })

      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlistItems = action.payload.data;
        state.error = null;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to remove item from wishlist";
      });
  },
});

export const { clearWishlist, clearError } = wishlistSlice.actions;
export default wishlistSlice.reducer;