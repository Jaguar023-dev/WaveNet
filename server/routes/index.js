// server/routes/index.js
const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./auth');
const userRoutes = require('./users');
const postRoutes = require('./posts');
const groupRoutes = require('./groups');
const messageRoutes = require('./messages');
const notificationRoutes = require('./notifications');
const storyRoutes = require('./stories');
const marketplaceRoutes = require('./marketplace');
const eventRoutes = require('./events');
const videoRoutes = require('./videos');
const pageRoutes = require('./pages');

// ADDED: Verification routes
const verificationRoutes = require('./verification');

// Use routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/groups', groupRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/stories', storyRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/events', eventRoutes);
router.use('/videos', videoRoutes);
router.use('/pages', pageRoutes);

// ADDED: Use verification routes
router.use('/verification', verificationRoutes);

module.exports = router;