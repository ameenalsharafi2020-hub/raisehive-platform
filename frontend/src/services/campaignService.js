import api from './api'

class CampaignService {
  async getAllCampaigns(params = {}) {
    const response = await api.get('/campaigns', { params })
    return response.data
  }

  async getFeaturedCampaigns() {
    const response = await api.get('/campaigns/featured')
    return response.data
  }

  async getTrendingCampaigns() {
    const response = await api.get('/campaigns/trending')
    return response.data
  }

  async searchCampaigns(query) {
    const response = await api.get('/campaigns/search', {
      params: { q: query }
    })
    return response.data
  }

  async getCampaignById(id) {
    const response = await api.get(`/campaigns/${id}`)
    return response.data
  }

  async getCampaignByAddress(address) {
    const response = await api.get(`/campaigns/contract/${address}`)
    return response.data
  }

  async createCampaign(campaignData) {
    const response = await api.post('/campaigns', campaignData)
    return response.data
  }

  async updateCampaign(id, updates) {
    const response = await api.put(`/campaigns/${id}`, updates)
    return response.data
  }

  async addCampaignUpdate(id, update) {
    const response = await api.post(`/campaigns/${id}/updates`, update)
    return response.data
  }

  async addComment(id, comment) {
    const response = await api.post(`/campaigns/${id}/comments`, comment)
    return response.data
  }

  async getCampaignStats(id) {
    const response = await api.get(`/campaigns/${id}/stats`)
    return response.data
  }
}

export default new CampaignService()