// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// ADDED: Import verification pages
import Verification from './pages/Verification/Verification';
import VerificationManager from './pages/Admin/VerificationManager';

function App() {
  console.log('🚀 App component rendering');
  
  return (
    <Router>
      <Routes>
        {/* Public Routes - No Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
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
            
            {/* FIXED: Single verification route inside Layout */}
            <Route path="/verification" element={<Verification />} />
          </Route>
          
          {/* ADDED: Admin Verification Management Route - Outside Layout */}
          <Route path="/admin/verification" element={<VerificationManager />} />
          
          {/* ADDED: Admin Verification Review Route */}
          <Route path="/admin/verification/review/:userId" element={
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              fontFamily: 'Arial, sans-serif' 
            }}>
              <h1>🔍 Review Verification Request</h1>
              <p>This page would show detailed verification request information for admin review.</p>
              <p><em>Verification review interface coming soon!</em></p>
              <button 
                onClick={() => window.location.href = '/admin/verification'}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1877f2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginTop: '20px',
                  marginRight: '10px'
                }}
              >
                Back to Verification Management
              </button>
            </div>
          } />
          
          {/* Admin Route - Protected */}
          <Route path="/admin" element={
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              fontFamily: 'Arial, sans-serif' 
            }}>
              <h1>🎯 Admin Panel</h1>
              <p>Welcome to the WaveNet Admin Panel</p>
              <div style={{ 
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '10px',
                maxWidth: '600px',
                margin: '30px auto'
              }}>
                <h3>Admin Features:</h3>
                <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                  <li>User Management</li>
                  <li>Content Moderation</li>
                  <li>Analytics Dashboard</li>
                  <li>System Settings</li>
                  <li>Verification Management</li>
                </ul>
              </div>
              <div style={{ 
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={() => window.location.href = '/admin/verification'}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#1877f2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Manage Verification
                </button>
                <button 
                  onClick={() => window.location.href = '/home'}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#42b72a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Back to Home
                </button>
              </div>
              <p><em>Admin functionality coming soon!</em></p>
            </div>
          } />
          
          {/* ADDED: Verification success redirect route */}
          <Route 
            path="/verification/success" 
            element={
              <div style={{ 
                padding: '40px',
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif'
              }}>
                <h1>✅ Verification Request Submitted</h1>
                <p>Your verification request has been successfully submitted!</p>
                <p>Our team will review your request within 7-10 business days.</p>
                <div style={{ 
                  marginTop: '30px',
                  padding: '20px',
                  backgroundColor: '#e8f5e9',
                  borderRadius: '10px',
                  maxWidth: '500px',
                  margin: '20px auto'
                }}>
                  <h3>What happens next?</h3>
                  <ul style={{ textAlign: 'left' }}>
                    <li>You'll receive a notification when your request is reviewed</li>
                    <li>If approved, the blue verification badge will appear on your profile</li>
                    <li>If rejected, you'll receive feedback and can reapply after 90 days</li>
                  </ul>
                </div>
                <button 
                  onClick={() => window.location.href = '/home'}
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
                  Return to Home
                </button>
              </div>
            } 
          />
          
          {/* ADDED: Verification rejected route */}
          <Route 
            path="/verification/rejected" 
            element={
              <div style={{ 
                padding: '40px',
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif'
              }}>
                <h1>❌ Verification Request Denied</h1>
                <p>Your verification request was not approved at this time.</p>
                <p>You may reapply after 90 days.</p>
                <div style={{ 
                  marginTop: '30px',
                  padding: '20px',
                  backgroundColor: '#ffebee',
                  borderRadius: '10px',
                  maxWidth: '500px',
                  margin: '20px auto'
                }}>
                  <h3>Common reasons for rejection:</h3>
                  <ul style={{ textAlign: 'left' }}>
                    <li>Insufficient proof of notability</li>
                    <li>Incomplete profile information</li>
                    <li>Account doesn't meet minimum activity requirements</li>
                    <li>Submitted documents were unclear or insufficient</li>
                  </ul>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <button 
                    onClick={() => window.location.href = '/verification'}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ff9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                  >
                    Review Requirements
                  </button>
                  <button 
                    onClick={() => window.location.href = '/home'}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#1877f2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            } 
          />
        </Route>
        
        {/* Redirect root to /home */}
        <Route 
          path="/" 
          element={
            <Navigate to="/home" replace />
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
              <a 
                href="/login" 
                style={{ 
                  margin: '10px', 
                  padding: '10px 20px',
                  backgroundColor: '#1877f2',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  display: 'inline-block'
                }}
              >
                Go to Login
              </a>
              <a 
                href="/home" 
                style={{ 
                  margin: '10px', 
                  padding: '10px 20px',
                  backgroundColor: '#42b72a',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  display: 'inline-block'
                }}
              >
                Go to Home
              </a>
              <a 
                href="/verification" 
                style={{ 
                  margin: '10px', 
                  padding: '10px 20px',
                  backgroundColor: '#9c27b0',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  display: 'inline-block'
                }}
              >
                Get Verified
              </a>
            </div>
          </div>
        } />
      </Routes>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;