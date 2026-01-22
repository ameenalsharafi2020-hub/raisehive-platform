import { useState, useEffect } from 'react'
import campaignService from '@/services/campaignService'
import web3Service from '@/services/web3Service'

export const useCampaign = (campaignId) => {
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (campaignId) {
      loadCampaign()
    }
  }, [campaignId])

  const loadCampaign = async () => {
    try {
      setLoading(true)
      const response = await campaignService.getCampaignById(campaignId)
      setCampaign(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Load campaign error:', err)
    } finally {
      setLoading(false)
    }
  }

  const syncWithBlockchain = async () => {
    if (!campaign) return

    try {
      const stats = await web3Service.getCampaignStats(campaign.contractAddress)
      setCampaign(prev => ({
        ...prev,
        raisedAmount: stats.raisedAmount,
        contributorCount: stats.contributorCount
      }))
    } catch (err) {
      console.error('Sync error:', err)
    }
  }

  return {
    campaign,
    loading,
    error,
    reload: loadCampaign,
    syncWithBlockchain
  }
}