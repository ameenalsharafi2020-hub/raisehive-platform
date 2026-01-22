const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  // Blockchain data
  contractAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  campaignId: {
    type: Number,
    required: true
  },
  
  // Basic information
  creator: {
    type: String,
    required: true,
    lowercase: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  category: {
    type: String,
    enum: ['technology', 'art', 'music', 'film', 'games', 'education', 'charity', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Media
  imageUrl: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    caption: String
  }],
  videoUrl: {
    type: String
  },
  
  // Financial details
  goalAmount: {
    type: String,
    required: true
  },
  raisedAmount: {
    type: String,
    default: '0'
  },
  currency: {
    type: String,
    default: 'ETH'
  },
  
  // Timeline
  deadline: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isSuccessful: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Milestones
  milestones: [{
    description: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  
  // Contributors
  contributors: [{
    address: {
      type: String,
      lowercase: true
    },
    amount: String,
    timestamp: Date,
    transactionHash: String
  }],
  contributorCount: {
    type: Number,
    default: 0
  },
  
  // Updates
  updates: [{
    title: String,
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Comments
  comments: [{
    user: {
      type: String,
      ref: 'User'
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    likes: [{
      type: String
    }]
  }],
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
campaignSchema.index({ contractAddress: 1 });
campaignSchema.index({ creator: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ isActive: 1, deadline: -1 });
campaignSchema.index({ isFeatured: 1 });

// Virtual for days left
campaignSchema.virtual('daysLeft').get(function() {
  const now = new Date();
  const diff = this.deadline - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for funding percentage
campaignSchema.virtual('fundingPercentage').get(function() {
  const raised = parseFloat(this.raisedAmount);
  const goal = parseFloat(this.goalAmount);
  return goal > 0 ? Math.round((raised / goal) * 100) : 0;
});

// Method to increment views
campaignSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add update
campaignSchema.methods.addUpdate = function(title, content) {
  this.updates.push({ title, content });
  return this.save();
};

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;