const Campaign = require('../models/Campaign');
const User = require('../models/User');
const logger = require('../utils/logger');
const { ethers } = require('ethers');

// Get all campaigns with filtering
exports.getAllCampaigns = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      status = 'all',
      sort = 'newest'
    } = req.query;

    const skip = (page - 1) * limit;
    let query = {};
    let sortOption = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by status
    const now = new Date();
    switch (status) {
      case 'active':
        query.isActive = true;
        query.deadline = { $gt: now };
        break;
      case 'successful':
        query.isSuccessful = true;
        break;
      case 'failed':
        query.isActive = false;
        query.isSuccessful = false;
        query.deadline = { $lt: now };
        break;
    }

    // Sorting
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'ending':
        sortOption = { deadline: 1 };
        break;
      case 'popular':
        sortOption = { views: -1 };
        break;
      case 'funded':
        sortOption = { raisedAmount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const campaigns = await Campaign.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creator', 'username profileImage walletAddress');

    const total = await Campaign.countDocuments(query);

    res.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: campaigns.length,
          totalCampaigns: total
        }
      }
    });
  } catch (error) {
    logger.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaigns'
    });
  }
};

// Get featured campaigns
exports.getFeaturedCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({
      isFeatured: true,
      isActive: true,
      deadline: { $gt: new Date() }
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('creator', 'username profileImage');

    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    logger.error('Get featured campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured campaigns'
    });
  }
};

// Get trending campaigns
exports.getTrendingCampaigns = async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const campaigns = await Campaign.find({
      isActive: true,
      deadline: { $gt: new Date() },
      createdAt: { $gt: oneDayAgo }
    })
      .sort({ contributorCount: -1, views: -1 })
      .limit(10)
      .populate('creator', 'username profileImage');

    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    logger.error('Get trending campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending campaigns'
    });
  }
};

// Search campaigns
exports.searchCampaigns = async (req, res) => {
  try {
    const { q } = req.query;

    const campaigns = await Campaign.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
      .limit(20)
      .populate('creator', 'username profileImage');

    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length
    });
  } catch (error) {
    logger.error('Search campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching campaigns'
    });
  }
};

// Get campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('creator', 'username profileImage walletAddress bio');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Increment views
    await campaign.incrementViews();

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign'
    });
  }
};

// Get campaign by contract address
exports.getCampaignByAddress = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      contractAddress: req.params.address.toLowerCase()
    }).populate('creator', 'username profileImage walletAddress');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Get campaign by address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign'
    });
  }
};

// Create campaign
exports.createCampaign = async (req, res) => {
  try {
    const {
      contractAddress,
      campaignId,
      title,
      description,
      category,
      imageUrl,
      goalAmount,
      deadline,
      tags
    } = req.body;

    // Check if campaign already exists
    const existingCampaign = await Campaign.findOne({ contractAddress: contractAddress.toLowerCase() });
    if (existingCampaign) {
      return res.status(400).json({
        success: false,
        message: 'Campaign already exists'
      });
    }

    const campaign = await Campaign.create({
      contractAddress: contractAddress.toLowerCase(),
      campaignId,
      creator: req.user.walletAddress,
      title,
      description,
      category,
      imageUrl,
      goalAmount,
      deadline,
      tags: tags || []
    });

    // Update user's campaigns
    await User.findOneAndUpdate(
      { walletAddress: req.user.walletAddress },
      { $push: { campaignsCreated: campaign._id } }
    );

    logger.info(`Campaign created: ${campaign._id} by ${req.user.walletAddress}`);

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating campaign'
    });
  }
};

// Update campaign
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user is the creator
    if (campaign.creator.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }

    const allowedUpdates = ['title', 'description', 'category', 'tags', 'imageUrl', 'videoUrl'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCampaign
    });
  } catch (error) {
    logger.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating campaign'
    });
  }
};

// Add campaign update
exports.addCampaignUpdate = async (req, res) => {
  try {
    const { title, content } = req.body;
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.creator.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await campaign.addUpdate(title, content);

    res.json({
      success: true,
      message: 'Update added successfully',
      data: campaign
    });
  } catch (error) {
    logger.error('Add campaign update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding update'
    });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    campaign.comments.push({
      user: req.user.walletAddress,
      content
    });

    await campaign.save();

    res.json({
      success: true,
      message: 'Comment added successfully'
    });
  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
};

// Get campaign statistics
exports.getCampaignStats = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const stats = {
      views: campaign.views,
      contributors: campaign.contributorCount,
      raisedAmount: campaign.raisedAmount,
      goalAmount: campaign.goalAmount,
      fundingPercentage: campaign.fundingPercentage,
      daysLeft: campaign.daysLeft,
      comments: campaign.comments.length,
      updates: campaign.updates.length,
      shares: campaign.shares
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get campaign stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};