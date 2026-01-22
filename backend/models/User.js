const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  campaignsCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }],
  campaignsSupported: [{
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    amount: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['contribution', 'milestone', 'success', 'refund', 'message']
    },
    message: String,
    read: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  emailNotifications: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ walletAddress: 1 });
userSchema.index({ email: 1 });

// Virtual for campaign count
userSchema.virtual('campaignCount').get(function() {
  return this.campaignsCreated.length;
});

// Method to add notification
userSchema.methods.addNotification = function(type, message) {
  this.notifications.push({ type, message });
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;