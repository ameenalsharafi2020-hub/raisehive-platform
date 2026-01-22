const { ethers } = require('ethers');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const logger = require('../utils/logger');

// Contract ABIs
const FACTORY_ABI = require('../contracts/CrowdfundingFactory.json');
const CAMPAIGN_ABI = require('../contracts/Campaign.json');

class BlockchainService {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    this.factoryAddress = process.env.FACTORY_CONTRACT_ADDRESS;
    
    if (this.factoryAddress) {
      this.factoryContract = new ethers.Contract(
        this.factoryAddress,
        FACTORY_ABI.abi,
        this.provider
      );
    }
  }

  // Listen to CampaignCreated events
  async listenToCampaignCreated() {
    try {
      logger.info('👂 Listening to CampaignCreated events...');

      this.factoryContract.on('CampaignCreated', async (
        campaignId,
        campaignAddress,
        creator,
        goalAmount,
        deadline,
        event
      ) => {
        logger.info(`📢 New Campaign Created: ${campaignAddress}`);

        try {
          // Check if campaign already exists
          const existingCampaign = await Campaign.findOne({
            contractAddress: campaignAddress.toLowerCase()
          });

          if (existingCampaign) {
            logger.info(`Campaign already exists in database: ${campaignAddress}`);
            return;
          }

          // Get campaign details from blockchain
          const campaignContract = new ethers.Contract(
            campaignAddress,
            CAMPAIGN_ABI.abi,
            this.provider
          );

          const [title, description, imageUrl] = await Promise.all([
            campaignContract.title(),
            campaignContract.description(),
            campaignContract.imageUrl()
          ]);

          // Create campaign in database
          await Campaign.create({
            contractAddress: campaignAddress.toLowerCase(),
            campaignId: campaignId.toNumber(),
            creator: creator.toLowerCase(),
            title,
            description,
            imageUrl,
            goalAmount: goalAmount.toString(),
            deadline: new Date(deadline.toNumber() * 1000),
            isActive: true
          });

          logger.info(`✅ Campaign saved to database: ${campaignAddress}`);
        } catch (error) {
          logger.error('Error processing CampaignCreated event:', error);
        }
      });
    } catch (error) {
      logger.error('Error setting up campaign listener:', error);
    }
  }

  // Sync campaign data from blockchain
  async syncCampaign(campaignAddress) {
    try {
      const campaign = await Campaign.findOne({
        contractAddress: campaignAddress.toLowerCase()
      });

      if (!campaign) {
        logger.error(`Campaign not found: ${campaignAddress}`);
        return;
      }

      const campaignContract = new ethers.Contract(
        campaignAddress,
        CAMPAIGN_ABI.abi,
        this.provider
      );

      // Get on-chain data
      const [raisedAmount, isActive, isSuccessful] = await Promise.all([
        campaignContract.raisedAmount(),
        campaignContract.isActive(),
        campaignContract.isSuccessful()
      ]);

      // Update database
      campaign.raisedAmount = raisedAmount.toString();
      campaign.isActive = isActive;
      campaign.isSuccessful = isSuccessful;

      await campaign.save();

      logger.info(`✅ Campaign synced: ${campaignAddress}`);
      return campaign;
    } catch (error) {
      logger.error('Error syncing campaign:', error);
      throw error;
    }
  }

  // Listen to contribution events
  async listenToContributions(campaignAddress) {
    try {
      const campaignContract = new ethers.Contract(
        campaignAddress,
        CAMPAIGN_ABI.abi,
        this.provider
      );

      campaignContract.on('ContributionReceived', async (
        contributor,
        amount,
        totalRaised,
        event
      ) => {
        logger.info(`💰 New contribution: ${amount.toString()} from ${contributor}`);

        try {
          const campaign = await Campaign.findOne({
            contractAddress: campaignAddress.toLowerCase()
          });

          if (!campaign) return;

          // Add contributor
          const existingContributor = campaign.contributors.find(
            c => c.address.toLowerCase() === contributor.toLowerCase()
          );

          if (existingContributor) {
            existingContributor.amount = (
              BigInt(existingContributor.amount) + BigInt(amount.toString())
            ).toString();
          } else {
            campaign.contributors.push({
              address: contributor.toLowerCase(),
              amount: amount.toString(),
              timestamp: new Date(),
              transactionHash: event.transactionHash
            });
            campaign.contributorCount += 1;
          }

          campaign.raisedAmount = totalRaised.toString();
          await campaign.save();

          // Update user's supported campaigns
          await User.findOneAndUpdate(
            { walletAddress: contributor.toLowerCase() },
            {
              $push: {
                campaignsSupported: {
                  campaignId: campaign._id,
                  amount: amount.toString(),
                  timestamp: new Date()
                }
              }
            },
            { upsert: true }
          );

          logger.info(`✅ Contribution recorded in database`);
        } catch (error) {
          logger.error('Error processing contribution event:', error);
        }
      });
    } catch (error) {
      logger.error('Error setting up contribution listener:', error);
    }
  }

  // Sync all campaigns
  async syncAllCampaigns() {
    try {
      logger.info('🔄 Syncing all campaigns...');

      const campaigns = await Campaign.find({ isActive: true });

      for (const campaign of campaigns) {
        try {
          await this.syncCampaign(campaign.contractAddress);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        } catch (error) {
          logger.error(`Error syncing campaign ${campaign.contractAddress}:`, error);
        }
      }

      logger.info('✅ All campaigns synced');
    } catch (error) {
      logger.error('Error syncing all campaigns:', error);
    }
  }

  // Get campaign stats from blockchain
  async getCampaignStats(campaignAddress) {
    try {
      const campaignContract = new ethers.Contract(
        campaignAddress,
        CAMPAIGN_ABI.abi,
        this.provider
      );

      const stats = await campaignContract.getStats();

      return {
        raisedAmount: stats._raisedAmount.toString(),
        goalAmount: stats._goalAmount.toString(),
        contributorCount: stats._contributorCount.toNumber(),
        daysLeft: stats._daysLeft.toNumber(),
        percentageFunded: stats._percentageFunded.toNumber()
      };
    } catch (error) {
      logger.error('Error getting campaign stats:', error);
      throw error;
    }
  }

  // Check if address has contributed
  async hasContributed(campaignAddress, userAddress) {
    try {
      const campaignContract = new ethers.Contract(
        campaignAddress,
        CAMPAIGN_ABI.abi,
        this.provider
      );

      const contribution = await campaignContract.getContribution(userAddress);
      return contribution.gt(0);
    } catch (error) {
      logger.error('Error checking contribution:', error);
      return false;
    }
  }
}

module.exports = new BlockchainService();