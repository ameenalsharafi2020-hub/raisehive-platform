const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const logger = require('../utils/logger');

// Get user by wallet address
router.get('/:address',
  [
    param('address').isEthereumAddress(),
    validate
  ],
  async (req, res) => {
    try {
      const user = await User.findOne({
        walletAddress: req.params.address.toLowerCase()
      })
        .populate('campaignsCreated')
        .select('-__v');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user'
      });
    }
  }
);

// Get user's created campaigns
router.get('/:address/campaigns',
  [
    param('address').isEthereumAddress(),
    validate
  ],
  async (req, res) => {
    try {
      const campaigns = await Campaign.find({
        creator: req.params.address.toLowerCase()
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: campaigns,
        count: campaigns.length
      });
    } catch (error) {
      logger.error('Get user campaigns error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching campaigns'
      });
    }
  }
);

// Get user's supported campaigns
router.get('/:address/supported',
  [
    param('address').isEthereumAddress(),
    validate
  ],
  async (req, res) => {
    try {
      const user = await User.findOne({
        walletAddress: req.params.address.toLowerCase()
      }).populate('campaignsSupported.campaignId');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user.campaignsSupported
      });
    } catch (error) {
      logger.error('Get supported campaigns error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching supported campaigns'
      });
    }
  }
);

// Get user notifications
router.get('/:address/notifications',
  [
    param('address').isEthereumAddress(),
    query('unreadOnly').optional().isBoolean(),
    validate
  ],
  async (req, res) => {
    try {
      const user = await User.findOne({
        walletAddress: req.params.address.toLowerCase()
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      let notifications = user.notifications;

      if (req.query.unreadOnly === 'true') {
        notifications = notifications.filter(n => !n.read);
      }

      res.json({
        success: true,
        data: notifications.sort((a, b) => b.timestamp - a.timestamp)
      });
    } catch (error) {
      logger.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching notifications'
      });
    }
  }
);

module.exports = router;