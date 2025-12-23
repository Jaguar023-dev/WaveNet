// client/src/pages/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
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

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error } = useSelector(state => state.auth);
  const from = location.state?.from?.pathname || '/';

  // Only clear errors on mount
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
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Save email if remember me is checked
    if (formData.rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    try {
      // Dispatch login and wait for it to complete
      console.log('🔄 Logging in...');
      const result = await dispatch(login({
        email: formData.email,
        password: formData.password
      })).unwrap();
      
      console.log('✅ Login successful! Redirecting to:', from);
      
      // CRITICAL: Redirect IMMEDIATELY after successful login
      // Don't wait for useEffect or Redux state updates
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      // Error is already handled by Redux
    }
  };

  // ... rest of your JSX (form rendering) stays exactly the same
  // REMOVE any useEffect that depends on isAuthenticated

  return (
    <div className="auth-container">
      {/* Your existing JSX here - don't change the form rendering */}
      {/* Only the handleSubmit function above needs to change */}
    </div>
  );
};

export default Login;