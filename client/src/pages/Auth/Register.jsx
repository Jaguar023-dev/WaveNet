import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import { User, Mail, Lock, Calendar, Transgender } from 'react-feather';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    gender: '',
    birthday: null,
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
    
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    // Calculate password strength
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 8) strength += 1;
      if (/[A-Z]/.test(formData.password)) strength += 1;
      if (/[0-9]/.test(formData.password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const validateForm = () => {
    const newErrors = {};
    
    // First name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    // Last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_.]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, underscore and dot';
    }
    
    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (passwordStrength < 2) {
      newErrors.password = 'Password is too weak. Include uppercase, numbers, or symbols';
    }
    
    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Gender
    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
    }
    
    // Birthday
    if (!formData.birthday) {
      newErrors.birthday = 'Birthday is required';
    } else {
      const age = new Date().getFullYear() - formData.birthday.getFullYear();
      if (age < 13) {
        newErrors.birthday = 'You must be at least 13 years old to register';
      }
    }
    
    // Terms
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms of Service';
    }
    
    return newErrors;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'transparent';
    if (passwordStrength === 1) return '#ef4444'; // red
    if (passwordStrength === 2) return '#f59e0b'; // amber
    if (passwordStrength === 3) return '#10b981'; // emerald
    return '#3b82f6'; // blue
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBirthdayChange = (date) => {
    setFormData(prev => ({
      ...prev,
      birthday: date
    }));
    
    if (errors.birthday) {
      setErrors(prev => ({
        ...prev,
        birthday: ''
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
    
    setIsSubmitting(true);
    
    try {
      await dispatch(register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        gender: formData.gender,
        birthday: formData.birthday
      })).unwrap();
      
      // Redirect handled by useEffect
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register">
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
          <p className="auth-subtitle">Sign up to connect with friends and the world around you.</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="First name"
                  disabled={isSubmitting}
                  autoComplete="given-name"
                />
              </div>
              {errors.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Last name"
                  disabled={isSubmitting}
                  autoComplete="family-name"
                />
              </div>
              {errors.lastName && (
                <span className="error-message">{errors.lastName}</span>
              )}
            </div>
          </div>
          
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
                placeholder="Email address"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Choose a username"
                disabled={isSubmitting}
                autoComplete="username"
              />
            </div>
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
            <p className="input-hint">
              This will be your unique identifier on WaveNet
            </p>
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Create a password"
                disabled={isSubmitting}
                autoComplete="new-password"
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
            
            {/* Password strength indicator */}
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`strength-bar ${
                        level <= passwordStrength ? 'active' : ''
                      }`}
                      style={{
                        backgroundColor: level <= passwordStrength 
                          ? getPasswordStrengthColor() 
                          : '#e5e7eb'
                      }}
                    />
                  ))}
                </div>
                <span className="strength-text">
                  {passwordStrength === 0 && 'Enter a password'}
                  {passwordStrength === 1 && 'Weak'}
                  {passwordStrength === 2 && 'Fair'}
                  {passwordStrength === 3 && 'Good'}
                  {passwordStrength === 4 && 'Strong'}
                </span>
              </div>
            )}
            
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birthday" className="form-label">
                Birthday
              </label>
              <div className="input-group">
                <Calendar className="input-icon" size={20} />
                <DatePicker
                  selected={formData.birthday}
                  onChange={handleBirthdayChange}
                  dateFormat="MMMM d, yyyy"
                  maxDate={new Date()}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  placeholderText="Select your birthday"
                  className={`form-input date-picker ${errors.birthday ? 'error' : ''}`}
                  disabled={isSubmitting}
                  autoComplete="off"
                />
              </div>
              {errors.birthday && (
                <span className="error-message">{errors.birthday}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="gender" className="form-label">
                Gender
              </label>
              <div className="input-group">
                <Transgender className="input-icon" size={20} />
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`form-input ${errors.gender ? 'error' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              {errors.gender && (
                <span className="error-message">{errors.gender}</span>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label terms">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                disabled={isSubmitting}
                className="checkbox"
              />
              <span>
                I agree to the{' '}
                <a href="/terms" className="link">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="link">Privacy Policy</a>
              </span>
            </label>
            {errors.agreeToTerms && (
              <span className="error-message">{errors.agreeToTerms}</span>
            )}
          </div>
          
          <button
            type="submit"
            className="auth-btn primary large"
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Already have an account */}
        <div className="auth-footer">
          <p className="have-account">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Log In
            </Link>
          </p>
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
    </div>
  );
};

export default Register;