import { Card, CardBody, CardFooter, Progress, Chip, Avatar } from '@nextui-org/react'
import { Link } from 'react-router-dom'
import { FiClock, FiUsers } from 'react-icons/fi'
import { formatDistance } from 'date-fns'

const CampaignCard = ({ campaign }) => {
  const {
    _id,
    title,
    description,
    imageUrl,
    goalAmount,
    raisedAmount,
    deadline,
    category,
    creator,
    contributorCount
  } = campaign

  const raised = parseFloat(raisedAmount || 0)
  const goal = parseFloat(goalAmount || 1)
  const percentage = Math.min((raised / goal) * 100, 100)

  const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  const isActive = daysLeft > 0

  return (
    <Link to={`/campaign/${_id}`}>
      <Card 
        className="hover:scale-105 transition-transform duration-300 cursor-pointer"
        isPressable
      >
        <CardBody className="p-0">
          <div className="relative">
            <img
              src={imageUrl || 'https://via.placeholder.com/400x300'}
              alt={title}
              className="w-full h-48 object-cover"
            />
            <Chip
              className="absolute top-2 right-2"
              color={isActive ? 'success' : 'default'}
              variant="flat"
              size="sm"
            >
              {category}
            </Chip>
          </div>

          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-2">{title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

            {/* Creator */}
            <div className="flex items-center gap-2 mb-4">
              <Avatar
                src={creator?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator?.walletAddress}`}
                size="sm"
              />
              <span className="text-sm text-gray-700">
                {creator?.username || `${creator?.walletAddress?.slice(0, 6)}...`}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-purple-600">
                  {raised.toFixed(2)} ETH
                </span>
                <span className="text-sm text-gray-500">
                  of {goal} ETH
                </span>
              </div>
              <Progress
                value={percentage}
                color="secondary"
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FiUsers />
                  {contributorCount || 0} backers
                </span>
                <span className="flex items-center gap-1">
                  <FiClock />
                  {isActive ? `${daysLeft} days left` : 'Ended'}
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}

export default CampaignCard