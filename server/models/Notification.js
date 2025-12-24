// server/models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      // Existing notification types
      'friend_request',
      'friend_accept', 
      'like',
      'comment',
      'share',
      'mention',
      'message',
      'group_invite',
      'event_invite',
      'system',
      
      // ADDED: Verification notification types
      'verification_request',         // New verification request submitted
      'verification_approved',        // User's verification request was approved
      'verification_rejected',        // User's verification request was rejected
      'verification_approved_admin',  // Admin approved someone's verification
      'verification_review_required', // Admin needs to review verification
      'verification_reminder',        // Reminder for incomplete verification
      'admin_action'                  // General admin action notification
    ],
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: ''
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // ADDED: Metadata field for additional notification data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

// Pre-save middleware to ensure message is present
NotificationSchema.pre('save', function(next) {
  // Generate default message if not provided
  if (!this.message || this.message.trim() === '') {
    switch (this.type) {
      case 'verification_request':
        this.message = 'New verification request submitted';
        break;
      case 'verification_approved':
        this.message = 'Your account has been verified!';
        this.link = '/verification';
        break;
      case 'verification_rejected':
        this.message = 'Your verification request was reviewed';
        this.link = '/verification';
        break;
      case 'verification_approved_admin':
        this.message = 'You approved a verification request';
        this.link = '/admin/verification';
        break;
      case 'verification_review_required':
        this.message = 'New verification request needs review';
        this.link = '/admin/verification';
        break;
      default:
        // For existing types, keep existing behavior
        break;
    }
  }
  next();
});

// Static method for creating verification notifications
NotificationSchema.statics.createVerificationNotification = async function(data) {
  const {
    recipient,
    sender,
    type,
    message = '',
    link = '',
    metadata = {}
  } = data;

  // Validate verification notification type
  const verificationTypes = [
    'verification_request',
    'verification_approved',
    'verification_rejected',
    'verification_approved_admin',
    'verification_review_required',
    'verification_reminder'
  ];

  if (!verificationTypes.includes(type)) {
    throw new Error('Invalid verification notification type');
  }

  const notification = new this({
    recipient,
    sender,
    type,
    message,
    link,
    metadata,
    read: false
  });

  await notification.save();
  return notification;
};

// Instance method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Virtual for formatted notification title based on type
NotificationSchema.virtual('title').get(function() {
  const titles = {
    'verification_request': 'Verification Request',
    'verification_approved': 'Account Verified 🎉',
    'verification_rejected': 'Verification Update',
    'verification_approved_admin': 'Verification Approved',
    'verification_review_required': 'Review Required',
    'verification_reminder': 'Verification Reminder'
  };
  
  return titles[this.type] || 'Notification';
});

// Virtual for notification icon based on type
NotificationSchema.virtual('icon').get(function() {
  const icons = {
    'verification_request': '📋',
    'verification_approved': '✅',
    'verification_rejected': '❌',
    'verification_approved_admin': '👑',
    'verification_review_required': '👀',
    'verification_reminder': '⏰'
  };
  
  return icons[this.type] || '🔔';
});

// Virtual for notification color based on type
NotificationSchema.virtual('color').get(function() {
  const colors = {
    'verification_request': '#ffb300',    // Amber
    'verification_approved': '#4caf50',    // Green
    'verification_rejected': '#f44336',    // Red
    'verification_approved_admin': '#2196f3', // Blue
    'verification_review_required': '#9c27b0', // Purple
    'verification_reminder': '#ff9800'     // Orange
  };
  
  return colors[this.type] || '#666';
});

module.exports = mongoose.model('Notification', NotificationSchema);