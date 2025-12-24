// client/src/pages/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Facebook, Twitter, Mail } from 'react-feather';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/home';

  useEffect(() => {
    console.log('🔑 Login Component State:', {
      from,
      currentPath: location.pathname
    });

    // Check if already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      console.log('👤 Already logged in, redirecting to home');
      navigate('/home', { replace: true });
    }
    
    // Check for saved email
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
      console.log('📧 Pre-filled saved email:', savedEmail);
    }
  }, [navigate, from, location]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Login form submitted:', { 
      email: formData.email, 
      passwordLength: formData.password.length 
    });
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      console.log('❌ Form validation errors:', validationErrors);
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    // Save email if remember me is checked
    if (formData.rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
      console.log('💾 Email saved to localStorage for remember me');
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    try {
      console.log('📡 Sending login request to API...');
      
      // FIXED: Changed from localhost to your Render URL
      const API_URL = 'https://wavenet-wlnf.onrender.com/api';
      
      console.log(`🔗 Connecting to: ${API_URL}/auth/login`);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password
      }, {
        timeout: 15000, // Increased timeout for Render cold starts
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Login successful! Response:', response.data);
      
      // Save token and user data to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Show success message
      toast.success('Login successful!');
      
      // Redirect to home
      console.log('🔄 Redirecting to home...');
      navigate('/home', { replace: true });
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      let errorMessage = 'Login failed';
      
      if (error.response) {
        // Server responded with error
        console.log('Server error response:', error.response.data);
        console.log('Status code:', error.response.status);
        
        if (error.response.status === 400) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data.message || 'Invalid email or password';
        }
      } else if (error.request) {
        // Request was made but no response
        console.log('No response from server. Request:', error.request);
        
        if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Cannot connect to server. The server might be starting up (Render.com cold start can take 30-60 seconds).';
        } else if (error.code === 'ETIMEDOUT') {
          errorMessage = 'Request timed out. Server might be slow to respond.';
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = 'No response from server. Please try again.';
        }
      } else {
        // Something else happened
        console.log('Error setting up request:', error.message);
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Show specific field errors if available
      if (error.response?.data?.field) {
        setErrors({ [error.response.data.field]: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log('🌐 Social login clicked:', provider);
    window.location.href = `https://wavenet-wlnf.onrender.com/auth/${provider}`;
  };

  const handleForgotPassword = () => {
    console.log('🔐 Forgot password clicked');
    navigate('/forgot-password');
  };

  const handleTestLogin = () => {
    console.log('🧪 Test login clicked - using admin credentials');
    setFormData({
      email: 'admin@wavenet.com',
      password: 'WaveNet@support1411',
      rememberMe: false
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Debug info - visible in development */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            background: '#f0f2f5',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            fontSize: '12px',
            borderLeft: '4px solid #1877f2'
          }}>
            <strong>Debug Info:</strong>
            <div>Server: https://wavenet-wlnf.onrender.com</div>
            <div>Token in localStorage: {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</div>
            <div>User in localStorage: {localStorage.getItem('user') ? '✅ Present' : '❌ Missing'}</div>
            <div>Target page: {from}</div>
            <div style={{ marginTop: '5px', color: '#666' }}>
              Test: admin@wavenet.com / WaveNet@support1411
            </div>
            <div style={{ marginTop: '5px', color: '#e74c3c', fontSize: '11px' }}>
              Note: First request to Render.com might be slow (cold start)
            </div>
          </div>
        )}

        {/* Logo */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <div className="logo-icon">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="logo-text">WaveNet</h1>
          </Link>
          <p className="auth-subtitle">Connect with friends and the world around you.</p>
        </div>

        {/* Social Login Buttons */}
        <div className="social-login">
          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            className="social-btn facebook"
            disabled={isSubmitting}
          >
            <Facebook size={20} />
            <span>Continue with Facebook</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="social-btn google"
            disabled={isSubmitting}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleSocialLogin('twitter')}
            className="social-btn twitter"
            disabled={isSubmitting}
          >
            <Twitter size={20} />
            <span>Continue with Twitter</span>
          </button>
        </div>

        {/* Divider */}
        <div className="divider">
          <span>OR</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                disabled={isSubmitting}
                autoComplete="email"
                autoFocus
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isSubmitting}
                className="checkbox"
              />
              <span>Remember me</span>
            </label>
            
            <button
              type="button"
              onClick={handleForgotPassword}
              className="forgot-password"
              disabled={isSubmitting}
            >
              Forgot password?
            </button>
          </div>
          
          <button
            type="submit"
            className="auth-btn primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
          
          {/* Test button - for development only */}
          {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              onClick={handleTestLogin}
              className="auth-btn secondary"
              style={{ marginTop: '10px', fontSize: '12px', padding: '8px' }}
            >
              🧪 Fill Admin Credentials
            </button>
          )}
        </form>

        {/* Divider */}
        <div className="divider">
          <span>Don't have an account?</span>
        </div>

        {/* Sign Up Link */}
        <div className="auth-footer">
          <Link to="/register" className="auth-link">
            Create New Account
          </Link>
        </div>

        {/* Terms and Privacy */}
        <div className="legal-links">
          <a href="/terms" className="legal-link">Terms of Service</a>
          <span className="separator">•</span>
          <a href="/privacy" className="legal-link">Privacy Policy</a>
          <span className="separator">•</span>
          <a href="/cookies" className="legal-link">Cookie Policy</a>
        </div>
      </div>
      
      {/* App Download Links */}
      <div className="app-download">
        <p>Get the app.</p>
        <div className="app-badges">
          <a href="#" className="app-badge">
            <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yz/r/5rR6LRpNc5u.png" alt="App Store" />
          </a>
          <a href="#" className="app-badge">
            <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yu/r/eX92ujx-8Wn.png" alt="Google Play" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;