const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  creator: {
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
  coverPhoto: {
    url: String,
    publicId: String
  },
  type: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  category: {
    type: String,
    enum: [
      'music', 'sports', 'arts', 'business', 'food', 
      'charity', 'education', 'social', 'other'
    ],
    default: 'social'
  },
  dateTime: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    timezone: String
  },
  location: {
    type: {
      type: String,
      enum: ['physical', 'online', 'hybrid'],
      default: 'physical'
    },
    address: String,
    venue: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    onlineLink: String,
    meetingId: String
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['going', 'interested', 'not-going'],
      default: 'interested'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedAt: Date,
    respondedAt: Date
  }],
  invites: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  cohosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  discussions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    media: [{
      url: String,
      type: String
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      createdAt: Date
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tickets: {
    available: Boolean,
    price: Number,
    currency: String,
    quantity: Number,
    sold: Number,
    saleStart: Date,
    saleEnd: Date
  },
  isCancelled: {
    type: Boolean,
    default: false
  },
  cancellationReason: String,
  maxAttendees: Number,
  tags: [String],
  metadata: {
    views: Number,
    shares: Number,
    saves: Number
  }
}, {
  timestamps: true
});

eventSchema.index({ creator: 1, createdAt: -1 });
eventSchema.index({ 'dateTime.start': 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Event', eventSchema);