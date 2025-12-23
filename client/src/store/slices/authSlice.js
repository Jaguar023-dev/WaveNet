// client/src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('📝 Register API call:', userData.email);
      const response = await axios.post('/api/auth/register', userData);
      console.log('✅ Register response:', response.data);
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
      const response = await axios.post('/api/auth/login', credentials);
      console.log('✅ Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('👤 getCurrentUser - Token from localStorage:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.log('❌ No token found');
        return rejectWithValue('No token found');
      }
      
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ getCurrentUser response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getCurrentUser error:', error.response?.status, error.response?.data);
      
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
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
    isAuthenticated: false
  },
  reducers: {
    logout: (state) => {
      console.log('🚪 Logout action');
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action) => {
      console.log('🔑 Setting token:', action.payload?.substring(0, 20) + '...');
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    // Add this to manually set auth state if needed
    setAuthState: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = action.payload.isAuthenticated;
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
        console.log('✅ Register fulfilled:', {
          user: action.payload.user?.username,
          tokenExists: !!action.payload.accessToken,
          refreshTokenExists: !!action.payload.refreshToken
        });
        
        state.loading = false;
        state.user = action.payload.user;
        
        // FIX: Use accessToken (not token) - matches backend response
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        
        // Save token to localStorage
        if (action.payload.accessToken) {
          localStorage.setItem('token', action.payload.accessToken);
          console.log('💾 Token saved to localStorage');
        }
      })
      .addCase(register.rejected, (state, action) => {
        console.log('❌ Register rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        console.log('⏳ Login pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('✅ Login fulfilled:', {
          user: action.payload.user?.username,
          tokenExists: !!action.payload.accessToken
        });
        
        state.loading = false;
        state.user = action.payload.user;
        
        // FIX: Use accessToken (not token) - matches backend response
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        
        // Save token to localStorage
        if (action.payload.accessToken) {
          localStorage.setItem('token', action.payload.accessToken);
          console.log('💾 Token saved to localStorage');
        }
      })
      .addCase(login.rejected, (state, action) => {
        console.log('❌ Login rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      
      // getCurrentUser
      .addCase(getCurrentUser.pending, (state) => {
        console.log('⏳ getCurrentUser pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        console.log('✅ getCurrentUser fulfilled:', {
          user: action.payload.user?.username,
          isAuthenticated: true
        });
        
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        console.log('❌ getCurrentUser rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      });
  }
});

export const { logout, clearError, setToken, setAuthState } = authSlice.actions;
export default authSlice.reducer;