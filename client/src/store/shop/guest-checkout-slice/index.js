import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const initialState = {
  isModalOpen: false,
  selectedProduct: null,
  isLoading: false,
  orderData: null,
  error: null,
  orderConfirmation: null,
};

// Configure axios defaults
const getConfig = () => ({
  withCredentials: true,
  headers: {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache"
  }
});

// Submit guest order
export const submitGuestOrder = createAsyncThunk(
  "guestCheckout/submitGuestOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/shop/orders/guest`,
        orderData,
        getConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to submit guest order"
      });
    }
  }
);

const guestCheckoutSlice = createSlice({
  name: "guestCheckout",
  initialState,
  reducers: {
    // Open guest checkout modal with selected product
    openGuestCheckout: (state, action) => {
      state.isModalOpen = true;
      state.selectedProduct = action.payload;
      state.error = null;
      state.orderConfirmation = null;
    },
    
    // Close guest checkout modal and clear state
    closeGuestCheckout: (state) => {
      state.isModalOpen = false;
      state.selectedProduct = null;
      state.error = null;
      state.orderData = null;
    },
    
    // Store order data locally for persistence
    setOrderData: (state, action) => {
      state.orderData = action.payload;
      // Store in localStorage for persistence
      localStorage.setItem('guestOrderData', JSON.stringify(action.payload));
    },
    
    // Clear order data after successful submission
    clearGuestOrder: (state) => {
      state.orderData = null;
      state.orderConfirmation = null;
      localStorage.removeItem('guestOrderData');
    },
    
    // Set error message
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Clear error message
    clearError: (state) => {
      state.error = null;
    },
    
    // Load order data from localStorage (for persistence)
    loadOrderDataFromStorage: (state) => {
      const storedData = localStorage.getItem('guestOrderData');
      if (storedData) {
        try {
          state.orderData = JSON.parse(storedData);
        } catch (error) {
          localStorage.removeItem('guestOrderData');
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit guest order
      .addCase(submitGuestOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitGuestOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderConfirmation = action.payload.data;
        state.error = null;
        // Clear local storage after successful submission
        localStorage.removeItem('guestOrderData');
        state.orderData = null;
      })
      .addCase(submitGuestOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to submit guest order";
      });
  },
});

export const {
  openGuestCheckout,
  closeGuestCheckout,
  setOrderData,
  clearGuestOrder,
  setError,
  clearError,
  loadOrderDataFromStorage
} = guestCheckoutSlice.actions;

export default guestCheckoutSlice.reducer;