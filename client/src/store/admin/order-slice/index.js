import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const initialState = {
  orderList: [],
  orderDetails: null,
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async () => {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/orders/get`,
      {
        headers: getAuthHeaders()
      }
    );

    return response.data;
  }
);

export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/orders/details/${id}`,
      {
        headers: getAuthHeaders()
      }
    );

    return response.data;
  }
);

export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ id, orderStatus }) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/orders/update/${id}`,
      {
        orderStatus,
      },
      {
        headers: getAuthHeaders()
      }
    );

    return response.data;
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      console.log("resetOrderDetails");

      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('Redux: Status update fulfilled', action.payload);
        
        // Update the order details with the new status information
        if (state.orderDetails && action.payload.data) {
          console.log('Redux: Updating orderDetails from', state.orderDetails.orderStatus, 'to', action.payload.data.orderStatus);
          state.orderDetails = action.payload.data;
        }
        
        // Update the order in the list as well
        if (state.orderList && action.payload.data) {
          const orderIndex = state.orderList.findIndex(order => order._id === action.payload.data._id);
          if (orderIndex !== -1) {
            console.log('Redux: Updating order in list from', state.orderList[orderIndex].orderStatus, 'to', action.payload.data.orderStatus);
            state.orderList[orderIndex] = action.payload.data;
          }
        }
      })
      .addCase(updateOrderStatus.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { resetOrderDetails } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
