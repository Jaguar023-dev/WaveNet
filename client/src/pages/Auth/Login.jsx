// client/src/pages/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError, getCurrentUser } from '../../store/slices/authSlice';
import { Facebook, Twitter, Mail } from 'react-feather';
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
  const [hasRedirected, setHasRedirected] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get auth state from Redux
  const { loading, error, isAuthenticated, user, token } = useSelector(state => state.auth);

  const from = location.state?.from?.pathname || '/home';

  // Debug logging
  useEffect(() => {
    console.log('🔑 Login Component State:', {
      isAuthenticated,
      user: user ? user.username : 'No user',
      token: token ? `Yes (${token?.substring(0, 20)}...)` : 'No',
      loading,
      error,
      from,
      currentPath: location.pathname,
      hasRedirected
    });
  }, [isAuthenticated, user, token, loading, error, from, location, hasRedirected]);

  // Check if user is already authenticated
  useEffect(() => {
    const checkExistingAuth = async () => {
      console.log('🔄 Login: Checking existing authentication');
      
      const storedToken = localStorage.getItem('token');
      console.log('🔍 Token in localStorage:', storedToken ? `Yes (${storedToken.substring(0, 20)}...)` : 'No');
      
      // If we have a token but no user in Redux, fetch user
      if (storedToken && !user) {
        console.log('📡 Fetching user with existing token...');
        try {
          const result = await dispatch(getCurrentUser()).unwrap();
          console.log('✅ Existing auth valid:', result.user?.username);
        } catch (error) {
          console.log('❌ Existing token invalid:', error);
          localStorage.removeItem('token');
        }
      }
    };
    
    checkExistingAuth();
  }, [dispatch, user]);

  // Handle redirect after authentication
  useEffect(() => {
    console.log('🔄 Login useEffect - checking if should redirect');
    
    if (isAuthenticated && user && !hasRedirected) {
      console.log('✅ User authenticated, redirecting to:', from);
      console.log('👤 User data:', { username: user.username, email: user.email });
      
      setHasRedirected(true);
      
      // Small delay to ensure everything is ready
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    }
    
    // Clear any previous errors
    dispatch(clearError());
    
    // Check for saved email
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }
  }, [isAuthenticated, user, navigate, from, dispatch, hasRedirected]);

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
    setHasRedirected(false); // Reset redirect flag
    
    // Save email if remember me is checked
    if (formData.rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
      console.log('💾 Email saved to localStorage for remember me');
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    try {
      console.log('📡 Dispatching login action...');
      const result = await dispatch(login({
        email: formData.email,
        password: formData.password
      })).unwrap();
      
      console.log('✅ Login successful! Result:', {
        user: result.user?.username,
        accessToken: result.accessToken ? 'Yes' : 'No',
        refreshToken: result.refreshToken ? 'Yes' : 'No'
      });
      
      // OPTION 1: Immediate redirect (more reliable)
      if (result.user && result.accessToken) {
        console.log('🚀 Immediate redirect to /home');
        
        // Store token in localStorage (already done in authSlice, but just in case)
        if (result.accessToken) {
          localStorage.setItem('token', result.accessToken);
          console.log('💾 Token stored in localStorage');
        }
        
        // Wait a moment for Redux state to update, then redirect
        setTimeout(() => {
          console.log('📍 Navigating to /home');
          navigate('/home', { replace: true });
        }, 50);
      }
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      setHasRedirected(false); // Allow retry
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alternative: Direct login with immediate Home call (hard redirect)
  const handleDirectLogin = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      // Dispatch login
      const result = await dispatch(login({
        email: formData.email,
        password: formData.password
      })).unwrap();
      
      console.log('✅ Direct login successful');
      
      // Force immediate hard redirect
      if (result.accessToken) {
        console.log('🎯 Forcing hard redirect to /home');
        
        // Give Redux a moment to update state
        setTimeout(() => {
          window.location.href = '/home';
        }, 100);
      }
      
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log('🌐 Social login clicked:', provider);
    window.location.href = `${process.env.REACT_APP_API_URL || ''}/auth/${provider}`;
  };

  const handleForgotPassword = () => {
    console.log('🔐 Forgot password clicked');
    navigate('/forgot-password');
  };

  const handleTestLogin = () => {
    console.log('🧪 Test login clicked');
    setFormData({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false
    });
  };

  // Quick login test button (for development only)
  const handleQuickTest = async () => {
    console.log('⚡ Quick test login');
    setFormData({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false
    });
    
    // Auto-submit after a brief delay
    setTimeout(() => {
      const submitEvent = new Event('submit', { bubbles: true });
      e?.target?.form?.dispatchEvent(submitEvent);
    }, 100);
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
            <div>Auth State: {isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}</div>
            <div>User: {user ? user.username : 'None'}</div>
            <div>Token in Redux: {token ? 'Present' : 'Missing'}</div>
            <div>Token in localStorage: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Redirect Attempted: {hasRedirected ? 'Yes' : 'No'}</div>
            <div>Target: {from}</div>
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
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
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
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
          
          {/* Alternative direct login button */}
          <button
            type="button"
            onClick={handleDirectLogin}
            className="auth-btn secondary"
            style={{ marginTop: '10px' }}
            disabled={isSubmitting || loading}
          >
            🚀 Login & Go Directly to Home
          </button>
          
          {/* Test buttons - for development only */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <button
                type="button"
                onClick={handleTestLogin}
                className="auth-btn secondary"
                style={{ marginTop: '10px', fontSize: '12px', padding: '8px' }}
              >
                🧪 Fill Test Credentials
              </button>
              
              <button
                type="button"
                onClick={handleQuickTest}
                className="auth-btn secondary"
                style={{ 
                  marginTop: '10px', 
                  fontSize: '12px', 
                  padding: '8px',
                  backgroundColor: '#e74c3c',
                  color: 'white'
                }}
              >
                ⚡ Quick Test Login
              </button>
            </>
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
      
      {/* Debug panel - for development only */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: '#2d3436',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '11px',
          maxWidth: '300px',
          zIndex: 1000
        }}>
          <strong>Auth Debug:</strong>
          <div>Status: {isAuthenticated ? '✅ Logged In' : '❌ Not Logged In'}</div>
          <div>User: {user ? user.username : 'None'}</div>
          <div>Token in localStorage: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>Submitting: {isSubmitting ? 'Yes' : 'No'}</div>
          
          <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
            <button 
              onClick={() => {
                console.log('Manual redirect to /home');
                navigate('/home');
              }}
              style={{
                background: '#3498db',
                color: 'white',
                border: 'none',
                padding: '5px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Manual Redirect
            </button>
            
            <button 
              onClick={() => {
                console.log('Checking localStorage...');
                console.log('Token:', localStorage.getItem('token'));
                console.log('Remembered Email:', localStorage.getItem('rememberedEmail'));
              }}
              style={{
                background: '#2ecc71',
                color: 'white',
                border: 'none',
                padding: '5px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Check Storage
            </button>
            
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '5px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Clear & Reload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;