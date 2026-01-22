import { create } from 'zustand'

const useCampaignStore = create((set, get) => ({
  campaigns: [],
  featuredCampaigns: [],
  trendingCampaigns: [],
  loading: false,
  error: null,

  setCampaigns: (campaigns) => set({ campaigns }),
  
  setFeaturedCampaigns: (campaigns) => set({ featuredCampaigns: campaigns }),
  
  setTrendingCampaigns: (campaigns) => set({ trendingCampaigns: campaigns }),
  
  addCampaign: (campaign) => set((state) => ({
    campaigns: [campaign, ...state.campaigns]
  })),
  
  updateCampaign: (campaignId, updates) => set((state) => ({
    campaigns: state.campaigns.map((c) =>
      c._id === campaignId ? { ...c, ...updates } : c
    )
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  getCampaignById: (id) => {
    return get().campaigns.find((c) => c._id === id)
  }
}))

export default useCampaignStore