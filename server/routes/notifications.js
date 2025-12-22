// server/routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'username profilePicture firstName lastName')
      .populate('post', 'content media')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Notification.countDocuments({ recipient: req.user.id });
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id, 
      read: false 
    });
    
    res.json({
      notifications,
      page,
      pages: Math.ceil(total / limit),
      total,
      unreadCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.user.id, 
      read: false 
    });
    
    res.json({ count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    
    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    notification.read = true;
    notification.readAt = Date.now();
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { 
        $set: { 
          read: true,
          readAt: Date.now()
        } 
      }
    );
    
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    
    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    await notification.remove();
    res.json({ msg: 'Notification removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/notifications
// @desc    Clear all notifications
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ msg: 'All notifications cleared' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Helper function to create notification (not a route, for internal use)
const createNotification = async (data) => {
  try {
    const { recipient, sender, type, post, message, link } = data;
    
    const notification = new Notification({
      recipient,
      sender,
      type,
      post,
      message: message || getDefaultMessage(type, sender),
      link: link || getDefaultLink(type, post, sender),
      read: false
    });
    
    await notification.save();
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err.message);
    return null;
  }
};

// Helper functions
const getDefaultMessage = (type, sender) => {
  const senderName = sender?.username || 'Someone';
  
  switch (type) {
    case 'friend_request':
      return `${senderName} sent you a friend request`;
    case 'friend_accept':
      return `${senderName} accepted your friend request`;
    case 'like':
      return `${senderName} liked your post`;
    case 'comment':
      return `${senderName} commented on your post`;
    case 'share':
      return `${senderName} shared your post`;
    case 'mention':
      return `${senderName} mentioned you in a post`;
    case 'message':
      return `${senderName} sent you a message`;
    case 'group_invite':
      return `${senderName} invited you to join a group`;
    case 'event_invite':
      return `${senderName} invited you to an event`;
    default:
      return 'New notification';
  }
};

const getDefaultLink = (type, post, sender) => {
  switch (type) {
    case 'friend_request':
    case 'friend_accept':
      return `/profile/${sender?._id || sender}`;
    case 'like':
    case 'comment':
    case 'share':
    case 'mention':
      return `/post/${post?._id || post}`;
    case 'message':
      return `/messages/${sender?._id || sender}`;
    default:
      return '/notifications';
  }
};

// Export both router and helper function
module.exports = {
  router,
  createNotification
};