// server/models/User.js - COMPLETE FIXED VERSION
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    select: false // Don't return password by default
  },
  profile: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    profilePicture: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    },
    coverPhoto: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    }
  },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'moderator'], 
    default: 'user' 
  },
  isActive: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  friends: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending'
    },
    date: { type: Date, default: Date.now }
  }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notifications: [{
    type: { type: String, enum: ['friend_request', 'like', 'comment', 'message'] },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastActive timestamp before save
userSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.lastActive = new Date();
  }
  next();
});

// Virtual for full name
userSchema.virtual('profile.fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`.trim();
});

// Virtual for friend count
userSchema.virtual('friendCount').get(function() {
  return this.friends.filter(friend => friend.status === 'accepted').length;
});

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  
  // Remove sensitive data
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;