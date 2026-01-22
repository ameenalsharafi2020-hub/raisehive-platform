// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // تحديث من 0.8.19

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Campaign
 * @dev Individual crowdfunding campaign contract
 */
contract Campaign is ReentrancyGuard, Pausable {
    
    // Campaign details
    address public creator;
    string public title;
    string public description;
    string public imageUrl;
    uint256 public goalAmount;
    uint256 public raisedAmount;
    uint256 public deadline;
    uint256 public platformFee;
    bool public isActive;
    bool public isSuccessful;
    bool public fundsClaimed;
    
    // Milestones
    string[] public milestones;
    mapping(uint256 => bool) public milestoneCompleted;
    uint256 public currentMilestone;
    
    // Contributors
    mapping(address => uint256) public contributions;
    address[] public contributors;
    mapping(address => bool) public isContributor;
    
    // Refund tracking
    mapping(address => bool) public refundClaimed;
    
    // Events
    event ContributionReceived(
        address indexed contributor,
        uint256 amount,
        uint256 totalRaised
    );
    
    event FundsWithdrawn(
        address indexed creator,
        uint256 amount,
        uint256 platformFeeAmount
    );
    
    event RefundIssued(
        address indexed contributor,
        uint256 amount
    );
    
    event MilestoneCompleted(
        uint256 indexed milestoneIndex,
        string milestone
    );
    
    event CampaignCancelled(string reason);
    
    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this");
        _;
    }
    
    modifier campaignActive() {
        require(isActive, "Campaign is not active");
        require(block.timestamp < deadline, "Campaign has ended");
        _;
    }
    
    constructor(
        address _creator,
        string memory _title,
        string memory _description,
        string memory _imageUrl,
        uint256 _goalAmount,
        uint256 _deadline,
        uint256 _platformFee,
        string[] memory _milestones
    ) {
        creator = _creator;
        title = _title;
        description = _description;
        imageUrl = _imageUrl;
        goalAmount = _goalAmount;
        deadline = _deadline;
        platformFee = _platformFee;
        isActive = true;
        isSuccessful = false;
        fundsClaimed = false;
        raisedAmount = 0;
        currentMilestone = 0;
        
        for (uint256 i = 0; i < _milestones.length; i++) {
            milestones.push(_milestones[i]);
        }
    }
    
    function contribute() external payable campaignActive nonReentrant whenNotPaused {
        require(msg.value > 0, "Contribution must be greater than 0");
        require(msg.sender != creator, "Creator cannot contribute");
        
        if (!isContributor[msg.sender]) {
            contributors.push(msg.sender);
            isContributor[msg.sender] = true;
        }
        
        contributions[msg.sender] += msg.value;
        raisedAmount += msg.value;
        
        emit ContributionReceived(msg.sender, msg.value, raisedAmount);
        
        if (raisedAmount >= goalAmount) {
            isSuccessful = true;
        }
    }
    
    function withdrawFunds() external onlyCreator nonReentrant {
        require(block.timestamp >= deadline, "Campaign still ongoing");
        require(isSuccessful, "Campaign did not meet goal");
        require(!fundsClaimed, "Funds already claimed");
        require(raisedAmount > 0, "No funds to withdraw");
        
        fundsClaimed = true;
        isActive = false;
        
        uint256 feeAmount = (raisedAmount * platformFee) / 10000;
        uint256 creatorAmount = raisedAmount - feeAmount;
        
        (bool success, ) = creator.call{value: creatorAmount}("");
        require(success, "Transfer to creator failed");
        
        emit FundsWithdrawn(creator, creatorAmount, feeAmount);
    }
    
    function requestRefund() external nonReentrant {
        require(block.timestamp >= deadline, "Campaign still ongoing");
        require(!isSuccessful, "Campaign was successful");
        require(contributions[msg.sender] > 0, "No contribution found");
        require(!refundClaimed[msg.sender], "Refund already claimed");
        
        uint256 refundAmount = contributions[msg.sender];
        refundClaimed[msg.sender] = true;
        
        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund transfer failed");
        
        emit RefundIssued(msg.sender, refundAmount);
    }
    
    function completeMilestone(uint256 _milestoneIndex) external onlyCreator {
        require(_milestoneIndex < milestones.length, "Invalid milestone");
        require(!milestoneCompleted[_milestoneIndex], "Milestone already completed");
        
        milestoneCompleted[_milestoneIndex] = true;
        currentMilestone = _milestoneIndex + 1;
        
        emit MilestoneCompleted(_milestoneIndex, milestones[_milestoneIndex]);
    }
    
    function cancelCampaign(string memory _reason) external onlyCreator {
        require(isActive, "Campaign already inactive");
        require(block.timestamp < deadline, "Cannot cancel after deadline");
        
        isActive = false;
        
        emit CampaignCancelled(_reason);
    }
    
    function pause() external onlyCreator {
        _pause();
    }
    
    function unpause() external onlyCreator {
        _unpause();
    }
    
    function getStats() external view returns (
        uint256 _raisedAmount,
        uint256 _goalAmount,
        uint256 _contributorCount,
        uint256 _daysLeft,
        uint256 _percentageFunded
    ) {
        uint256 daysLeft = 0;
        if (block.timestamp < deadline) {
            daysLeft = (deadline - block.timestamp) / 1 days;
        }
        
        uint256 percentage = 0;
        if (goalAmount > 0) {
            percentage = (raisedAmount * 100) / goalAmount;
        }
        
        return (
            raisedAmount,
            goalAmount,
            contributors.length,
            daysLeft,
            percentage
        );
    }
    
    function getContributors() external view returns (address[] memory) {
        return contributors;
    }
    
    function getMilestones() external view returns (string[] memory) {
        return milestones;
    }
    
    function getContribution(address _contributor) external view returns (uint256) {
        return contributions[_contributor];
    }
}