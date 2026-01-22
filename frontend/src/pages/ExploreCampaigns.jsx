import { useState, useEffect } from 'react'
import { Spinner, Pagination } from '@nextui-org/react'
import CampaignCard from '@/components/CampaignCard'
import CampaignFilters from '@/components/CampaignFilters'
import campaignService from '@/services/campaignService'
import useCampaignStore from '@/store/useCampaignStore'

const ExploreCampaigns = () => {
  const { campaigns, setCampaigns, loading, setLoading } = useCampaignStore()
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    sort: 'newest',
    search: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadCampaigns()
  }, [filters, currentPage])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 12,
        category: filters.category !== 'all' ? filters.category : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        sort: filters.sort
      }

      const response = await campaignService.getAllCampaigns(params)
      setCampaigns(response.data.campaigns)
      setTotalPages(response.data.pagination.total)
    } catch (error) {
      console.error('Load campaigns error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore Campaigns</h1>
          <p className="text-gray-600">
            Discover and support innovative projects from creators around the world
          </p>
        </div>

        <CampaignFilters filters={filters} onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" color="secondary" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No campaigns found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={setCurrentPage}
                  color="secondary"
                  showControls
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ExploreCampaigns