// client/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Profile from './pages/Profile/Profile';
import Friends from './pages/Friends/Friends';
import Groups from './pages/Groups/Groups';
import Watch from './pages/Watch/Watch';
import Marketplace from './pages/Marketplace/Marketplace';
import Messenger from './pages/Messenger/Messenger';
import Notifications from './pages/Notifications/Notifications';
import Settings from './pages/Settings/Settings';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';

// Loading
import LoadingSpinner from './components/Common/LoadingSpinner';

// Main App Component
function AppContent() {
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Dispatch getCurrentUser if your authSlice has this action
    // If not, you can remove this useEffect
  }, [dispatch]);

  if (loading) {
    return (
      <div className="app-loading" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <LoadingSpinner text="Loading WaveNet..." />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes - No Layout */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <Register />
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Admin Route - Separate from main layout */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes with Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/watch" element={<Watch />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/messenger" element={<Messenger />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        
        {/* Redirect root to /home if authenticated, /login if not */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to="/home" replace /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={
          <div style={{ 
            padding: '40px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
          }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <div style={{ marginTop: '20px' }}>
              <a href="/login" style={{ margin: '10px', color: '#1877f2' }}>Go to Login</a>
              <a href="/" style={{ margin: '10px', color: '#1877f2' }}>Go to Home</a>
            </div>
          </div>
        } />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

// Main App Wrapper with Provider
function App() {
  console.log('🚀 App component rendering');
  
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;