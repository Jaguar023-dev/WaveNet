const mongoose = require('mongoose');

const marketplaceSchema = new mongoose.Schema({
  seller: {
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
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    negotiable: {
      type: Boolean,
      default: false
    }
  },
  category: {
    type: String,
    required: true,
    enum: [
      'vehicles', 'property', 'electronics', 'home-garden',
      'fashion', 'sports', 'hobbies', 'business', 'services'
    ]
  },
  condition: {
    type: String,
    enum: ['new', 'used-like-new', 'used-good', 'used-fair'],
    default: 'used-good'
  },
  images: [{
    url: String,
    publicId: String,
    isPrimary: Boolean
  }],
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
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
    }
  },
  delivery: {
    available: Boolean,
    cost: Number,
    methods: [String]
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'reserved', 'expired'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  inquiries: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isBoosted: {
    type: Boolean,
    default: false
  },
  boostExpiresAt: Date
}, {
  timestamps: true
});

marketplaceSchema.index({ seller: 1, createdAt: -1 });
marketplaceSchema.index({ category: 1 });
marketplaceSchema.index({ 'location.coordinates': '2dsphere' });
marketplaceSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Marketplace', marketplaceSchema);