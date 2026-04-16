import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const initialState = {
  whatsapp: {
    number: '',
    message: 'Hello! I\'m interested in your products.',
    enabled: false
  },
  isLoading: false,
  error: null
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    return {
      "Content-Type": "application/json"
    };
  }
  
  try {
    const parsedToken = JSON.parse(token);
    return {
      Authorization: `Bearer ${parsedToken}`,
      "Content-Type": "application/json"
    };
  } catch (error) {
    console.error('Invalid token format:', error);
    return {
      "Content-Type": "application/json"
    };
  }
};

// Async thunk to fetch WhatsApp settings (admin)
export const fetchWhatsAppSettings = createAsyncThunk(
  "settings/fetchWhatsAppSettings",
  async (_, { rejectWithValue }) => {
    try {
      const result = await axios.get(
        `${API_BASE_URL}/api/admin/settings/whatsapp`,
        {
          headers: getAuthHeaders()
        }
      );
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch WhatsApp settings" });
    }
  }
);

// Async thunk to fetch WhatsApp settings with fallback (admin with public fallback)
export const fetchWhatsAppSettingsWithFallback = createAsyncThunk(
  "settings/fetchWhatsAppSettingsWithFallback",
  async (_, { rejectWithValue }) => {
    try {
      // First try the admin endpoint
      const result = await axios.get(
        `${API_BASE_URL}/api/admin/settings/whatsapp`,
        {
          headers: getAuthHeaders()
        }
      );
      return result.data;
    } catch (error) {
      // If admin endpoint fails with 401, try public endpoint
      if (error.response?.status === 401) {
        console.log('Admin endpoint requires authentication, falling back to public endpoint');
        try {
          const publicResult = await axios.get(
            `${API_BASE_URL}/api/admin/settings/whatsapp/public`
          );
          return publicResult.data;
        } catch (publicError) {
          return rejectWithValue(publicError.response?.data || { message: "Failed to fetch WhatsApp configuration" });
        }
      }
      return rejectWithValue(error.response?.data || { message: "Failed to fetch WhatsApp settings" });
    }
  }
);

// Async thunk to fetch public WhatsApp settings (for customer-facing components)
export const fetchPublicWhatsAppSettings = createAsyncThunk(
  "settings/fetchPublicWhatsAppSettings",
  async (_, { rejectWithValue }) => {
    try {
      const result = await axios.get(
        `${API_BASE_URL}/api/admin/settings/whatsapp/public`
      );
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch WhatsApp configuration" });
    }
  }
);

// Async thunk to update WhatsApp settings
export const updateWhatsAppSettings = createAsyncThunk(
  "settings/updateWhatsAppSettings",
  async (settingsData, { rejectWithValue }) => {
    try {
      const result = await axios.put(
        `${API_BASE_URL}/api/admin/settings/whatsapp`,
        settingsData,
        {
          headers: getAuthHeaders()
        }
      );
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to update WhatsApp settings" });
    }
  }
);

const AdminSettingsSlice = createSlice({
  name: "adminSettings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateWhatsAppField: (state, action) => {
      const { field, value } = action.payload;
      state.whatsapp[field] = value;
    },
    resetWhatsAppSettings: (state) => {
      state.whatsapp = {
        number: '',
        message: 'Hello! I\'m interested in your products.',
        enabled: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch WhatsApp settings (admin)
      .addCase(fetchWhatsAppSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWhatsAppSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.whatsapp = action.payload.data;
        state.error = null;
      })
      .addCase(fetchWhatsAppSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch WhatsApp settings with fallback
      .addCase(fetchWhatsAppSettingsWithFallback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWhatsAppSettingsWithFallback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.whatsapp = action.payload.data;
        state.error = null;
      })
      .addCase(fetchWhatsAppSettingsWithFallback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch public WhatsApp settings (customer-facing)
      .addCase(fetchPublicWhatsAppSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicWhatsAppSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.whatsapp = action.payload.data;
        state.error = null;
      })
      .addCase(fetchPublicWhatsAppSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update WhatsApp settings
      .addCase(updateWhatsAppSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWhatsAppSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.whatsapp = action.payload.data;
        state.error = null;
      })
      .addCase(updateWhatsAppSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateWhatsAppField, resetWhatsAppSettings } = AdminSettingsSlice.actions;
export default AdminSettingsSlice.reducer;
