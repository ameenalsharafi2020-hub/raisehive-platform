const express = require('express');
const router = express.Router();
const { param, body } = require('express-validator');
const { validate } = require('../middleware/validate');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

// Sync specific campaign
router.post('/sync/:address',
  [
    param('address').isEthereumAddress(),
    validate
  ],
  async (req, res) => {
    try {
      const campaign = await blockchainService.syncCampaign(req.params.address);
      
      res.json({
        success: true,
        data: campaign
      });
    } catch (error) {
      logger.error('Sync campaign error:', error);
      res.status(500).json({
        success: false,
        message: 'Error syncing campaign'
      });
    }
  }
);

// Get campaign stats from blockchain
router.get('/stats/:address',
  [
    param('address').isEthereumAddress(),
    validate
  ],
  async (req, res) => {
    try {
      const stats = await blockchainService.getCampaignStats(req.params.address);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching stats'
      });
    }
  }
);

// Check if user has contributed
router.get('/contribution/:address/:user',
  [
    param('address').isEthereumAddress(),
    param('user').isEthereumAddress(),
    validate
  ],
  async (req, res) => {
    try {
      const hasContributed = await blockchainService.hasContributed(
        req.params.address,
        req.params.user
      );
      
      res.json({
        success: true,
        data: { hasContributed }
      });
    } catch (error) {
      logger.error('Check contribution error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking contribution'
      });
    }
  }
);

module.exports = router;