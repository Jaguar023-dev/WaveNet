// server/middleware/auth.js 
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      console.log('🔐 Auth middleware - Token received:', token ? 'Yes (length: ' + token.length + ')' : 'No');
      console.log('🔐 JWT_SECRET exists:', !!process.env.JWT_SECRET);
      
      if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, no token' 
        });
      }

      // FIX: Use the same secret with fallback as in auth routes
      const jwtSecret = process.env.JWT_SECRET || 'wavenet-default-secret-2024';
      
      // Verify token
      const decoded = jwt.verify(token, jwtSecret);
      console.log('✅ Token decoded successfully. User ID:', decoded.id);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.log('❌ User not found for token');
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      
      // Check if user is active (if field exists)
      if (req.user.isActive !== undefined && !req.user.isActive) {
        return res.status(401).json({ 
          success: false,
          message: 'User account is deactivated' 
        });
      }
      
      console.log('✅ User authenticated:', req.user.username);
      next();
    } catch (error) {
      console.error('❌ Token verification error:', error.name, error.message);
      
      if (error.name === 'JsonWebTokenError') {
        // Try to decode without verification to see what's in the token
        try {
          const decodedWithoutVerify = jwt.decode(token);
          console.log('🔍 Token decode (without verify):', decodedWithoutVerify);
        } catch (decodeError) {
          console.log('🔍 Cannot decode token at all');
        }
        
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token' 
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token expired' 
        });
      }
      
      res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }
  } else {
    console.log('❌ No authorization header or invalid format');
    console.log('🔍 Authorization header:', req.headers.authorization);
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token' 
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Not authorized as admin' 
    });
  }
};

const moderator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Not authorized as moderator' 
    });
  }
};

module.exports = { protect, admin, moderator };