// client/src/App.jsx - Add a 404 fallback route
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
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
import Profile from './pages/Profile/Profile';
import Friends from './pages/Friends/Friends';
import Groups from './pages/Groups/Groups';
import Watch from './pages/Watch/Watch';
import Marketplace from './pages/Marketplace/Marketplace';
import Messenger from './pages/Messenger/Messenger';
import Notifications from './pages/Notifications/Notifications';
import Settings from './pages/Settings/Settings';

function App() {
  console.log('🚀 App component rendering');
  
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
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
          
          {/* Fallback routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
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
    </Provider>
  );
}

export default App;