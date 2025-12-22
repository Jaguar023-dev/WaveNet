import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../Common/LoadingSpinner';

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, token } = useSelector(state => state.auth);

  useEffect(() => {
    // If we have a token but no user data, try to get current user
    if (token && !isAuthenticated && !loading) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, isAuthenticated, loading]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login but save the location they tried to visit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;