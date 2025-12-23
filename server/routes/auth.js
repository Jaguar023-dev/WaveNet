// server/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Debug JWT secret
console.log('🔑 JWT_SECRET loaded in auth routes:', process.env.JWT_SECRET ? 'Yes' : 'No (using fallback)');

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { 
    success: false, 
    message: 'Too many login attempts, please try again later' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Inline token generator
const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'wavenet-default-secret-2024';
  console.log('🔑 Generating token with secret:', jwtSecret === process.env.JWT_SECRET ? 'from env' : 'fallback');
  
  return jwt.sign(
    { id: userId },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'wavenet-refresh-secret-2024';
  return jwt.sign(
    { id: userId },
    jwtRefreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  check('username', 'Username is required').trim().not().isEmpty(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, firstName, lastName } = req.body;

  try {
    console.log('📝 Registration attempt:', { username, email });
    
    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    
    if (user) {
      if (user.email === email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }
      if (user.username === username) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username already taken' 
        });
      }
    }

    // Create new user
    user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      profile: {
        firstName: firstName?.trim() || '',
        lastName: lastName?.trim() || ''
      }
    });

    // Save user
    await user.save();
    console.log('✅ User registered:', user._id);

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    console.log('🔑 Tokens generated. Access token length:', accessToken.length);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginLimiter, [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    console.log('🔐 Login attempt for email:', email);
    
    // Check for user
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user) {
      console.log('❌ Login failed: User not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log('❌ Login failed: Password mismatch');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    console.log('✅ Login successful for:', user.username);
    console.log('🔑 Access token generated, length:', accessToken.length);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    console.log('👤 GET /me - User ID:', req.user.id);
    
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('friends.user', 'username profilePicture')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');

    if (!user) {
      console.log('❌ GET /me - User not found in DB');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('✅ GET /me - Success for:', user.username);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ GET /me error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    console.log('🚪 Logout request for user:', req.user.id);
    
    // Update last active
    await User.findByIdAndUpdate(req.user.id, { 
      lastActive: new Date() 
    });

    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', [
  check('email', 'Please include a valid email').isEmail().normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // For security, don't reveal if user exists
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent'
      });
    }

    // Generate reset token (cryptographically secure)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    console.log('🔑 Password reset URL:', resetUrl);
    
    // In production, send email here
    // await sendResetEmail(user.email, resetUrl);

    res.json({
      success: true,
      message: 'Password reset email sent',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', [
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token } = req.params;
  const { password } = req.body;

  try {
    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public (with refresh token)
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ 
      success: false, 
      message: 'Refresh token required' 
    });
  }

  try {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'wavenet-refresh-secret-2024';
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret);
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }

    const newAccessToken = generateToken(user._id);

    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token expired' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid refresh token' 
    });
  }
});

// @route   POST /api/auth/debug-token
// @desc    Debug token issues
// @access  Public
router.post('/debug-token', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required'
    });
  }
  
  try {
    console.log('🔍 Debugging token, length:', token.length);
    console.log('🔍 Token sample:', token.substring(0, 20) + '...');
    
    // Try with default secret first
    const defaultSecret = 'wavenet-default-secret-2024';
    const envSecret = process.env.JWT_SECRET;
    
    let decodedWithDefault, decodedWithEnv;
    let defaultError, envError;
    
    // Try with default secret
    try {
      decodedWithDefault = jwt.verify(token, defaultSecret);
      console.log('✅ Token valid with DEFAULT secret');
    } catch (err) {
      defaultError = err.message;
      console.log('❌ Token invalid with DEFAULT secret:', err.message);
    }
    
    // Try with env secret (if exists)
    if (envSecret) {
      try {
        decodedWithEnv = jwt.verify(token, envSecret);
        console.log('✅ Token valid with ENV secret');
      } catch (err) {
        envError = err.message;
        console.log('❌ Token invalid with ENV secret:', err.message);
      }
    }
    
    // Always try to decode (without verification)
    const decodedWithoutVerify = jwt.decode(token);
    
    res.json({
      success: true,
      tokenInfo: {
        length: token.length,
        decodedWithoutVerify,
        validWithDefault: !!decodedWithDefault,
        validWithEnv: !!decodedWithEnv,
        defaultError,
        envError,
        envSecretExists: !!envSecret
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

module.exports = router;