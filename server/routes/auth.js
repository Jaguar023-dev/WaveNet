// server/routes/auth.js - SIMPLIFIED TEST VERSION
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

// Hardcoded admin user - NO HASHING
const HARDCODED_ADMIN = {
  id: 'admin-001',
  firstName: 'Kenyan',
  lastName: 'Jaguar',
  username: 'kenyan_jaguar',
  email: 'trustynewsnetworkkenya@gmail.com',
  password: 'Derrick9786', // Plain text for testing
  role: 'admin',
  profilePicture: {
    url: '/default-admin-avatar.png',
    publicId: ''
  },
  isActive: true,
  isVerified: true,
  createdAt: new Date('2024-01-01')
};

// Demo users for testing
const DEMO_USERS = [
  {
    id: 'user-001',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    profilePicture: {
      url: '/default-avatar.png',
      publicId: ''
    },
    isActive: true,
    isVerified: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'user-002',
    firstName: 'Jane',
    lastName: 'Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    profilePicture: {
      url: '/default-avatar.png',
      publicId: ''
    },
    isActive: true,
    isVerified: true,
    createdAt: new Date('2024-01-02')
  }
];

// In-memory storage
let users = [...DEMO_USERS, HARDCODED_ADMIN];

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    console.log(`Login attempt: ${email}`);
    
    // Find user (case-insensitive email check)
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid email or password' 
      });
    }
    
    // Check password (plain text comparison for testing)
    if (user.password !== password) {
      console.log(`Password mismatch for: ${email}`);
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid email or password' 
      });
    }
    
    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({ 
        success: false,
        msg: 'Account is deactivated' 
      });
    }
    
    console.log(`Login successful: ${email} (${user.role})`);
    
    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role || 'user',
        email: user.email
      }
    };

    // Sign token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'test-secret-key-123',
      { expiresIn: '30d' } // 30 days for testing
    );

    // Return user data (without password)
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register user (testing only - no real registration)
// @access  Public
router.post('/register', [
  check('firstName', 'First name is required').not().isEmpty(),
  check('lastName', 'Last name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('username', 'Username is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, username } = req.body;

  try {
    console.log(`Registration attempt: ${email} (${username})`);
    
    // Check if trying to register as admin
    if (email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()) {
      return res.status(400).json({ 
        success: false,
        msg: 'This email is reserved for system administration' 
      });
    }
    
    // Check if user exists
    const existingUser = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() || 
      u.username.toLowerCase() === username.toLowerCase()
    );
    
    if (existingUser) {
      const conflict = existingUser.email.toLowerCase() === email.toLowerCase() 
        ? 'Email already registered' 
        : 'Username already taken';
      
      return res.status(400).json({ 
        success: false,
        msg: conflict 
      });
    }
    
    // Create new user (in memory only)
    const newUser = {
      id: `user-${Date.now()}`,
      firstName,
      lastName,
      username,
      email,
      password, // Plain text for testing
      profilePicture: {
        url: '/default-avatar.png',
        publicId: ''
      },
      role: 'user',
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
      friends: [],
      pendingFriendRequests: [],
      sentFriendRequests: []
    };
    
    // Add to users array
    users.push(newUser);
    
    console.log(`Registration successful: ${email}`);
    
    // Create JWT token
    const payload = {
      user: {
        id: newUser.id,
        role: newUser.role,
        email: newUser.email
      }
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'test-secret-key-123',
      { expiresIn: '30d' }
    );
    
    // Return user data (without password)
    const userResponse = { ...newUser };
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userResponse
    });

  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        msg: 'No token provided' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key-123');
    
    // Find user
    const user = users.find(u => u.id === decoded.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        msg: 'User not found' 
      });
    }
    
    // Return user without password
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.json({
      success: true,
      user: userResponse
    });
    
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        msg: 'Invalid token' 
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        msg: 'Token expired' 
      });
    }
    
    console.error('Get me error:', err.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server error' 
    });
  }
});

// @route   GET /api/auth/test-users
// @desc    Get list of test users (for testing only)
// @access  Public
router.get('/test-users', (req, res) => {
  // Return users without passwords
  const safeUsers = users.map(user => {
    const safeUser = { ...user };
    delete safeUser.password;
    return safeUser;
  });
  
  res.json({
    success: true,
    users: safeUsers,
    testCredentials: {
      admin: {
        email: 'trustynewsnetworkkenya@gmail.com',
        password: 'Derrick9786',
        role: 'admin'
      },
      regularUsers: [
        {
          email: 'john@example.com',
          password: 'password123',
          role: 'user'
        },
        {
          email: 'jane@example.com',
          password: 'password123',
          role: 'user'
        }
      ]
    }
  });
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Public
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful (client should remove token)'
  });
});

module.exports = router;