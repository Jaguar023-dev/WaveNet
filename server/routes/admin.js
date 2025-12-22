// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { admin } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', admin, (req, res) => {
  res.json({
    message: 'Welcome to Admin Dashboard',
    admin: {
      name: 'Kenyan Jaguar',
      email: 'trustynewsnetworkkenya@gmail.com',
      role: 'admin'
    },
    stats: {
      totalUsers: 50,
      activeUsers: 42,
      totalPosts: 120,
      totalGroups: 8
    }
  });
});

// @route   GET /api/admin/users
// @desc    Get all users (admin view)
// @access  Private (Admin only)
router.get('/users', admin, (req, res) => {
  // Return mock users for now
  res.json({
    users: [
      {
        id: 'user-001',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        status: 'active'
      },
      {
        id: 'user-002',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        status: 'active'
      },
      {
        id: 'admin-001',
        name: 'Kenyan Jaguar',
        email: 'trustynewsnetworkkenya@gmail.com',
        role: 'admin',
        status: 'active'
      }
    ]
  });
});

module.exports = router;