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
      totalGroups: 8,
      totalMessages: 345,
      onlineUsers: 15
    },
    recentActivity: [
      {
        type: 'user_registration',
        user: 'John Doe',
        time: '2 hours ago'
      },
      {
        type: 'post_created',
        user: 'Jane Smith',
        time: '4 hours ago'
      },
      {
        type: 'group_created',
        user: 'Mike Johnson',
        time: '1 day ago'
      }
    ]
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
        id: 'admin-001',
        firstName: 'Kenyan',
        lastName: 'Jaguar',
        username: 'kenyan_jaguar',
        email: 'trustynewsnetworkkenya@gmail.com',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-01',
        lastLogin: new Date().toISOString()
      },
      {
        id: 'user-001',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        role: 'user',
        status: 'active',
        createdAt: '2024-01-01',
        lastLogin: '2024-01-10'
      },
      {
        id: 'user-002',
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        role: 'user',
        status: 'active',
        createdAt: '2024-01-02',
        lastLogin: '2024-01-09'
      },
      {
        id: 'user-003',
        firstName: 'Mike',
        lastName: 'Johnson',
        username: 'mikej',
        email: 'mike@example.com',
        role: 'user',
        status: 'inactive',
        createdAt: '2024-01-03',
        lastLogin: '2024-01-05'
      }
    ],
    pagination: {
      page: 1,
      total: 4,
      perPage: 20
    }
  });
});

// @route   GET /api/admin/stats
// @desc    Get detailed admin statistics
// @access  Private (Admin only)
router.get('/stats', admin, (req, res) => {
  res.json({
    overview: {
      totalUsers: 150,
      newUsersToday: 12,
      activeSessions: 45,
      serverUptime: process.uptime()
    },
    activity: {
      postsCreated: 234,
      commentsPosted: 567,
      likesGiven: 1234,
      messagesSent: 890
    },
    system: {
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
      platform: process.platform,
      nodeVersion: process.version,
      uptime: process.uptime()
    }
  });
});

// @route   POST /api/admin/users/:id/ban
// @desc    Ban a user
// @access  Private (Admin only)
router.post('/users/:id/ban', admin, (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  res.json({
    message: `User ${id} has been banned`,
    reason: reason || 'No reason provided',
    bannedBy: 'Kenyan Jaguar',
    bannedAt: new Date().toISOString()
  });
});

// @route   POST /api/admin/users/:id/unban
// @desc    Unban a user
// @access  Private (Admin only)
router.post('/users/:id/unban', admin, (req, res) => {
  const { id } = req.params;
  
  res.json({
    message: `User ${id} has been unbanned`,
    unbannedBy: 'Kenyan Jaguar',
    unbannedAt: new Date().toISOString()
  });
});

// @route   GET /api/admin/settings
// @desc    Get admin settings
// @access  Private (Admin only)
router.get('/settings', admin, (req, res) => {
  res.json({
    siteSettings: {
      siteName: 'WaveNet',
      siteDescription: 'Social Media Platform',
      maintenanceMode: false,
      registrationOpen: true,
      maxFileSize: '10MB',
      allowedFileTypes: ['jpg', 'png', 'gif', 'mp4', 'pdf']
    },
    emailSettings: {
      enabled: true,
      smtpHost: 'smtp.gmail.com',
      fromEmail: 'noreply@wavenet.com'
    },
    securitySettings: {
      requireEmailVerification: false,
      requireStrongPasswords: true,
      maxLoginAttempts: 5,
      sessionTimeout: 24 // hours
    }
  });
});

module.exports = router;