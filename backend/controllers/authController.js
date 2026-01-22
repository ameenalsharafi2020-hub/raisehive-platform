const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const logger = require('../utils/logger');

// Store nonces temporarily (in production, use Redis)
const nonces = new Map();

// Clean old nonces every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (let [address, data] of nonces.entries()) {
    if (now - data.timestamp > 5 * 60 * 1000) {
      nonces.delete(address);
    }
  }
}, 5 * 60 * 1000);

// Generate JWT token
const generateToken = (walletAddress) => {
  return jwt.sign(
    { walletAddress },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Get nonce for wallet signature
exports.getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Generate random nonce
    const nonce = Math.floor(Math.random() * 1000000).toString();
    
    // Store nonce
    nonces.set(normalizedAddress, {
      nonce,
      timestamp: Date.now()
    });

    const message = `Sign this message to authenticate with RaiseHive.\n\nNonce: ${nonce}`;

    logger.info(`Nonce generated for ${normalizedAddress}`);

    res.json({
      success: true,
      data: {
        message,
        nonce
      }
    });
  } catch (error) {
    logger.error('Get nonce error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating nonce'
    });
  }
};

// Authenticate with wallet signature
exports.authenticateWallet = async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    logger.info(`Authenticating wallet: ${normalizedAddress}`);

    // Verify signature
    let recoveredAddress;
    try {
      recoveredAddress = ethers.utils.verifyMessage(message, signature);
    } catch (error) {
      logger.error('Signature verification failed:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    if (recoveredAddress.toLowerCase() !== normalizedAddress) {
      logger.error('Address mismatch:', { recovered: recoveredAddress, provided: normalizedAddress });
      return res.status(401).json({
        success: false,
        message: 'Signature verification failed'
      });
    }

    // Verify nonce
    const storedNonce = nonces.get(normalizedAddress);
    if (!storedNonce) {
      return res.status(401).json({
        success: false,
        message: 'Nonce expired or not found. Please try again.'
      });
    }

    // Check if nonce matches
    if (!message.includes(storedNonce.nonce)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid nonce'
      });
    }

    // Delete used nonce
    nonces.delete(normalizedAddress);

    // Find or create user
    let user = await User.findOne({ walletAddress: normalizedAddress });

    if (!user) {
      user = await User.create({
        walletAddress: normalizedAddress
      });
      logger.info(`New user created: ${normalizedAddress}`);
    } else {
      logger.info(`User logged in: ${normalizedAddress}`);
    }

    // Generate token
    const token = generateToken(normalizedAddress);

    res.json({
      success: true,
      data: {
        token,
        user: {
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    logger.error('Wallet authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// ... rest of the code

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.user.walletAddress })
      .populate('campaignsCreated')
      .select('-__v');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, bio, profileImage } = req.body;

    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (bio) updates.bio = bio;
    if (profileImage) updates.profileImage = profileImage;

    const user = await User.findOneAndUpdate(
      { walletAddress: req.user.walletAddress },
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};