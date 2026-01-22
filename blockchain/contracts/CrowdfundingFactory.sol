// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // تحديث من 0.8.19

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Campaign.sol";

/**
 * @title CrowdfundingFactory
 * @dev Factory contract to create and manage crowdfunding campaigns
 */
contract CrowdfundingFactory is Ownable, ReentrancyGuard {
    
    uint256 public campaignCount;
    uint256 public platformFee = 250; // 2.5%
    
    mapping(uint256 => address) public campaigns;
    mapping(address => uint256[]) public creatorCampaigns;
    address[] public allCampaigns;
    
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed campaignAddress,
        address indexed creator,
        uint256 goalAmount,
        uint256 deadline
    );
    
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    
    constructor() Ownable(msg.sender) {
        campaignCount = 0;
    }
    
    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _imageUrl,
        uint256 _goalAmount,
        uint256 _durationInDays,
        string[] memory _milestones
    ) external nonReentrant returns (address) {
        require(_goalAmount > 0, "Goal must be greater than 0");
        require(_durationInDays > 0 && _durationInDays <= 365, "Invalid duration");
        require(bytes(_title).length > 0, "Title required");
        
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);
        
        Campaign newCampaign = new Campaign(
            msg.sender,
            _title,
            _description,
            _imageUrl,
            _goalAmount,
            deadline,
            platformFee,
            _milestones
        );
        
        address campaignAddress = address(newCampaign);
        
        campaigns[campaignCount] = campaignAddress;
        creatorCampaigns[msg.sender].push(campaignCount);
        allCampaigns.push(campaignAddress);
        
        emit CampaignCreated(
            campaignCount,
            campaignAddress,
            msg.sender,
            _goalAmount,
            deadline
        );
        
        campaignCount++;
        
        return campaignAddress;
    }
    
    function getCampaignsByCreator(address _creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorCampaigns[_creator];
    }
    
    function getAllCampaigns() external view returns (address[] memory) {
        return allCampaigns;
    }
    
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee cannot exceed 10%");
        uint256 oldFee = platformFee;
        platformFee = _newFee;
        emit PlatformFeeUpdated(oldFee, _newFee);
    }
    
    function getCampaignDetails(uint256 _campaignId) 
        external 
        view 
        returns (
            address campaignAddress,
            address creator,
            string memory title,
            uint256 goalAmount,
            uint256 raisedAmount,
            uint256 deadline,
            bool isActive
        ) 
    {
        require(_campaignId < campaignCount, "Campaign does not exist");
        
        Campaign campaign = Campaign(campaigns[_campaignId]);
        
        return (
            address(campaign),
            campaign.creator(),
            campaign.title(),
            campaign.goalAmount(),
            campaign.raisedAmount(),
            campaign.deadline(),
            campaign.isActive()
        );
    }
}