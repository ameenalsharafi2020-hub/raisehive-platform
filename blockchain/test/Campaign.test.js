const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("RaiseHive Crowdfunding Platform", function () {
  let factory;
  let campaign;
  let owner;
  let creator;
  let contributor1;
  let contributor2;

  const GOAL_AMOUNT = ethers.utils.parseEther("10");
  const DURATION_DAYS = 30;
  const CONTRIBUTION_1 = ethers.utils.parseEther("3");
  const CONTRIBUTION_2 = ethers.utils.parseEther("5");

  beforeEach(async function () {
    [owner, creator, contributor1, contributor2] = await ethers.getSigners();

    // Deploy Factory
    const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory");
    factory = await CrowdfundingFactory.deploy();
    await factory.deployed();
  });

  describe("Factory Contract", function () {
    it("Should deploy with correct initial values", async function () {
      expect(await factory.campaignCount()).to.equal(0);
      expect(await factory.platformFee()).to.equal(250);
    });

    it("Should create a new campaign", async function () {
      const tx = await factory.connect(creator).createCampaign(
        "Test Campaign",
        "This is a test campaign",
        "https://example.com/image.jpg",
        GOAL_AMOUNT,
        DURATION_DAYS,
        ["Milestone 1", "Milestone 2"]
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CampaignCreated");

      expect(event).to.not.be.undefined;
      expect(await factory.campaignCount()).to.equal(1);
    });

    it("Should track creator campaigns", async function () {
      await factory.connect(creator).createCampaign(
        "Campaign 1",
        "Description 1",
        "image1.jpg",
        GOAL_AMOUNT,
        DURATION_DAYS,
        ["Milestone 1"]
      );

      await factory.connect(creator).createCampaign(
        "Campaign 2",
        "Description 2",
        "image2.jpg",
        GOAL_AMOUNT,
        DURATION_DAYS,
        ["Milestone 1"]
      );

      const creatorCampaigns = await factory.getCampaignsByCreator(creator.address);
      expect(creatorCampaigns.length).to.equal(2);
    });
  });

  describe("Campaign Contract", function () {
    beforeEach(async function () {
      const tx = await factory.connect(creator).createCampaign(
        "Test Campaign",
        "Test Description",
        "test.jpg",
        GOAL_AMOUNT,
        DURATION_DAYS,
        ["Milestone 1", "Milestone 2"]
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CampaignCreated");
      const campaignAddress = event.args.campaignAddress;

      const Campaign = await ethers.getContractFactory("Campaign");
      campaign = Campaign.attach(campaignAddress);
    });

    it("Should accept contributions", async function () {
      await expect(
        campaign.connect(contributor1).contribute({ value: CONTRIBUTION_1 })
      ).to.emit(campaign, "ContributionReceived");

      expect(await campaign.raisedAmount()).to.equal(CONTRIBUTION_1);
      expect(await campaign.contributions(contributor1.address)).to.equal(CONTRIBUTION_1);
    });

    it("Should mark campaign successful when goal is reached", async function () {
      await campaign.connect(contributor1).contribute({ value: CONTRIBUTION_1 });
      await campaign.connect(contributor2).contribute({ value: ethers.utils.parseEther("7") });

      expect(await campaign.isSuccessful()).to.be.true;
    });

    it("Should allow creator to withdraw funds after successful campaign", async function () {
      // Contribute to meet goal
      await campaign.connect(contributor1).contribute({ value: GOAL_AMOUNT });

      // Fast forward time past deadline
      await time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);

      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);

      await campaign.connect(creator).withdrawFunds();

      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);

      expect(creatorBalanceAfter).to.be.gt(creatorBalanceBefore);
      expect(await campaign.fundsClaimed()).to.be.true;
    });

    it("Should allow refunds for failed campaigns", async function () {
      await campaign.connect(contributor1).contribute({ value: CONTRIBUTION_1 });

      // Fast forward time past deadline
      await time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);

      const balanceBefore = await ethers.provider.getBalance(contributor1.address);

      await expect(
        campaign.connect(contributor1).requestRefund()
      ).to.emit(campaign, "RefundIssued");

      const balanceAfter = await ethers.provider.getBalance(contributor1.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should not allow creator to contribute", async function () {
      await expect(
        campaign.connect(creator).contribute({ value: CONTRIBUTION_1 })
      ).to.be.revertedWith("Creator cannot contribute");
    });

    it("Should allow creator to complete milestones", async function () {
      await expect(
        campaign.connect(creator).completeMilestone(0)
      ).to.emit(campaign, "MilestoneCompleted");

      expect(await campaign.milestoneCompleted(0)).to.be.true;
      expect(await campaign.currentMilestone()).to.equal(1);
    });

    it("Should allow creator to cancel campaign", async function () {
      await expect(
        campaign.connect(creator).cancelCampaign("Test cancellation")
      ).to.emit(campaign, "CampaignCancelled");

      expect(await campaign.isActive()).to.be.false;
    });

    it("Should return correct campaign stats", async function () {
      await campaign.connect(contributor1).contribute({ value: CONTRIBUTION_1 });

      const stats = await campaign.getStats();

      expect(stats._raisedAmount).to.equal(CONTRIBUTION_1);
      expect(stats._goalAmount).to.equal(GOAL_AMOUNT);
      expect(stats._contributorCount).to.equal(1);
      expect(stats._percentageFunded).to.equal(30);
    });
  });
});