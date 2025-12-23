// server/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Added for secure token generation
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit'); // Added for rate limiting

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

// Inline token generator (since utils/helpers doesn't exist)
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'wavenet-default-secret-2024',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'wavenet-refresh-secret-2024',
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

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

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
    console.error('Registration error:', error);
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
    // Check for user
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
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
    console.error('Login error:', error);
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
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('friends.user', 'username profilePicture')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
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
    // Update last active
    await User.findByIdAndUpdate(req.user.id, { 
      lastActive: new Date() 
    });

    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
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

    // Create reset URL (adjust frontend URL as needed)
    const resetUrl = `${process.env.FRONTEND_URL || req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    console.log('Password reset URL:', resetUrl); // Remove in production
    
    // In production, send email here
    // await sendResetEmail(user.email, resetUrl);

    res.json({
      success: true,
      message: 'Password reset email sent',
      // Note: In production, do NOT send the resetToken in response
      // It should only be sent via email
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
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

    // Update password (password hashing will be done by User model pre-save)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
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
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'wavenet-refresh-secret-2024'
    );
    
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
    console.error('Refresh token error:', error);
    
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

module.exports = router;