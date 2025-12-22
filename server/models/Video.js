const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  videoFile: {
    url: String,
    publicId: String,
    duration: Number,
    resolution: String,
    format: String,
    size: Number,
    thumbnail: String
  },
  privacy: {
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'public'
  },
  category: {
    type: String,
    enum: [
      'entertainment', 'music', 'gaming', 'sports', 'education',
      'news', 'comedy', 'lifestyle', 'technology', 'other'
    ],
    default: 'entertainment'
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    likes: Number,
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      likes: Number,
      createdAt: Date
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  },
  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  monetization: {
    enabled: Boolean,
    type: {
      type: String,
      enum: ['ads', 'subscription', 'sponsorship']
    },
    revenue: Number
  },
  liveStream: {
    isLive: Boolean,
    streamKey: String,
    viewerCount: Number,
    startedAt: Date,
    endedAt: Date
  },
  analytics: {
    watchTime: Number,
    averageViewDuration: Number,
    audienceRetention: [Number],
    demographics: {
      ages: Map,
      genders: Map,
      countries: Map
    }
  },
  isProcessing: {
    type: Boolean,
    default: false
  },
  processingProgress: Number,
  isCopyrighted: Boolean,
  copyrightClaims: [{
    claimant: String,
    reason: String,
    action: String,
    resolved: Boolean
  }]
}, {
  timestamps: true
});

videoSchema.index({ uploader: 1, createdAt: -1 });
videoSchema.index({ category: 1, createdAt: -1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ views: -1 });
videoSchema.index({ 'liveStream.isLive': 1 });

module.exports = mongoose.model('Video', videoSchema);