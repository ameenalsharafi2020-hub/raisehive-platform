const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const campaignController = require('../controllers/campaignController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Get all campaigns with filtering and pagination
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('category').optional().isString(),
    query('status').optional().isIn(['active', 'successful', 'failed', 'all']),
    query('sort').optional().isIn(['newest', 'ending', 'popular', 'funded']),
    validate
  ],
  campaignController.getAllCampaigns
);

// Get featured campaigns
router.get('/featured', campaignController.getFeaturedCampaigns);

// Get trending campaigns
router.get('/trending', campaignController.getTrendingCampaigns);

// Search campaigns
router.get('/search',
  [
    query('q').notEmpty().trim().escape(),
    validate
  ],
  campaignController.searchCampaigns
);

// Get campaign by ID
router.get('/:id',
  [
    param('id').isMongoId(),
    validate
  ],
  campaignController.getCampaignById
);

// Get campaign by contract address
router.get('/contract/:address',
  [
    param('address').isEthereumAddress(),
    validate
  ],
  campaignController.getCampaignByAddress
);

// Create new campaign
router.post('/',
  authenticate,
  [
    body('contractAddress').isEthereumAddress(),
    body('campaignId').isInt(),
    body('title').notEmpty().trim().isLength({ min: 5, max: 200 }),
    body('description').notEmpty().trim().isLength({ min: 20, max: 5000 }),
    body('category').isIn(['technology', 'art', 'music', 'film', 'games', 'education', 'charity', 'other']),
    body('imageUrl').isURL(),
    body('goalAmount').notEmpty(),
    body('deadline').isISO8601(),
    validate
  ],
  campaignController.createCampaign
);

// Update campaign
router.put('/:id',
  authenticate,
  [
    param('id').isMongoId(),
    body('title').optional().trim().isLength({ min: 5, max: 200 }),
    body('description').optional().trim().isLength({ min: 20, max: 5000 }),
    body('category').optional().isIn(['technology', 'art', 'music', 'film', 'games', 'education', 'charity', 'other']),
    validate
  ],
  campaignController.updateCampaign
);

// Add campaign update
router.post('/:id/updates',
  authenticate,
  [
    param('id').isMongoId(),
    body('title').notEmpty().trim().isLength({ max: 200 }),
    body('content').notEmpty().trim().isLength({ max: 2000 }),
    validate
  ],
  campaignController.addCampaignUpdate
);

// Add comment
router.post('/:id/comments',
  authenticate,
  [
    param('id').isMongoId(),
    body('content').notEmpty().trim().isLength({ max: 1000 }),
    validate
  ],
  campaignController.addComment
);

// Get campaign statistics
router.get('/:id/stats',
  [
    param('id').isMongoId(),
    validate
  ],
  campaignController.getCampaignStats
);

module.exports = router;