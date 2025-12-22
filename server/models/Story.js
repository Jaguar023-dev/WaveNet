const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video']
    },
    url: String,
    publicId: String,
    duration: Number,
    order: Number
  }],
  caption: String,
  location: String,
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  hashtags: [String],
  privacy: {
    type: String,
    enum: ['public', 'friends', 'close-friends', 'custom'],
    default: 'friends'
  },
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    index: { expires: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metrics: {
    replies: Number,
    shares: Number,
    saves: Number
  }
}, {
  timestamps: true
});

storySchema.index({ user: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Story', storySchema);