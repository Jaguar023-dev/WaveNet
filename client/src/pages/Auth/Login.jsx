// client/src/pages/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { Mail, Lock } from 'react-feather';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error } = useSelector(state => state.auth);
  const from = location.state?.from?.pathname || '/';

  // Clear errors on mount
  useEffect(() => {
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
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    if (formData.rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    try {
      const result = await dispatch(login({
        email: formData.email,
        password: formData.password
      })).unwrap();
      
      console.log('✅ Login successful! Redirecting to home');
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* WaveNet Logo & Name */}
        <div className="auth-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg className="w-12 h-12" fill="none" stroke="#1877f2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="logo-text">WaveNet</h1>
            <p className="tagline">Connect with friends and the world</p>
          </div>
          
          {/* Founder Credit */}
          <div className="founder-credit">
            <div className="founder-info">
              <div className="founder-avatar">
                <span>🦁</span>
              </div>
              <div className="founder-details">
                <p className="founder-name">Kenyan Jaguar</p>
                <p className="founder-role">Founder & CEO</p>
              </div>
            </div>
          </div>
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
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Email address"
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>
          
          <div className="form-group">
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Password"
                disabled={loading}
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
                disabled={loading}
                className="checkbox"
              />
              <span>Remember me</span>
            </label>
            
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            className="auth-btn primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="divider">
          <span>New to WaveNet?</span>
        </div>

        <div className="auth-footer">
          <Link to="/register" className="auth-link">
            Create New Account
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <div className="auth-footer-bottom">
        <p className="copyright">© 2026 WaveNet. All rights reserved.</p>
        <p className="founder-footer">Founded by Kenyan Jaguar 🦁</p>
      </div>
    </div>
  );
};

export default Login;