// server/routes/auth.js - DEBUG VERSION
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// SUPER SIMPLE ADMIN - Let's make this foolproof
const ADMIN_USER = {
  id: 'admin-001',
  firstName: 'Kenyan',
  lastName: 'Jaguar',
  username: 'admin',
  email: 'trustynewsnetworkkenya@gmail.com',
  password: 'Derrick9786',
  role: 'admin'
};

// Keep only admin for now
let users = [ADMIN_USER];

// SIMPLE LOGIN - No validation, just check
router.post('/login', (req, res) => {
  console.log('=== LOGIN ATTEMPT ===');
  console.log('Request body:', JSON.stringify(req.body));
  console.log('Email received:', req.body.email);
  console.log('Password received:', req.body.password ? '***' : 'MISSING');
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password required',
      received: { email: !!email, password: !!password }
    });
  }
  
  // Case insensitive check
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase().trim()
  );
  
  console.log('Found user:', user ? 'YES' : 'NO');
  
  if (!user) {
    console.log('❌ User not found in database');
    console.log('Available users:', users.map(u => u.email));
    return res.status(400).json({ 
      success: false, 
      error: 'User not found',
      availableUsers: users.map(u => ({ email: u.email, role: u.role }))
    });
  }
  
  console.log('Expected password:', user.password);
  console.log('Received password:', password);
  console.log('Password match:', user.password === password);
  
  if (user.password !== password) {
    console.log('❌ Password mismatch');
    return res.status(400).json({ 
      success: false, 
      error: 'Incorrect password',
      hint: `Expected: ${user.password}, Got: ${password}`
    });
  }
  
  console.log('✅ Login successful!');
  
  // Create token
  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role 
    },
    'test-secret-key-123',
    { expiresIn: '30d' }
  );
  
  res.json({
    success: true,
    message: 'Login successful!',
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      username: user.username
    }
  });
});

// Test endpoint to see what's registered
router.get('/debug', (req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
    adminCredentials: {
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
      note: 'Use exactly these values'
    },
    allUsers: users.map(u => ({
      email: u.email,
      role: u.role,
      passwordHint: `First 3 chars: ${u.password.substring(0, 3)}...`
    })),
    instructions: 'POST to /api/auth/login with above credentials'
  });
});

// Simple register endpoint
router.post('/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  // Check if already exists
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ 
      success: false, 
      error: 'User already exists' 
    });
  }
  
  const newUser = {
    id: `user-${Date.now()}`,
    firstName: firstName || 'User',
    lastName: lastName || 'Test',
    username: email.split('@')[0],
    email,
    password,
    role: 'user'
  };
  
  users.push(newUser);
  
  // Create token
  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email, role: newUser.role },
    'test-secret-key-123',
    { expiresIn: '30d' }
  );
  
  res.json({
    success: true,
    message: 'Registration successful',
    token,
    user: {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      username: newUser.username
    }
  });
});

module.exports = router;