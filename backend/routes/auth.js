const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Register/Login with wallet
router.post('/wallet',
  [
    body('walletAddress').isEthereumAddress(),
    body('signature').notEmpty(),
    body('message').notEmpty(),
    validate
  ],
  authController.authenticateWallet
);

// Get nonce for wallet signature
router.post('/nonce',
  [
    body('walletAddress').isEthereumAddress(),
    validate
  ],
  authController.getNonce
);

// Update profile
router.put('/profile',
  authenticate,
  [
    body('username').optional().trim().isLength({ min: 3, max: 30 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('bio').optional().isLength({ max: 500 }),
    validate
  ],
  authController.updateProfile
);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Logout
router.post('/logout', authenticate, authController.logout);

module.exports = router;