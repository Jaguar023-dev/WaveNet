// client/src/components/Auth/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../Common/LoadingSpinner';

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, token, user } = useSelector(state => state.auth);
  
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🔐 ProtectedRoute State:', {
      token: token ? `Present (${token.substring(0, 20)}...)` : 'Missing',
      user: user ? `Present (${user.username})` : 'Missing',
      isAuthenticated,
      loading,
      path: location.pathname,
      hasCheckedAuth
    });
  }, [token, user, isAuthenticated, loading, location, hasCheckedAuth]);

  useEffect(() => {
    console.log('🔄 ProtectedRoute useEffect triggered');
    
    const checkAuthentication = async () => {
      // If we have a token but no user is loaded
      if (token && !user && !loading) {
        console.log('📡 Fetching user with token...');
        try {
          const result = await dispatch(getCurrentUser());
          console.log('📡 getCurrentUser result:', result.meta.requestStatus);
          
          if (result.meta.requestStatus === 'rejected') {
            console.error('❌ Failed to get user:', result.error?.message);
          }
        } catch (error) {
          console.error('❌ getCurrentUser error:', error);
        }
      } else if (!token) {
        console.log('❌ No token available');
        const storedToken = localStorage.getItem('token');
        console.log('🔍 Token in localStorage:', storedToken ? 'Yes' : 'No');
      }
      
      setHasCheckedAuth(true);
    };
    
    checkAuthentication();
  }, [dispatch, token, user, loading]);

  // Show loading spinner
  if (loading || (!hasCheckedAuth && token)) {
    console.log('⏳ ProtectedRoute: Loading or checking auth...');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <LoadingSpinner fullScreen />
        <p style={{ marginTop: '20px', color: '#666' }}>
          {loading ? 'Loading...' : 'Checking authentication...'}
        </p>
      </div>
    );
  }

  // Check if authenticated
  if (!isAuthenticated || !user) {
    console.log('🔒 ProtectedRoute: Not authenticated, redirecting to login');
    console.log('📍 Redirecting from:', location.pathname, 'to /login');
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ ProtectedRoute: User authenticated, rendering outlet');
  return <Outlet />;
};

export default ProtectedRoute;