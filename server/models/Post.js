const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'gif']
    },
    url: String,
    publicId: String,
    thumbnail: String
  }],
  privacy: {
    type: String,
    enum: ['public', 'friends', 'only-me'],
    default: 'friends'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    name: String
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  hashtags: [String],
  feeling: {
    type: String,
    enum: ['happy', 'sad', 'excited', 'bored', 'loved', 'angry', 'grateful']
  },
  activity: String,
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
      default: 'like'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    media: [{
      type: String,
      url: String
    }],
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      type: {
        type: String,
        enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry']
      }
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  saveCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isHidden: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for better performance
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Post', postSchema);