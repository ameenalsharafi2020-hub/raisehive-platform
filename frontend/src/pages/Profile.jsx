import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Card,
  CardBody,
  Avatar,
  Button,
  Tabs,
  Tab,
  Chip
} from '@nextui-org/react'
import { FiEdit2, FiMapPin, FiCalendar, FiLink } from 'react-icons/fi'
import { useAddress } from '@thirdweb-dev/react'
import CampaignCard from '@/components/CampaignCard'
import campaignService from '@/services/campaignService'
import api from '@/services/api'

const Profile = () => {
  const { address: profileAddress } = useParams()
  const currentAddress = useAddress()
  const isOwnProfile = currentAddress?.toLowerCase() === profileAddress?.toLowerCase()

  const [user, setUser] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [profileAddress])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Load user data
      const userResponse = await api.get(`/users/${profileAddress}`)
      setUser(userResponse.data.data)

      // Load user's campaigns
      const campaignsResponse = await api.get(`/users/${profileAddress}/campaigns`)
      setCampaigns(campaignsResponse.data.data)
    } catch (error) {
      console.error('Load profile error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const stats = {
    campaignsCreated: campaigns.length,
    totalRaised: campaigns.reduce((sum, c) => sum + parseFloat(c.raisedAmount || 0), 0),
    successfulCampaigns: campaigns.filter(c => c.isSuccessful).length
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar
                src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileAddress}`}
                className="w-32 h-32"
              />
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {user?.username || 'Anonymous User'}
                    </h1>
                    <p className="text-gray-600 font-mono text-sm mb-3">
                      {profileAddress?.slice(0, 10)}...{profileAddress?.slice(-8)}
                    </p>
                    
                    {user?.bio && (
                      <p className="text-gray-700 mb-4">{user.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      {user?.location && (
                        <span className="flex items-center gap-1">
                          <FiMapPin /> {user.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FiCalendar /> Joined {new Date(user?.createdAt).toLocaleDateString()}
                      </span>
                      {user?.website && (
                        <a
                          href={user.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-purple-600 hover:underline"
                        >
                          <FiLink /> Website
                        </a>
                      )}
                    </div>
                  </div>

                  {isOwnProfile && (
                    <Button
                      color="primary"
                      variant="flat"
                      startContent={<FiEdit2 />}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{stats.campaignsCreated}</p>
                    <p className="text-sm text-gray-600">Campaigns Created</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalRaised.toFixed(2)} ETH</p>
                    <p className="text-sm text-gray-600">Total Raised</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{stats.successfulCampaigns}</p>
                    <p className="text-sm text-gray-600">Successful</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Campaigns Tabs */}
        <Card>
          <CardBody className="p-6">
            <Tabs color="secondary" variant="underlined">
              <Tab key="created" title={`Created (${campaigns.length})`}>
                <div className="mt-6">
                  {campaigns.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No campaigns created yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {campaigns.map((campaign) => (
                        <CampaignCard key={campaign._id} campaign={campaign} />
                      ))}
                    </div>
                  )}
                </div>
              </Tab>

              <Tab key="backed" title="Backed (0)">
                <div className="mt-6 text-center py-12">
                  <p className="text-gray-500">No backed campaigns</p>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default Profile