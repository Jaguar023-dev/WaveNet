// client/src/components/Auth/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser, setInitialized } from '../../store/slices/authSlice';
import LoadingSpinner from '../Common/LoadingSpinner';

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { 
    user, 
    token, 
    loading, 
    isAuthenticated, 
    initialized,
    error 
  } = useSelector(state => state.auth);
  
  // Debug logging
  useEffect(() => {
    console.log('🔐 ProtectedRoute State:', {
      path: location.pathname,
      token: token ? `Yes (${token.substring(0, 15)}...)` : 'No',
      user: user ? `Yes (${user.username})` : 'No',
      isAuthenticated,
      loading,
      initialized,
      error
    });
  }, [token, user, isAuthenticated, loading, location, initialized, error]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Skip if already initialized
      if (initialized) {
        console.log('✅ Auth already initialized');
        return;
      }
      
      console.log('🔄 ProtectedRoute: Checking authentication...');
      
      // Check if we have a token
      const hasToken = token || localStorage.getItem('token');
      
      if (hasToken && !user) {
        console.log('📡 Fetching user data with token...');
        try {
          await dispatch(getCurrentUser()).unwrap();
          console.log('✅ User data fetched successfully');
        } catch (err) {
          console.error('❌ Failed to fetch user:', err);
        }
      } else if (!hasToken) {
        console.log('❌ No token available');
      }
      
      // Mark as initialized even if no token
      dispatch(setInitialized());
    };
    
    checkAuth();
  }, [dispatch, token, user, initialized]);

  // Show loading while checking auth
  if (loading || !initialized) {
    console.log('⏳ ProtectedRoute: Loading or checking auth...');
    return <LoadingSpinner fullScreen />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute: Not authenticated, redirecting to login');
    console.log('📍 From:', location.pathname);
    
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          reason: 'authentication-required'
        }} 
        replace 
      />
    );
  }

  // If authenticated but no user data (shouldn't happen but just in case)
  if (!user && isAuthenticated) {
    console.log('⚠️ ProtectedRoute: Authenticated but no user data');
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h3>Authentication Error</h3>
        <p>User data could not be loaded. Please try logging in again.</p>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1877f2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Success - user is authenticated
  console.log('✅ ProtectedRoute: User authenticated, rendering outlet');
  console.log('👤 Welcome,', user.username);
  
  return <Outlet />;
};

export default ProtectedRoute;