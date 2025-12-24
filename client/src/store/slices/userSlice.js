// client/src/store/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks for verification
export const getVerificationStatus = createAsyncThunk(
  'user/getVerificationStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/verification/status');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get verification status');
    }
  }
);

export const submitVerificationRequest = createAsyncThunk(
  'user/submitVerificationRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append text fields
      formData.append('category', requestData.category);
      formData.append('justification', requestData.justification);
      if (requestData.website) formData.append('website', requestData.website);
      if (requestData.followersCount) formData.append('followersCount', requestData.followersCount);
      
      // Append document if exists
      if (requestData.document) {
        formData.append('document', requestData.document);
      }
      
      const response = await api.post('/verification/request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit verification request');
    }
  }
);

export const checkVerificationStatus = createAsyncThunk(
  'user/checkVerificationStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/verification`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check verification status');
    }
  }
);

// Admin verification actions
export const getPendingVerificationRequests = createAsyncThunk(
  'user/getPendingVerificationRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/verification/requests/pending');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get pending verification requests');
    }
  }
);

export const approveVerificationRequest = createAsyncThunk(
  'user/approveVerificationRequest',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/verification/${userId}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve verification request');
    }
  }
);

export const rejectVerificationRequest = createAsyncThunk(
  'user/rejectVerificationRequest',
  async ({ userId, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/verification/${userId}/reject`, { rejectionReason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject verification request');
    }
  }
);

export const getVerificationStats = createAsyncThunk(
  'user/getVerificationStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/verification/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get verification statistics');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    verificationStatus: null,
    pendingVerificationRequests: [],
    verificationStats: null,
    verificationHistory: [],
    
    // Loading states
    loading: false,
    verificationLoading: false,
    adminVerificationLoading: false,
    
    // Error states
    error: null,
    verificationError: null,
    adminVerificationError: null,
    
    // Success states
    verificationSuccess: false,
    requestSubmitted: false,
    
    // Pagination
    verificationRequestsPage: 1,
    verificationRequestsTotalPages: 1,
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setVerificationStatus: (state, action) => {
      state.verificationStatus = action.payload;
    },
    clearVerificationStatus: (state) => {
      state.verificationStatus = null;
    },
    clearVerificationError: (state) => {
      state.verificationError = null;
    },
    clearAdminVerificationError: (state) => {
      state.adminVerificationError = null;
    },
    resetVerificationState: (state) => {
      state.verificationStatus = null;
      state.verificationError = null;
      state.verificationSuccess = false;
      state.requestSubmitted = false;
    },
    resetVerificationRequestState: (state) => {
      state.requestSubmitted = false;
      state.verificationError = null;
    },
    markVerificationRequestAsReviewed: (state, action) => {
      const userId = action.payload;
      state.pendingVerificationRequests = state.pendingVerificationRequests.filter(
        request => request._id !== userId
      );
    },
    addVerificationToHistory: (state, action) => {
      state.verificationHistory.unshift(action.payload);
      if (state.verificationHistory.length > 50) {
        state.verificationHistory = state.verificationHistory.slice(0, 50);
      }
    },
    updateVerificationRequestStatus: (state, action) => {
      const { userId, status, rejectionReason } = action.payload;
      
      // Update in pending requests if exists
      const requestIndex = state.pendingVerificationRequests.findIndex(
        req => req._id === userId
      );
      
      if (requestIndex !== -1) {
        state.pendingVerificationRequests.splice(requestIndex, 1);
      }
      
      // Update current user if it's them
      if (state.currentUser && state.currentUser._id === userId) {
        state.currentUser.isVerified = status === 'approved';
        state.currentUser.verificationRequest = {
          ...state.currentUser.verificationRequest,
          status,
          rejectionReason,
          reviewedAt: new Date().toISOString()
        };
      }
    },
    incrementVerificationRequestsPage: (state) => {
      state.verificationRequestsPage += 1;
    },
    resetVerificationRequestsPage: (state) => {
      state.verificationRequestsPage = 1;
    },
    clearAllVerificationData: (state) => {
      state.pendingVerificationRequests = [];
      state.verificationStats = null;
      state.verificationHistory = [];
      state.verificationRequestsPage = 1;
      state.verificationRequestsTotalPages = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get verification status
      .addCase(getVerificationStatus.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(getVerificationStatus.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.verificationStatus = action.payload;
      })
      .addCase(getVerificationStatus.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload;
      })
      
      // Submit verification request
      .addCase(submitVerificationRequest.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
        state.requestSubmitted = false;
      })
      .addCase(submitVerificationRequest.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.verificationSuccess = true;
        state.requestSubmitted = true;
        
        // Update current user's verification request status
        if (state.currentUser) {
          state.currentUser.verificationRequest = {
            status: 'pending',
            submittedAt: new Date().toISOString()
          };
        }
        
        // Add to history
        state.verificationHistory.unshift({
          type: 'request_submitted',
          timestamp: new Date().toISOString(),
          data: action.payload
        });
      })
      .addCase(submitVerificationRequest.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload;
        state.requestSubmitted = false;
      })
      
      // Check verification status
      .addCase(checkVerificationStatus.pending, (state) => {
        state.verificationLoading = true;
      })
      .addCase(checkVerificationStatus.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.verificationStatus = action.payload;
      })
      .addCase(checkVerificationStatus.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload;
      })
      
      // Get pending verification requests (Admin)
      .addCase(getPendingVerificationRequests.pending, (state) => {
        state.adminVerificationLoading = true;
        state.adminVerificationError = null;
      })
      .addCase(getPendingVerificationRequests.fulfilled, (state, action) => {
        state.adminVerificationLoading = false;
        state.pendingVerificationRequests = action.payload;
      })
      .addCase(getPendingVerificationRequests.rejected, (state, action) => {
        state.adminVerificationLoading = false;
        state.adminVerificationError = action.payload;
      })
      
      // Approve verification request (Admin)
      .addCase(approveVerificationRequest.pending, (state) => {
        state.adminVerificationLoading = true;
        state.adminVerificationError = null;
      })
      .addCase(approveVerificationRequest.fulfilled, (state, action) => {
        state.adminVerificationLoading = false;
        
        // Add to history
        state.verificationHistory.unshift({
          type: 'request_approved',
          timestamp: new Date().toISOString(),
          data: action.payload
        });
      })
      .addCase(approveVerificationRequest.rejected, (state, action) => {
        state.adminVerificationLoading = false;
        state.adminVerificationError = action.payload;
      })
      
      // Reject verification request (Admin)
      .addCase(rejectVerificationRequest.pending, (state) => {
        state.adminVerificationLoading = true;
        state.adminVerificationError = null;
      })
      .addCase(rejectVerificationRequest.fulfilled, (state, action) => {
        state.adminVerificationLoading = false;
        
        // Add to history
        state.verificationHistory.unshift({
          type: 'request_rejected',
          timestamp: new Date().toISOString(),
          data: action.payload
        });
      })
      .addCase(rejectVerificationRequest.rejected, (state, action) => {
        state.adminVerificationLoading = false;
        state.adminVerificationError = action.payload;
      })
      
      // Get verification stats (Admin)
      .addCase(getVerificationStats.pending, (state) => {
        state.adminVerificationLoading = true;
        state.adminVerificationError = null;
      })
      .addCase(getVerificationStats.fulfilled, (state, action) => {
        state.adminVerificationLoading = false;
        state.verificationStats = action.payload;
      })
      .addCase(getVerificationStats.rejected, (state, action) => {
        state.adminVerificationLoading = false;
        state.adminVerificationError = action.payload;
      });
  }
});

// Export actions
export const {
  setCurrentUser,
  setVerificationStatus,
  clearVerificationStatus,
  clearVerificationError,
  clearAdminVerificationError,
  resetVerificationState,
  resetVerificationRequestState,
  markVerificationRequestAsReviewed,
  addVerificationToHistory,
  updateVerificationRequestStatus,
  incrementVerificationRequestsPage,
  resetVerificationRequestsPage,
  clearAllVerificationData
} = userSlice.actions;

// Export selectors
export const selectCurrentUser = (state) => state.user.currentUser;
export const selectVerificationStatus = (state) => state.user.verificationStatus;
export const selectIsVerified = (state) => state.user.currentUser?.isVerified || false;
export const selectVerificationLoading = (state) => state.user.verificationLoading;
export const selectVerificationError = (state) => state.user.verificationError;
export const selectVerificationSuccess = (state) => state.user.verificationSuccess;
export const selectRequestSubmitted = (state) => state.user.requestSubmitted;
export const selectPendingVerificationRequests = (state) => state.user.pendingVerificationRequests;
export const selectAdminVerificationLoading = (state) => state.user.adminVerificationLoading;
export const selectAdminVerificationError = (state) => state.user.adminVerificationError;
export const selectVerificationStats = (state) => state.user.verificationStats;
export const selectVerificationHistory = (state) => state.user.verificationHistory;

// Export reducer
export default userSlice.reducer;