// client/src/components/Auth/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser, checkAuthStatus } from '../../store/slices/authSlice';
import LoadingSpinner from '../Common/LoadingSpinner';

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, token, user, isCheckingAuth } = useSelector(state => state.auth);
  
  // Debug logging
  useEffect(() => {
    console.log('🔐 ProtectedRoute Debug:', {
      path: location.pathname,
      token: token ? `Yes (${token.substring(0, 10)}...)` : 'No',
      user: user ? `Yes (${user.username})` : 'No',
      isAuthenticated,
      loading,
      isCheckingAuth,
      timestamp: new Date().toISOString()
    });
  }, [token, user, isAuthenticated, loading, location, isCheckingAuth]);

  // Check authentication status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 ProtectedRoute: Checking auth status...');
      
      // Get token from localStorage as fallback
      const storedToken = localStorage.getItem('token');
      console.log('🔑 Token in localStorage:', storedToken ? 'Yes' : 'No');
      
      // If we have a token in Redux or localStorage but no user, fetch user
      if ((token || storedToken) && !user && !loading) {
        console.log('📡 Fetching current user...');
        try {
          await dispatch(getCurrentUser()).unwrap();
          console.log('✅ User fetched successfully');
        } catch (error) {
          console.error('❌ Failed to fetch user:', error);
          // Clear invalid token
          localStorage.removeItem('token');
        }
      }
    };
    
    initializeAuth();
  }, [dispatch, token, user, loading]);

  // Show loading spinner while checking authentication
  if (loading || isCheckingAuth) {
    console.log('⏳ ProtectedRoute: Loading...');
    return <LoadingSpinner fullScreen />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute: Not authenticated, redirecting to login');
    console.log('📍 Current path:', location.pathname);
    
    return <Navigate 
      to="/login" 
      state={{ 
        from: location.pathname,
        message: 'Please log in to access this page'
      }} 
      replace 
    />;
  }

  // If no user but we're "authenticated", something's wrong
  if (!user && isAuthenticated) {
    console.log('⚠️ ProtectedRoute: isAuthenticated but no user data');
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Authentication Error</h3>
        <p>Unable to load user data. Please try logging in again.</p>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Success! User is authenticated
  console.log('✅ ProtectedRoute: User authenticated, rendering outlet');
  console.log('👤 User:', user.username);
  
  return <Outlet />;
};

export default ProtectedRoute;