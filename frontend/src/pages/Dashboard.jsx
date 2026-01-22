import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  Tabs,
  Tab,
  Button,
  Chip,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea
} from '@nextui-org/react'
import { useAddress } from '@thirdweb-dev/react'
import { toast } from 'react-toastify'
import { FiEdit, FiDollarSign, FiTrendingUp, FiUsers } from 'react-icons/fi'
import campaignService from '@/services/campaignService'
import web3Service from '@/services/web3Service'
import useAuthStore from '@/store/useAuthStore'

const Dashboard = () => {
  const navigate = useNavigate()
  const address = useAddress()
  const { user } = useAuthStore()

  const [campaigns, setCampaigns] = useState([])
  const [supportedCampaigns, setSupportedCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [withdrawing, setWithdrawing] = useState(false)
  
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onOpenChange: onUpdateOpenChange } = useDisclosure()
  const { isOpen: isWithdrawOpen, onOpen: onWithdrawOpen, onOpenChange: onWithdrawOpenChange } = useDisclosure()

  const [updateForm, setUpdateForm] = useState({
    title: '',
    content: ''
  })

  useEffect(() => {
    if (address) {
      loadDashboardData()
    }
  }, [address])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load created campaigns
      const createdResponse = await campaignService.getAllCampaigns({
        creator: address,
        limit: 100
      })
      setCampaigns(createdResponse.data.campaigns)

      // Load supported campaigns
      // This would need a backend endpoint
      // For now, we'll leave it empty
      setSupportedCampaigns([])
    } catch (error) {
      console.error('Load dashboard error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!selectedCampaign) return

    try {
      setWithdrawing(true)
      await web3Service.withdrawFunds(selectedCampaign.contractAddress)
      
      // Reload campaigns
      await loadDashboardData()
      
      onWithdrawOpenChange()
      setSelectedCampaign(null)
    } catch (error) {
      console.error('Withdraw error:', error)
    } finally {
      setWithdrawing(false)
    }
  }

  const handleAddUpdate = async () => {
    if (!selectedCampaign || !updateForm.title || !updateForm.content) {
      toast.error('Please fill all fields')
      return
    }

    try {
      await campaignService.addCampaignUpdate(selectedCampaign._id, updateForm)
      
      toast.success('Update posted successfully')
      setUpdateForm({ title: '', content: '' })
      onUpdateOpenChange()
      setSelectedCampaign(null)
      
      // Reload campaigns
      await loadDashboardData()
    } catch (error) {
      console.error('Add update error:', error)
      toast.error('Failed to post update')
    }
  }

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.isActive).length,
    totalRaised: campaigns.reduce((sum, c) => sum + parseFloat(c.raisedAmount || 0), 0),
    totalBackers: campaigns.reduce((sum, c) => sum + (c.contributorCount || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Manage your campaigns and track your progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Campaigns</p>
                  <p className="text-3xl font-bold">{stats.totalCampaigns}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FiEdit className="text-purple-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Active Campaigns</p>
                  <p className="text-3xl font-bold">{stats.activeCampaigns}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FiTrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Raised</p>
                  <p className="text-3xl font-bold">{stats.totalRaised.toFixed(2)} ETH</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiDollarSign className="text-blue-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Backers</p>
                  <p className="text-3xl font-bold">{stats.totalBackers}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <FiUsers className="text-orange-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardBody className="p-6">
            <Tabs color="secondary" variant="underlined">
              <Tab key="my-campaigns" title="My Campaigns">
                <div className="mt-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    </div>
                  ) : campaigns.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">You haven't created any campaigns yet</p>
                      <Button
                        color="primary"
                        onClick={() => navigate('/create')}
                      >
                        Create Your First Campaign
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaigns.map((campaign) => {
                        const raised = parseFloat(campaign.raisedAmount || 0)
                        const goal = parseFloat(campaign.goalAmount || 1)
                        const percentage = Math.min((raised / goal) * 100, 100)
                        const daysLeft = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24))

                        return (
                          <Card key={campaign._id} className="hover:shadow-lg transition-shadow">
                            <CardBody className="p-6">
                              <div className="flex gap-4">
                                <img
                                  src={campaign.imageUrl}
                                  alt={campaign.title}
                                  className="w-32 h-32 object-cover rounded-lg"
                                />
                                
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h3 className="text-xl font-bold mb-1">{campaign.title}</h3>
                                      <div className="flex gap-2">
                                        <Chip size="sm" color={campaign.isActive ? 'success' : 'default'}>
                                          {campaign.isActive ? 'Active' : 'Ended'}
                                        </Chip>
                                        {campaign.isSuccessful && (
                                          <Chip size="sm" color="success">
                                            ✓ Funded
                                          </Chip>
                                        )}
                                        <Chip size="sm" variant="flat">
                                          {campaign.category}
                                        </Chip>
                                      </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="flat"
                                        onClick={() => navigate(`/campaign/${campaign._id}`)}
                                      >
                                        View
                                      </Button>
                                      <Button
                                        size="sm"
                                        color="primary"
                                        variant="flat"
                                        onClick={() => {
                                          setSelectedCampaign(campaign)
                                          onUpdateOpen()
                                        }}
                                      >
                                        Post Update
                                      </Button>
                                      {campaign.isSuccessful && !campaign.fundsClaimed && (
                                        <Button
                                          size="sm"
                                          color="success"
                                          onClick={() => {
                                            setSelectedCampaign(campaign)
                                            onWithdrawOpen()
                                          }}
                                        >
                                          Withdraw Funds
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mb-3">
                                    <div className="flex justify-between mb-2 text-sm">
                                      <span className="font-semibold text-purple-600">
                                        {raised.toFixed(4)} ETH raised
                                      </span>
                                      <span className="text-gray-600">
                                        of {goal} ETH goal
                                      </span>
                                    </div>
                                    <Progress value={percentage} color="secondary" />
                                  </div>

                                  <div className="flex gap-6 text-sm text-gray-600">
                                    <span>{campaign.contributorCount || 0} backers</span>
                                    <span>{campaign.views || 0} views</span>
                                    <span>
                                      {campaign.isActive && daysLeft > 0
                                        ? `${daysLeft} days left`
                                        : 'Campaign ended'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Tab>

              <Tab key="backed" title="Backed Campaigns">
                <div className="mt-6 text-center py-12">
                  <p className="text-gray-500">You haven't backed any campaigns yet</p>
                </div>
              </Tab>

              <Tab key="analytics" title="Analytics">
                <div className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardBody className="p-6">
                        <h3 className="text-lg font-bold mb-4">Campaign Performance</h3>
                        <div className="space-y-3">
                          {campaigns.slice(0, 5).map((campaign) => {
                            const raised = parseFloat(campaign.raisedAmount || 0)
                            const goal = parseFloat(campaign.goalAmount || 1)
                            const percentage = Math.min((raised / goal) * 100, 100)

                            return (
                              <div key={campaign._id}>
                                <div className="flex justify-between mb-1 text-sm">
                                  <span className="truncate max-w-[200px]">{campaign.title}</span>
                                  <span className="font-semibold">{percentage.toFixed(0)}%</span>
                                </div>
                                <Progress value={percentage} color="secondary" size="sm" />
                              </div>
                            )
                          })}
                        </div>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody className="p-6">
                        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                        <p className="text-gray-500 text-center py-8">No recent activity</p>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>

      {/* Add Update Modal */}
      <Modal isOpen={isUpdateOpen} onOpenChange={onUpdateOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Post Campaign Update
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Update Title"
                    placeholder="What's new with your campaign?"
                    value={updateForm.title}
                    onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                  />
                  <Textarea
                    label="Update Content"
                    placeholder="Share your progress, milestones, or news..."
                    value={updateForm.content}
                    onChange={(e) => setUpdateForm({ ...updateForm, content: e.target.value })}
                    minRows={6}
                  />
                  <p className="text-sm text-gray-500">
                    Updates will be visible to all backers and visitors
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleAddUpdate}>
                  Post Update
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={isWithdrawOpen} onOpenChange={onWithdrawOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Withdraw Funds
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <p>
                    You are about to withdraw funds from your campaign:
                  </p>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="font-bold mb-2">{selectedCampaign?.title}</p>
                    <p className="text-2xl font-bold text-purple-600 mb-1">
                      {parseFloat(selectedCampaign?.raisedAmount || 0).toFixed(4)} ETH
                    </p>
                    <p className="text-sm text-gray-600">
                      Platform fee (2.5%): {(parseFloat(selectedCampaign?.raisedAmount || 0) * 0.025).toFixed(4)} ETH
                    </p>
                    <p className="text-sm font-semibold">
                      You will receive: {(parseFloat(selectedCampaign?.raisedAmount || 0) * 0.975).toFixed(4)} ETH
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Funds will be sent directly to your connected wallet
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="success"
                  onPress={handleWithdraw}
                  isLoading={withdrawing}
                >
                  Confirm Withdrawal
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Dashboard