const cron = require('node-cron');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

// Sync campaigns every 10 minutes
const syncCampaignsJob = cron.schedule('*/10 * * * *', async () => {
  logger.info('🔄 Running scheduled campaign sync...');
  
  try {
    await blockchainService.syncAllCampaigns();
  } catch (error) {
    logger.error('Campaign sync job error:', error);
  }
}, {
  scheduled: false
});

// Check campaign deadlines every hour
const checkDeadlinesJob = cron.schedule('0 * * * *', async () => {
  logger.info('⏰ Checking campaign deadlines...');
  
  try {
    const Campaign = require('../models/Campaign');
    const User = require('../models/User');
    const emailService = require('../services/emailService');

    const now = new Date();
    
    // Find campaigns that just ended
    const endedCampaigns = await Campaign.find({
      isActive: true,
      deadline: { $lte: now },
      $or: [
        { isSuccessful: true },
        { raisedAmount: { $gte: '$goalAmount' } }
      ]
    });

    for (const campaign of endedCampaigns) {
      // Update campaign status
      campaign.isActive = false;
      
      const raised = parseFloat(campaign.raisedAmount);
      const goal = parseFloat(campaign.goalAmount);
      
      if (raised >= goal) {
        campaign.isSuccessful = true;
        
        // Send success email to creator
        const creator = await User.findOne({ walletAddress: campaign.creator });
        if (creator && creator.email && creator.emailNotifications) {
          await emailService.sendCampaignSuccessEmail(
            creator.email,
            campaign.title,
            campaign.raisedAmount
          );
        }
      }
      
      await campaign.save();
      logger.info(`Campaign ${campaign.contractAddress} status updated`);
    }
  } catch (error) {
    logger.error('Deadline check job error:', error);
  }
}, {
  scheduled: false
});

module.exports = {
  syncCampaignsJob,
  checkDeadlinesJob,
  
  startJobs: () => {
    syncCampaignsJob.start();
    checkDeadlinesJob.start();
    logger.info('✅ Cron jobs started');
  },
  
  stopJobs: () => {
    syncCampaignsJob.stop();
    checkDeadlinesJob.stop();
    logger.info('⏹️ Cron jobs stopped');
  }
};