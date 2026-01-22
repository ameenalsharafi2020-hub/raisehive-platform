import { Button } from '@nextui-org/react'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="text-center text-white">
        <h1 className="text-9xl font-bold mb-4">404</h1>
        <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
        <p className="text-xl mb-8 opacity-90">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            color="warning"
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
          <Button
            size="lg"
            variant="bordered"
            className="text-white border-white"
            onClick={() => navigate('/explore')}
          >
            Explore Campaigns
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound