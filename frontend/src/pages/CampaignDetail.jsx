import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  Button,
  Progress,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@nextui-org/react'
import { FiClock, FiUsers, FiHeart, FiShare2, FiFlag } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAddress } from '@thirdweb-dev/react'
import ReactMarkdown from 'react-markdown'
import { formatDistance } from 'date-fns'
import campaignService from '@/services/campaignService'
import web3Service from '@/services/web3Service'

const CampaignDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const address = useAddress()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [contributing, setContributing] = useState(false)
  const [contributionAmount, setContributionAmount] = useState('')
  const [activeTab, setActiveTab] = useState('about')
  const [comment, setComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)

  useEffect(() => {
    loadCampaign()
  }, [id])

  const loadCampaign = async () => {
    try {
      setLoading(true)
      const response = await campaignService.getCampaignById(id)
      setCampaign(response.data)
    } catch (error) {
      console.error('Load campaign error:', error)
      toast.error('Failed to load campaign')
      navigate('/explore')
    } finally {
      setLoading(false)
    }
  }

  const handleContribute = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      setContributing(true)

      // Contribute via smart contract
      await web3Service.contribute(campaign.contractAddress, contributionAmount)

      // Sync campaign data
      await campaignService.getCampaignByAddress(campaign.contractAddress)
      
      // Reload campaign
      await loadCampaign()

      toast.success('Contribution successful! Thank you for your support!')
      setContributionAmount('')
      onOpenChange()
    } catch (error) {
      console.error('Contribution error:', error)
      // Error toast already shown in web3Service
    } finally {
      setContributing(false)
    }
  }

  const handleAddComment = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    try {
      setAddingComment(true)
      await campaignService.addComment(id, { content: comment })
      await loadCampaign()
      setComment('')
      toast.success('Comment added successfully')
    } catch (error) {
      console.error('Add comment error:', error)
      toast.error('Failed to add comment')
    } finally {
      setAddingComment(false)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success('Campaign URL copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!campaign) {
    return null
  }

  const raised = parseFloat(campaign.raisedAmount || 0)
  const goal = parseFloat(campaign.goalAmount || 1)
  const percentage = Math.min((raised / goal) * 100, 100)
  const daysLeft = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24))
  const isActive = campaign.isActive && daysLeft > 0
  const isCreator = address?.toLowerCase() === campaign.creator?.walletAddress?.toLowerCase()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="light"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          ← Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <Card>
              <CardBody className="p-0">
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </CardBody>
            </Card>

            {/* Campaign Info */}
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Chip color="secondary" variant="flat" className="mb-3">
                      {campaign.category}
                    </Chip>
                    <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
                    
                    {/* Creator Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar
                        src={campaign.creator?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${campaign.creator?.walletAddress}`}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-semibold">
                          {campaign.creator?.username || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {campaign.creator?.walletAddress?.slice(0, 6)}...
                          {campaign.creator?.walletAddress?.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button isIconOnly variant="light" onClick={handleShare}>
                      <FiShare2 size={20} />
                    </Button>
                    <Button isIconOnly variant="light">
                      <FiHeart size={20} />
                    </Button>
                    <Button isIconOnly variant="light">
                      <FiFlag size={20} />
                    </Button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-2xl font-bold text-purple-600">
                      {raised.toFixed(4)} ETH
                    </span>
                    <span className="text-gray-600">
                      raised of {goal} ETH goal
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    color="secondary"
                    size="lg"
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <FiUsers />
                      <strong>{campaign.contributorCount || 0}</strong> backers
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <FiClock />
                      {isActive ? (
                        <><strong>{daysLeft}</strong> days left</>
                      ) : (
                        <span className="text-red-600">Campaign ended</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Status Chips */}
                <div className="flex gap-2">
                  {campaign.isSuccessful && (
                    <Chip color="success" variant="flat">
                      ✓ Successfully Funded
                    </Chip>
                  )}
                  {campaign.isFeatured && (
                    <Chip color="warning" variant="flat">
                      ⭐ Featured
                    </Chip>
                  )}
                  {campaign.isVerified && (
                    <Chip color="primary" variant="flat">
                      ✓ Verified
                    </Chip>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Tabs */}
            <Card>
              <CardBody className="p-6">
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
                  color="secondary"
                  variant="underlined"
                  className="mb-6"
                >
                  <Tab key="about" title="About" />
                  <Tab key="updates" title={`Updates (${campaign.updates?.length || 0})`} />
                  <Tab key="comments" title={`Comments (${campaign.comments?.length || 0})`} />
                  <Tab key="backers" title={`Backers (${campaign.contributorCount || 0})`} />
                </Tabs>

                {/* About Tab */}
                {activeTab === 'about' && (
                  <div className="prose max-w-none">
                    <ReactMarkdown>{campaign.description}</ReactMarkdown>

                    {/* Milestones */}
                    {campaign.milestones?.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4">Milestones</h3>
                        <div className="space-y-3">
                          {campaign.milestones.map((milestone, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                milestone.completed ? 'bg-green-500 text-white' : 'bg-gray-300'
                              }`}>
                                {milestone.completed ? '✓' : index + 1}
                              </div>
                              <div className="flex-1">
                                <p className={milestone.completed ? 'line-through text-gray-500' : ''}>
                                  {milestone.description}
                                </p>
                                {milestone.completed && milestone.completedAt && (
                                  <p className="text-xs text-gray-500">
                                    Completed {formatDistance(new Date(milestone.completedAt), new Date(), { addSuffix: true })}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Updates Tab */}
                {activeTab === 'updates' && (
                  <div className="space-y-6">
                    {campaign.updates?.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No updates yet</p>
                    ) : (
                      campaign.updates?.map((update, index) => (
                        <div key={index} className="border-b pb-6 last:border-b-0">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold">{update.title}</h3>
                            <span className="text-sm text-gray-500">
                              {formatDistance(new Date(update.timestamp), new Date(), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-gray-700">{update.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <div className="space-y-6">
                    {/* Add Comment */}
                    {address && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Textarea
                          placeholder="Write a comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="mb-3"
                        />
                        <Button
                          color="primary"
                          onClick={handleAddComment}
                          isLoading={addingComment}
                          isDisabled={!comment.trim()}
                        >
                          Post Comment
                        </Button>
                      </div>
                    )}

                    {/* Comments List */}
                    {campaign.comments?.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No comments yet</p>
                    ) : (
                      campaign.comments?.map((comment, index) => (
                        <div key={index} className="flex gap-3">
                          <Avatar
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user}`}
                            size="sm"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm font-semibold mb-1">
                                {comment.user?.slice(0, 6)}...{comment.user?.slice(-4)}
                              </p>
                              <p className="text-gray-700">{comment.content}</p>
                            </div>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                              <span>
                                {formatDistance(new Date(comment.timestamp), new Date(), { addSuffix: true })}
                              </span>
                              <button className="hover:text-purple-600">Like ({comment.likes?.length || 0})</button>
                              <button className="hover:text-purple-600">Reply</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Backers Tab */}
                {activeTab === 'backers' && (
                  <div className="space-y-3">
                    {campaign.contributors?.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No backers yet</p>
                    ) : (
                      campaign.contributors?.map((contributor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contributor.address}`}
                              size="sm"
                            />
                            <div>
                              <p className="font-semibold">
                                {contributor.address.slice(0, 6)}...{contributor.address.slice(-4)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDistance(new Date(contributor.timestamp), new Date(), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-purple-600">
                            {parseFloat(contributor.amount).toFixed(4)} ETH
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Contribution Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardBody className="p-6">
                <h3 className="text-xl font-bold mb-4">Support This Campaign</h3>

                {isCreator ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        This is your campaign. You can manage it from your dashboard.
                      </p>
                    </div>
                    <Button
                      color="primary"
                      className="w-full"
                      onClick={() => navigate('/dashboard')}
                    >
                      Manage Campaign
                    </Button>
                  </div>
                ) : isActive ? (
                  <>
                    <Button
                      color="secondary"
                      size="lg"
                      className="w-full mb-4"
                      onClick={onOpen}
                    >
                      Back This Campaign
                    </Button>

                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Platform Fee:</span>
                        <span className="font-semibold">2.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blockchain Network:</span>
                        <span className="font-semibold">Ethereum</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contract:</span>
                        <span className="font-mono text-xs">
                          {campaign.contractAddress?.slice(0, 6)}...
                          {campaign.contractAddress?.slice(-4)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold mb-2 text-purple-900">Why support?</h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>✓ 100% transparent on blockchain</li>
                        <li>✓ Automatic refund if goal not met</li>
                        <li>✓ Direct support to creator</li>
                        <li>✓ Be part of something amazing</li>
                      </ul>
                    </div>
                  </>
                ) : campaign.isSuccessful ? (
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-green-800 font-semibold mb-2">
                      ✓ Campaign Successfully Funded!
                    </p>
                    <p className="text-sm text-green-700">
                      This campaign has reached its goal and is now closed to new contributions.
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-red-800 font-semibold mb-2">
                      Campaign Ended
                    </p>
                    <p className="text-sm text-red-700">
                      This campaign did not reach its funding goal.
                    </p>
                  </div>
                )}

                {/* Campaign Stats */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FiClock className="text-gray-500" />
                    <span>Created {formatDistance(new Date(campaign.createdAt), new Date(), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiUsers className="text-gray-500" />
                    <span>{campaign.views || 0} views</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Contribution Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Support {campaign.title}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Enter the amount you'd like to contribute (in ETH)
                    </p>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0.1"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">ETH</span>
                        </div>
                      }
                      size="lg"
                    />
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="flex gap-2">
                    {[0.01, 0.05, 0.1, 0.5].map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="flat"
                        onClick={() => setContributionAmount(amount.toString())}
                      >
                        {amount} ETH
                      </Button>
                    ))}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Your contribution:</span>
                      <span className="font-semibold">
                        {contributionAmount || '0'} ETH
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Gas fee:</span>
                      <span>~ 0.001 ETH</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>
                        {(parseFloat(contributionAmount || 0) + 0.001).toFixed(4)} ETH
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    By contributing, you agree to our terms and conditions. 
                    If the campaign doesn't reach its goal, you'll be automatically refunded.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="secondary"
                  onPress={handleContribute}
                  isLoading={contributing}
                  isDisabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
                >
                  Contribute Now
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default CampaignDetail