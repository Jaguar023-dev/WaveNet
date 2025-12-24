// client/src/components/Auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import LoadingSpinner from '../Common/LoadingSpinner';

const ProtectedRoute = () => {
  const location = useLocation();
  
  // Check authentication using localStorage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Debug logging
  console.log('🔐 ProtectedRoute Check:', {
    path: location.pathname,
    hasToken: !!token,
    user: user ? user.username : 'No user',
    userRole: user?.role || 'none'
  });
  
  // If not authenticated, redirect to login
  if (!token || !user) {
    console.log('🔒 Not authenticated, redirecting to login');
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          message: 'Please log in to access this page'
        }} 
        replace 
      />
    );
  }
  
  // Check admin routes
  if (location.pathname.startsWith('/admin')) {
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    if (!isAdmin) {
      console.log('🚫 Not an admin, redirecting home');
      return <Navigate to="/home" replace />;
    }
    console.log('✅ Admin access granted for:', user.username);
  }
  
  // Success - user is authenticated
  console.log('✅ User authenticated:', user.username);
  return <Outlet />;
};

export default ProtectedRoute;