import { ethers } from 'ethers'
import { toast } from 'react-toastify'

// Contract ABIs (import from your compiled contracts)
import FactoryABI from '../contracts/CrowdfundingFactory.json'
import CampaignABI from '../contracts/Campaign.json'

const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_CONTRACT_ADDRESS

class Web3Service {
  constructor() {
    this.provider = null
    this.signer = null
    this.factoryContract = null
  }

  async initialize() {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask')
    }

    this.provider = new ethers.providers.Web3Provider(window.ethereum)
    await this.provider.send('eth_requestAccounts', [])
    this.signer = this.provider.getSigner()

    this.factoryContract = new ethers.Contract(
      FACTORY_ADDRESS,
      FactoryABI.abi,
      this.signer
    )
  }

  async createCampaign(campaignData) {
    try {
      if (!this.factoryContract) {
        await this.initialize()
      }

      const {
        title,
        description,
        imageUrl,
        goalAmount,
        durationInDays,
        milestones
      } = campaignData

      // Convert goal amount to Wei
      const goalInWei = ethers.utils.parseEther(goalAmount.toString())

      // Create campaign transaction
      const tx = await this.factoryContract.createCampaign(
        title,
        description,
        imageUrl,
        goalInWei,
        durationInDays,
        milestones || []
      )

      toast.info('Transaction submitted. Waiting for confirmation...')

      const receipt = await tx.wait()

      // Get campaign created event
      const event = receipt.events.find(e => e.event === 'CampaignCreated')
      const { campaignId, campaignAddress } = event.args

      toast.success('Campaign created successfully!')

      return {
        campaignId: campaignId.toNumber(),
        campaignAddress,
        transactionHash: receipt.transactionHash
      }
    } catch (error) {
      console.error('Create campaign error:', error)
      toast.error(error.message || 'Failed to create campaign')
      throw error
    }
  }

  async contribute(campaignAddress, amount) {
    try {
      if (!this.signer) {
        await this.initialize()
      }

      const campaignContract = new ethers.Contract(
        campaignAddress,
        CampaignABI.abi,
        this.signer
      )

      const amountInWei = ethers.utils.parseEther(amount.toString())

      const tx = await campaignContract.contribute({
        value: amountInWei
      })

      toast.info('Processing contribution...')

      const receipt = await tx.wait()

      toast.success('Contribution successful!')

      return receipt
    } catch (error) {
      console.error('Contribution error:', error)
      toast.error(error.message || 'Contribution failed')
      throw error
    }
  }

  async withdrawFunds(campaignAddress) {
    try {
      if (!this.signer) {
        await this.initialize()
      }

      const campaignContract = new ethers.Contract(
        campaignAddress,
        CampaignABI.abi,
        this.signer
      )

      const tx = await campaignContract.withdrawFunds()

      toast.info('Processing withdrawal...')

      const receipt = await tx.wait()

      toast.success('Funds withdrawn successfully!')

      return receipt
    } catch (error) {
      console.error('Withdrawal error:', error)
      toast.error(error.message || 'Withdrawal failed')
      throw error
    }
  }

  async requestRefund(campaignAddress) {
    try {
      if (!this.signer) {
        await this.initialize()
      }

      const campaignContract = new ethers.Contract(
        campaignAddress,
        CampaignABI.abi,
        this.signer
      )

      const tx = await campaignContract.requestRefund()

      toast.info('Processing refund request...')

      const receipt = await tx.wait()

      toast.success('Refund processed successfully!')

      return receipt
    } catch (error) {
      console.error('Refund error:', error)
      toast.error(error.message || 'Refund failed')
      throw error
    }
  }

  async getCampaignDetails(campaignAddress) {
    try {
      if (!this.provider) {
        await this.initialize()
      }

      const campaignContract = new ethers.Contract(
        campaignAddress,
        CampaignABI.abi,
        this.provider
      )

      const [
        creator,
        title,
        goalAmount,
        raisedAmount,
        deadline,
        isActive,
        isSuccessful
      ] = await Promise.all([
        campaignContract.creator(),
        campaignContract.title(),
        campaignContract.goalAmount(),
        campaignContract.raisedAmount(),
        campaignContract.deadline(),
        campaignContract.isActive(),
        campaignContract.isSuccessful()
      ])

      return {
        creator,
        title,
        goalAmount: ethers.utils.formatEther(goalAmount),
        raisedAmount: ethers.utils.formatEther(raisedAmount),
        deadline: new Date(deadline.toNumber() * 1000),
        isActive,
        isSuccessful
      }
    } catch (error) {
      console.error('Get campaign details error:', error)
      throw error
    }
  }

  async getCampaignStats(campaignAddress) {
    try {
      if (!this.provider) {
        await this.initialize()
      }

      const campaignContract = new ethers.Contract(
        campaignAddress,
        CampaignABI.abi,
        this.provider
      )

      const stats = await campaignContract.getStats()

      return {
        raisedAmount: ethers.utils.formatEther(stats._raisedAmount),
        goalAmount: ethers.utils.formatEther(stats._goalAmount),
        contributorCount: stats._contributorCount.toNumber(),
        daysLeft: stats._daysLeft.toNumber(),
        percentageFunded: stats._percentageFunded.toNumber()
      }
    } catch (error) {
      console.error('Get campaign stats error:', error)
      throw error
    }
  }

  formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  async getBalance(address) {
    if (!this.provider) {
      await this.initialize()
    }

    const balance = await this.provider.getBalance(address)
    return ethers.utils.formatEther(balance)
  }
}

export default new Web3Service()