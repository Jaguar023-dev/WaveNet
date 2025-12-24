// client/src/App.jsx - Add admin route
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './store/slices/authSlice';

// Layout
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import Friends from './pages/Friends/Friends';
import Groups from './pages/Groups/Groups';
import Messenger from './pages/Messenger/Messenger';
import Notifications from './pages/Notifications/Notifications';
import Marketplace from './pages/Marketplace/Marketplace';
import Watch from './pages/Watch/Watch';
import Settings from './pages/Settings/Settings';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';

// Loading
import LoadingSpinner from './components/Common/LoadingSpinner';

function App() {
  const dispatch = useDispatch();
  const { loading, isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="app-loading">
        <LoadingSpinner text="Loading WaveNet..." />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" /> : <Register />
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin Route - Separate from main layout */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Main App Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="friends" element={<Friends />} />
          <Route path="groups" element={<Groups />} />
          <Route path="messenger" element={<Messenger />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="watch" element={<Watch />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={
          <div className="page-404">
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/">Go back home</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;