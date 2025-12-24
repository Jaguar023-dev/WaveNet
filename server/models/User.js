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

// ==============================================
// DATABASE INDEXES FOR OPTIMAL PERFORMANCE
// ==============================================

// ===== EXISTING INDEXES =====
// Basic indexes for common queries
userSchema.index({ username: 1 }); // Already unique, but index for searches
userSchema.index({ email: 1 });    // Already unique, but index for searches

// ===== VERIFICATION INDEXES =====

// 1. Verification status queries (admin dashboard, user lookup)
userSchema.index({ isVerified: 1 }); // For finding verified/unverified users

// 2. Verification request status queries (admin panel)
userSchema.index({ 'verificationRequest.status': 1 }); // For pending/approved/rejected requests

// 3. Time-based verification queries
userSchema.index({ 'verificationRequest.submittedAt': -1 }); // Latest verification requests first
userSchema.index({ 'verificationRequest.reviewedAt': -1 });  // Recently reviewed requests
userSchema.index({ verifiedSince: -1 });                     // Recently verified users

// 4. Combined indexes for common admin queries
userSchema.index({ 
  'verificationRequest.status': 1,
  'verificationRequest.submittedAt': -1 
}); // Status with date sorting

userSchema.index({
  isVerified: 1,
  verifiedSince: -1
}); // Verified users sorted by verification date

// 5. Verification type/category queries
userSchema.index({ verificationType: 1 }); // Filter by verification category

// 6. Compound index for admin verification dashboard
userSchema.index({
  role: 1,
  'verificationRequest.status': 1,
  'verificationRequest.submittedAt': -1
}, { 
  name: 'admin_verification_dashboard' 
}); // For admin panel queries

// 7. Index for user's own verification status
userSchema.index({
  _id: 1,
  isVerified: 1,
  'verificationRequest.status': 1
}, {
  name: 'user_verification_status'
}); // Quick lookup of user's verification state

// ===== ROLE AND ADMINISTRATION INDEXES =====
userSchema.index({ role: 1 }); // For finding admins/users
userSchema.index({ 
  role: 1, 
  isVerified: 1 
}); // Verified admins, etc.

// ===== USER ACTIVITY INDEXES =====
userSchema.index({ createdAt: -1 }); // Newest users
userSchema.index({ updatedAt: -1 }); // Recently active users
userSchema.index({ lastSeen: -1 });  // Recently online users
userSchema.index({ isOnline: 1 });   // Currently online users

// ===== SOCIAL FEATURES INDEXES =====
userSchema.index({ 'friends': 1 }); // Friend list queries

// ===== COMPOUND INDEXES FOR COMMON QUERIES =====

// For user search with verification status
userSchema.index({
  username: 'text',
  'profile.firstName': 'text',
  'profile.lastName': 'text',
  isVerified: 1
}, {
  name: 'user_search_with_verification',
  weights: {
    username: 10,
    'profile.firstName': 5,
    'profile.lastName': 5
  }
});

// For admin user management
userSchema.index({
  role: 1,
  isVerified: 1,
  createdAt: -1
}, {
  name: 'admin_user_management'
});

// For verification analytics
userSchema.index({
  isVerified: 1,
  verificationType: 1,
  verifiedSince: -1
}, {
  name: 'verification_analytics'
});

// For pending verification requests with user info
userSchema.index({
  'verificationRequest.status': 1,
  username: 1,
  email: 1
}, {
  name: 'pending_verification_lookup'
});

// ===== TEXT INDEXES FOR SEARCH =====
// Only add if you need text search capabilities
if (!userSchema.indexes().some(idx => idx[0].username === 'text')) {
  userSchema.index({
    username: 'text',
    email: 'text',
    'profile.firstName': 'text',
    'profile.lastName': 'text',
    'profile.bio': 'text',
    'profile.location': 'text'
  }, {
    name: 'user_text_search',
    weights: {
      username: 10,
      email: 5,
      'profile.firstName': 7,
      'profile.lastName': 7,
      'profile.bio': 3,
      'profile.location': 2
    }
  });
}

// ===== PARTIAL INDEXES FOR OPTIMIZATION =====
// These only index documents that match the filter condition

// Only index pending verification requests (saves space)
userSchema.index(
  { 'verificationRequest.submittedAt': -1 },
  { 
    name: 'pending_verification_requests',
    partialFilterExpression: { 
      'verificationRequest.status': 'pending' 
    }
  }
);

// Only index verified users
userSchema.index(
  { verifiedSince: -1 },
  { 
    name: 'verified_users_only',
    partialFilterExpression: { 
      isVerified: true 
    }
  }
);

// ===== INDEX FOR STATS QUERIES =====
userSchema.index(
  { 
    isVerified: 1,
    verificationType: 1,
    'verificationRequest.status': 1,
    createdAt: 1 
  },
  { 
    name: 'verification_statistics' 
  }
);

module.exports = mongoose.model('User', UserSchema);