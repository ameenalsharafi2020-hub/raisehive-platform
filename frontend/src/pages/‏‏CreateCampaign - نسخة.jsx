import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Progress
} from '@nextui-org/react'
import { useAddress } from '@thirdweb-dev/react'
import { toast } from 'react-toastify'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import web3Service from '@/services/web3Service'
import campaignService from '@/services/campaignService'

const CreateCampaign = () => {
  const navigate = useNavigate()
  const address = useAddress()

  const [step, setStep] = useState(1)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technology',
    imageUrl: '',
    goalAmount: '',
    durationInDays: '30',
    milestones: ['']
  })

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'art', label: 'Art' },
    { value: 'music', label: 'Music' },
    { value: 'film', label: 'Film & Video' },
    { value: 'games', label: 'Games' },
    { value: 'education', label: 'Education' },
    { value: 'charity', label: 'Charity' },
    { value: 'other', label: 'Other' }
  ]

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMilestoneChange = (index, value) => {
    const newMilestones = [...formData.milestones]
    newMilestones[index] = value
    setFormData(prev => ({
      ...prev,
      milestones: newMilestones
    }))
  }

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, '']
    }))
  }

  const removeMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }))
  }

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.title || formData.title.length < 5) {
          toast.error('Title must be at least 5 characters')
          return false
        }
        if (!formData.description || formData.description.length < 20) {
          toast.error('Description must be at least 20 characters')
          return false
        }
        return true

      case 2:
        if (!formData.imageUrl) {
          toast.error('Please provide an image URL')
          return false
        }
        return true

      case 3:
        if (!formData.goalAmount || parseFloat(formData.goalAmount) <= 0) {
          toast.error('Please enter a valid goal amount')
          return false
        }
        if (!formData.durationInDays || parseInt(formData.durationInDays) <= 0) {
          toast.error('Please enter a valid duration')
          return false
        }
        return true

      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      setCreating(true)

      // Filter empty milestones
      const milestones = formData.milestones.filter(m => m.trim() !== '')

      // Create campaign on blockchain
      toast.info('Creating campaign on blockchain...')
      const blockchainResult = await web3Service.createCampaign({
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        goalAmount: formData.goalAmount,
        durationInDays: parseInt(formData.durationInDays),
        milestones
      })

      // Save to database
      toast.info('Saving campaign data...')
      await campaignService.createCampaign({
        contractAddress: blockchainResult.campaignAddress,
        campaignId: blockchainResult.campaignId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        imageUrl: formData.imageUrl,
        goalAmount: formData.goalAmount,
        deadline: new Date(Date.now() + parseInt(formData.durationInDays) * 24 * 60 * 60 * 1000),
        tags: []
      })

      toast.success('Campaign created successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Create campaign error:', error)
      // Error toast already shown in services
    } finally {
      setCreating(false)
    }
  }

  const progress = (step / 4) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create a Campaign</h1>
          <p className="text-gray-600">
            Launch your project and start raising funds on the blockchain
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} color="secondary" className="mb-2" />
          <p className="text-sm text-gray-600">
            Step {step} of 4
          </p>
        </div>

        <Card>
          <CardBody className="p-8">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
                
                <Input
                  label="Campaign Title"
                  placeholder="Enter a catchy title for your campaign"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  description="Choose a clear and concise title that explains your project"
                  isRequired
                />

                <Textarea
                  label="Description"
                  placeholder="Describe your project in detail..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  description="Explain what you're creating and why it matters"
                  minRows={6}
                  isRequired
                />

                <Select
                  label="Category"
                  selectedKeys={[formData.category]}
                  onChange={(e) => handleChange('category', e.target.value)}
                  isRequired
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}

            {/* Step 2: Media */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Campaign Media</h2>
                
                <Input
                  label="Image URL"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  description="Provide a high-quality image that represents your campaign"
                  isRequired
                />

                {formData.imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={formData.imageUrl}
                      alt="Campaign preview"
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL'
                      }}
                    />
                  </div>
                )}

                <Input
                  label="Video URL (Optional)"
                  placeholder="https://youtube.com/watch?v=..."
                  description="Add a video to make your campaign more engaging"
                />
              </div>
            )}

            {/* Step 3: Funding */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Funding Details</h2>
                
                <Input
                  type="number"
                  step="0.01"
                  label="Funding Goal (ETH)"
                  placeholder="10"
                  value={formData.goalAmount}
                  onChange={(e) => handleChange('goalAmount', e.target.value)}
                  description="How much do you need to raise?"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">ETH</span>
                    </div>
                  }
                  isRequired
                />

                <Input
                  type="number"
                  label="Campaign Duration (Days)"
                  placeholder="30"
                  value={formData.durationInDays}
                  onChange={(e) => handleChange('durationInDays', e.target.value)}
                  description="How long will your campaign run?"
                  isRequired
                />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Platform fee: 2.5% of total funds raised</li>
                    <li>• You'll only receive funds if you reach your goal</li>
                    <li>• Contributors get automatic refunds if goal isn't met</li>
                    <li>• All transactions are transparent on the blockchain</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 4: Milestones */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Project Milestones</h2>
                
                <p className="text-gray-600">
                  Define key milestones for your project to build trust with your backers
                </p>

                <div className="space-y-3">
                  {formData.milestones.map((milestone, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Milestone ${index + 1}`}
                        value={milestone}
                        onChange={(e) => handleMilestoneChange(index, e.target.value)}
                        className="flex-1"
                      />
                      {formData.milestones.length > 1 && (
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          onClick={() => removeMilestone(index)}
                        >
                          <FiTrash2 />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="bordered"
                  startContent={<FiPlus />}
                  onClick={addMilestone}
                  className="w-full"
                >
                  Add Milestone
                </Button>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Review Your Campaign</h3>
                  <div className="space-y-2 text-sm text-purple-800">
                    <p><strong>Title:</strong> {formData.title}</p>
                    <p><strong>Category:</strong> {categories.find(c => c.value === formData.category)?.label}</p>
                    <p><strong>Goal:</strong> {formData.goalAmount} ETH</p>
                    <p><strong>Duration:</strong> {formData.durationInDays} days</p>
                    <p><strong>Milestones:</strong> {formData.milestones.filter(m => m.trim()).length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="light"
                onClick={handleBack}
                isDisabled={step === 1 || creating}
              >
                Back
              </Button>

              {step < 4 ? (
                <Button
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  color="secondary"
                  onClick={handleSubmit}
                  isLoading={creating}
                >
                  Create Campaign
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default CreateCampaign