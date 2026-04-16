import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isModalOpen: false,
  orderData: null,
  countdown: 5,
  isRedirecting: false,
};

const orderConfirmationSlice = createSlice({
  name: "orderConfirmation",
  initialState,
  reducers: {
    // Show order confirmation modal
    showOrderConfirmation: (state, action) => {
      state.isModalOpen = true;
      state.orderData = action.payload;
      state.countdown = 5;
      state.isRedirecting = false;
    },
    
    // Hide order confirmation modal
    hideOrderConfirmation: (state) => {
      state.isModalOpen = false;
      state.orderData = null;
      state.countdown = 5;
      state.isRedirecting = false;
    },
    
    // Update countdown timer
    updateCountdown: (state, action) => {
      state.countdown = action.payload;
    },
    
    // Stop countdown
    stopCountdown: (state) => {
      state.countdown = -1;
    },
    
    // Set redirecting state
    setRedirecting: (state, action) => {
      state.isRedirecting = action.payload;
    },
    
    // Reset confirmation state
    resetConfirmation: (state) => {
      state.isModalOpen = false;
      state.orderData = null;
      state.countdown = 5;
      state.isRedirecting = false;
    }
  },
});

export const {
  showOrderConfirmation,
  hideOrderConfirmation,
  updateCountdown,
  stopCountdown,
  setRedirecting,
  resetConfirmation
} = orderConfirmationSlice.actions;

export default orderConfirmationSlice.reducer;