import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const initialState = {
  isLoading: false,
  featureImageList: [],
};

const axiosConfig = {
  withCredentials: true,
  headers: {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache"
  }
};

export const getFeatureImages = createAsyncThunk(
  "/common/getFeatureImages",
  async () => {
    const response = await axios.get(
      `${API_BASE_URL}/api/common/features/get`,
      axiosConfig
    );
    return response.data;
  }
);

export const addFeatureImage = createAsyncThunk(
  "/common/addFeatureImage",
  async (imageUrl) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/common/features/add`,
      { image: imageUrl },
      axiosConfig
    );
    return response.data;
  }
);

export const deleteFeatureImage = createAsyncThunk(
  "common/deleteFeatureImage",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/common/features/delete/${id}`,
        axiosConfig
      );
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { 
        success: false, 
        message: error.message || 'Failed to delete feature image' 
      });
    }
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(getFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.featureImageList = [];
      })
      .addCase(addFeatureImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addFeatureImage.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add the new feature image to the list for immediate UI update
        if (action.payload.data) {
          state.featureImageList.push(action.payload.data);
        }
      })
      .addCase(addFeatureImage.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteFeatureImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteFeatureImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = state.featureImageList.filter(
          banner => banner._id !== action.payload.id
        );
      })
      .addCase(deleteFeatureImage.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default commonSlice.reducer;
