import { ethers } from 'ethers'
import { toast } from 'react-toastify'

// Contract ABIs
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
    try {
      // Check if ethereum provider exists
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet')
      }

      // Create provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum)
      await this.provider.send('eth_requestAccounts', [])
      this.signer = this.provider.getSigner()

      // Initialize factory contract
      if (FACTORY_ADDRESS) {
        this.factoryContract = new ethers.Contract(
          FACTORY_ADDRESS,
          FactoryABI.abi,
          this.signer
        )
      } else {
        throw new Error('Factory contract address not configured')
      }

      console.log('✅ Web3Service initialized')
      return true
    } catch (error) {
      console.error('Web3Service initialization error:', error)
      throw error
    }
  }

  async createCampaign(campaignData) {
    try {
      // Initialize if not already done
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

      console.log('📝 Creating campaign with data:', {
        title,
        goalAmount,
        durationInDays,
        milestonesCount: milestones?.length || 0
      })

      // Validate inputs
      if (!title || title.length < 5) {
        throw new Error('Title must be at least 5 characters')
      }
      if (!description || description.length < 20) {
        throw new Error('Description must be at least 20 characters')
      }
      if (!imageUrl) {
        throw new Error('Image URL is required')
      }
      if (!goalAmount || parseFloat(goalAmount) <= 0) {
        throw new Error('Goal amount must be greater than 0')
      }
      if (!durationInDays || parseInt(durationInDays) <= 0) {
        throw new Error('Duration must be greater than 0')
      }

      // Convert goal amount to Wei
      const goalInWei = ethers.utils.parseEther(goalAmount.toString())
      console.log('💰 Goal in Wei:', goalInWei.toString())

      // Prepare milestones
      const milestonesArray = Array.isArray(milestones) ? milestones : []
      console.log('📋 Milestones:', milestonesArray)

      // Show transaction pending toast
      const toastId = toast.loading('Creating campaign on blockchain...')

      try {
        // Estimate gas
        const gasEstimate = await this.factoryContract.estimateGas.createCampaign(
          title,
          description,
          imageUrl,
          goalInWei,
          parseInt(durationInDays),
          milestonesArray
        )

        console.log('⛽ Estimated gas:', gasEstimate.toString())

        // Create campaign transaction
        const tx = await this.factoryContract.createCampaign(
          title,
          description,
          imageUrl,
          goalInWei,
          parseInt(durationInDays),
          milestonesArray,
          {
            gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
          }
        )

        console.log('📤 Transaction sent:', tx.hash)
        toast.update(toastId, { 
          render: 'Transaction submitted. Waiting for confirmation...', 
          type: 'info',
          isLoading: true 
        })

        // Wait for transaction confirmation
        const receipt = await tx.wait()
        console.log('✅ Transaction confirmed:', receipt.transactionHash)

        // Find CampaignCreated event
        const event = receipt.events?.find(e => e.event === 'CampaignCreated')
        
        if (!event) {
          throw new Error('CampaignCreated event not found in transaction receipt')
        }

        const { campaignId, campaignAddress } = event.args
        console.log('🎉 Campaign created:', {
          id: campaignId.toString(),
          address: campaignAddress
        })

        toast.update(toastId, { 
          render: 'Campaign created successfully!', 
          type: 'success',
          isLoading: false,
          autoClose: 5000
        })

        return {
          campaignId: campaignId.toNumber(),
          campaignAddress,
          transactionHash: receipt.transactionHash
        }
      } catch (txError) {
        console.error('Transaction error:', txError)
        
        let errorMessage = 'Failed to create campaign'
        
        // Handle specific errors
        if (txError.code === 4001) {
          errorMessage = 'Transaction rejected by user'
        } else if (txError.code === 'INSUFFICIENT_FUNDS') {
          errorMessage = 'Insufficient funds for gas'
        } else if (txError.message) {
          errorMessage = txError.message
        }

        toast.update(toastId, { 
          render: errorMessage, 
          type: 'error',
          isLoading: false,
          autoClose: 5000
        })

        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Create campaign error:', error)
      
      if (!error.message.includes('rejected') && !error.message.includes('Insufficient')) {
        toast.error(error.message || 'Failed to create campaign')
      }
      
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

      const toastId = toast.loading('Processing contribution...')

      const tx = await campaignContract.contribute({
        value: amountInWei
      })

      toast.update(toastId, { 
        render: 'Transaction submitted. Waiting for confirmation...', 
        isLoading: true 
      })

      const receipt = await tx.wait()

      toast.update(toastId, { 
        render: 'Contribution successful!', 
        type: 'success',
        isLoading: false,
        autoClose: 5000
      })

      return receipt
    } catch (error) {
      console.error('Contribution error:', error)
      
      let errorMessage = 'Contribution failed'
      if (error.code === 4001) {
        errorMessage = 'Transaction rejected by user'
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds'
      }
      
      toast.error(errorMessage)
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

      const toastId = toast.loading('Processing withdrawal...')

      const tx = await campaignContract.withdrawFunds()

      toast.update(toastId, { 
        render: 'Transaction submitted. Waiting for confirmation...', 
        isLoading: true 
      })

      const receipt = await tx.wait()

      toast.update(toastId, { 
        render: 'Funds withdrawn successfully!', 
        type: 'success',
        isLoading: false,
        autoClose: 5000
      })

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

      const toastId = toast.loading('Processing refund request...')

      const tx = await campaignContract.requestRefund()

      toast.update(toastId, { 
        render: 'Transaction submitted. Waiting for confirmation...', 
        isLoading: true 
      })

      const receipt = await tx.wait()

      toast.update(toastId, { 
        render: 'Refund processed successfully!', 
        type: 'success',
        isLoading: false,
        autoClose: 5000
      })

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
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  async getBalance(address) {
    if (!this.provider) {
      await this.initialize()
    }

    const balance = await this.provider.getBalance(address)
    return ethers.utils.formatEther(balance)
  }

  // Check if wallet is connected
  isConnected() {
    return window.ethereum && window.ethereum.selectedAddress
  }

  // Get current account
  async getCurrentAccount() {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask')
    }

    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    return accounts[0] || null
  }

  // Switch network
  async switchNetwork(chainId) {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.utils.hexValue(chainId) }],
      })
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        throw new Error('Please add this network to MetaMask')
      }
      throw switchError
    }
  }
}

export default new Web3Service()