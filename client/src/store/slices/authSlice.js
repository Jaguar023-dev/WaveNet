// client/src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('📝 Register API call:', userData.email);
      const response = await api.post('/api/auth/register', userData);
      console.log('✅ Register response:', { 
        user: response.data.user?.username,
        hasToken: !!response.data.accessToken 
      });
      return response.data;
    } catch (error) {
      console.error('❌ Register error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔐 Login API call:', credentials.email);
      const response = await api.post('/api/auth/login', credentials);
      console.log('✅ Login response:', { 
        user: response.data.user?.username,
        hasToken: !!response.data.accessToken 
      });
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Try to get token from Redux state first
      const { auth } = getState();
      let token = auth.token;
      
      console.log('👤 getCurrentUser - Token from Redux:', token ? 'Yes' : 'No');
      
      // If no token in Redux, check localStorage
      if (!token) {
        token = localStorage.getItem('token');
        console.log('🔍 getCurrentUser - Token from localStorage:', token ? 'Yes' : 'No');
      }
      
      if (!token) {
        console.log('❌ No token found anywhere');
        return rejectWithValue('No token found');
      }
      
      // Use the api instance which automatically adds Authorization header
      const response = await api.get('/api/auth/me');
      console.log('✅ getCurrentUser response:', { 
        user: response.data.user?.username 
      });
      return response.data;
    } catch (error) {
      console.error('❌ getCurrentUser error:', {
        status: error.response?.status,
        message: error.response?.data?.message
      });
      
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        console.log('🗑️ Removed invalid token from localStorage');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('token'), // Set based on token presence
    initialized: false // Track if auth has been checked
  },
  reducers: {
    logout: (state) => {
      console.log('🚪 Logout action');
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.initialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action) => {
      console.log('🔑 Setting token in Redux');
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    setAuthState: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.token;
      state.initialized = true;
    },
    setInitialized: (state) => {
      state.initialized = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        console.log('⏳ Register pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        console.log('✅ Register fulfilled - updating state');
        
        state.loading = false;
        state.user = action.payload.user;
        
        // CRITICAL: Save accessToken properly
        const accessToken = action.payload.accessToken;
        if (accessToken) {
          state.token = accessToken;
          state.isAuthenticated = true;
          localStorage.setItem('token', accessToken);
          console.log('💾 Token saved to localStorage');
        }
        
        state.initialized = true;
      })
      .addCase(register.rejected, (state, action) => {
        console.log('❌ Register rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
        state.initialized = true;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        console.log('⏳ Login pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('✅ Login fulfilled - updating state');
        
        state.loading = false;
        state.user = action.payload.user;
        
        // CRITICAL: Save accessToken properly
        const accessToken = action.payload.accessToken;
        if (accessToken) {
          state.token = accessToken;
          state.isAuthenticated = true;
          localStorage.setItem('token', accessToken);
          console.log('💾 Token saved to localStorage');
        }
        
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        console.log('❌ Login rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
        state.initialized = true;
      })
      
      // getCurrentUser
      .addCase(getCurrentUser.pending, (state) => {
        console.log('⏳ getCurrentUser pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        console.log('✅ getCurrentUser fulfilled - updating state');
        
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        console.log('❌ getCurrentUser rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.initialized = true;
        localStorage.removeItem('token');
      });
  }
});

export const { logout, clearError, setToken, setAuthState, setInitialized } = authSlice.actions;
export default authSlice.reducer;