// client/src/pages/Auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" });
      return;
    }

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password
    };

    try {
      console.log('🔄 Registering...');
      const result = await dispatch(register(userData)).unwrap();
      
      console.log('✅ Registration successful! Redirecting to home');
      
      // CRITICAL: Redirect IMMEDIATELY after successful registration
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
    }
  };

  // ... rest of your component stays the same
};