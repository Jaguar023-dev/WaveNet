// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User'); // Keep for future database use
const { protect } = require('../middleware/auth');

// Hardcoded admin user (works without database)
const HARDCODED_ADMIN = {
  id: 'admin-001',
  firstName: 'Kenyan',
  lastName: 'Jaguar',
  username: 'kenyan_jaguar',
  email: 'trustynewsnetworkkenya@gmail.com',
  password: '$2a$10$YourBcryptHashHere', // We'll generate this
  role: 'admin',
  profilePicture: {
    url: '/default-admin-avatar.png',
    publicId: ''
  },
  isActive: true,
  isVerified: true,
  createdAt: new Date('2024-01-01')
};

// Generate bcrypt hash for password "Derrick9786"
// In production, generate this once and hardcode it
const ADMIN_PASSWORD = 'Derrick9786';
const ADMIN_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

// Update the admin object with real hash
HARDCODED_ADMIN.password = ADMIN_HASH;

// @route   POST /api/auth/register
// @desc    Register user
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
    // Check if trying to register as admin email
    if (email === HARDCODED_ADMIN.email) {
      return res.status(400).json({ 
        msg: 'This email is reserved for system administration' 
      });
    }

    // For now, simulate database check
    // In memory storage for demo (temporary)
    const users = getInMemoryUsers();
    
    // Check if user exists (in memory or would exist in DB)
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    if (users.some(u => u.username === username)) {
      return res.status(400).json({ msg: 'Username already taken' });
    }

    // Create new user (in memory for demo)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: `user-${Date.now()}`,
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
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

    // Add to in-memory storage
    addUserToMemory(newUser);

    // Create JWT token
    const payload = {
      user: {
        id: newUser.id,
        role: newUser.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            profilePicture: newUser.profilePicture
          }
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

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
    let user = null;
    
    // Check if admin login
    if (email === HARDCODED_ADMIN.email) {
      // Verify admin password
      const isMatch = await bcrypt.compare(password, HARDCODED_ADMIN.password);
      
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
      
      user = HARDCODED_ADMIN;
    } else {
      // Check in-memory users
      const users = getInMemoryUsers();
      user = users.find(u => u.email === email);
      
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role || 'user'
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            role: user.role || 'user',
            profilePicture: user.profilePicture
          }
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    let user = null;
    
    // Check if admin
    if (req.user.id === HARDCODED_ADMIN.id) {
      user = HARDCODED_ADMIN;
    } else {
      // Check in-memory users
      const users = getInMemoryUsers();
      user = users.find(u => u.id === req.user.id);
      
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
    }
    
    // Return user without password
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// In-memory user storage (temporary)
let inMemoryUsers = [];

const getInMemoryUsers = () => {
  return [...inMemoryUsers];
};

const addUserToMemory = (user) => {
  inMemoryUsers.push(user);
};

// Initialize with some demo users if needed
const initializeDemoUsers = () => {
  if (inMemoryUsers.length === 0) {
    // Add admin to memory for consistency
    inMemoryUsers.push(HARDCODED_ADMIN);
    
    // Add some demo users
    const demoUsers = [
      {
        id: 'user-001',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: bcrypt.hashSync('password123', 10),
        profilePicture: {
          url: '/default-avatar.png',
          publicId: ''
        },
        role: 'user',
        isActive: true,
        isVerified: true,
        createdAt: new Date('2024-01-01'),
        friends: [],
        pendingFriendRequests: [],
        sentFriendRequests: []
      },
      {
        id: 'user-002',
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        password: bcrypt.hashSync('password123', 10),
        profilePicture: {
          url: '/default-avatar.png',
          publicId: ''
        },
        role: 'user',
        isActive: true,
        isVerified: true,
        createdAt: new Date('2024-01-02'),
        friends: [],
        pendingFriendRequests: [],
        sentFriendRequests: []
      }
    ];
    
    demoUsers.forEach(user => inMemoryUsers.push(user));
  }
};

// Initialize on server start
initializeDemoUsers();

module.exports = router;