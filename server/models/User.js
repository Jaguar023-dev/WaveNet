// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    location: String,
    website: String,
    dateOfBirth: Date,
    gender: String,
    profilePicture: {
      url: String,
      publicId: String
    },
    coverPhoto: {
      url: String,
      publicId: String
    },
    work: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      currentlyWorking: Boolean
    }],
    education: [{
      school: String,
      degree: String,
      field: String,
      startYear: Number,
      endYear: Number
    }]
  },
  
  // VERIFICATION SYSTEM FIELDS
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedSince: Date,
  verificationType: {
    type: String,
    enum: ['celebrity', 'public_figure', 'brand', 'organization', 'government', 'journalist', 'entertainer', 'sports', 'activist', null],
    default: null
  },
  verificationRequest: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'not_requested'],
      default: 'not_requested'
    },
    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String,
    supportingDocuments: [{
      documentType: String,
      url: String,
      publicId: String
    }],
    justification: String,
    category: String,
    website: String,
    followersCount: Number
  },
  // END OF VERIFICATION FIELDS
  
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    sentAt: Date
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    postVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    allowFriendRequests: {
      type: Boolean,
      default: true
    },
    allowMessages: {
      type: String,
      enum: ['everyone', 'friends', 'none'],
      default: 'everyone'
    }
  },
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  lastSeen: Date,
  isOnline: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update timestamps on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for verification queries
userSchema.index({ isVerified: 1 });
userSchema.index({ 'verificationRequest.status': 1 });
userSchema.index({ 'verificationRequest.submittedAt': -1 });
userSchema.index({ 'verificationRequest.reviewedAt': -1 });

module.exports = mongoose.model('User', userSchema);