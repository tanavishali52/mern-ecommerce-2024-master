import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  profileData: null,
  profileStats: null,
  isLoadingProfile: false,
  profileError: null
};

// Common axios configuration
const axiosConfig = {
  withCredentials: true,
  headers: {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache"
  }
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        formData,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Registration failed"
      });
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        formData,
        axiosConfig
      );
      
      const { token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Login failed"
      });
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  "auth/logout",
  async () => {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/logout`,
      {},
      axiosConfig
    );
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    return response.data;
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const config = {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get(
        `${API_BASE_URL}/api/auth/check-auth`,
        config
      );
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Authentication check failed"
      });
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/shop/profile/${userId}`,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to fetch user profile"
      });
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/shop/profile/${userId}`,
        profileData,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to update user profile"
      });
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  "auth/fetchUserStats",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/shop/profile/${userId}/stats`,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to fetch user statistics"
      });
    }
  }
);

const handleAuthPending = (state) => {
  state.isLoading = true;
  state.error = null;
};

const handleAuthRejected = (state, action) => {
  state.isLoading = false;
  state.user = null;
  state.isAuthenticated = false;
  state.error = action.payload?.message || "Authentication failed";
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logoutUser: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, handleAuthPending)
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, handleAuthRejected)

      // Login
      .addCase(loginUser.pending, handleAuthPending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.success;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || "Login failed";
      })

      // Check Authentication
      .addCase(checkAuth.pending, handleAuthPending)
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, handleAuthRejected)

      // Logout
      .addCase(logoutUserThunk.pending, handleAuthPending)
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.profileData = null;
        state.profileStats = null;
      })
      .addCase(logoutUserThunk.rejected, (state) => {
        state.isLoading = false;
      })

      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoadingProfile = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoadingProfile = false;
        state.profileData = action.payload.data;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.profileError = action.payload?.message || "Failed to fetch profile";
      })

      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoadingProfile = true;
        state.profileError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoadingProfile = false;
        state.profileData = { ...state.profileData, ...action.payload.data };
        state.user = { ...state.user, ...action.payload.data };
        state.profileError = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.profileError = action.payload?.message || "Failed to update profile";
      })

      // Fetch User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoadingProfile = true;
        state.profileError = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.isLoadingProfile = false;
        state.profileStats = action.payload.data;
        state.profileError = null;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.profileError = action.payload?.message || "Failed to fetch stats";
      });
  }
});

export const { setUser, clearError, logoutUser } = authSlice.actions;
export default authSlice.reducer;