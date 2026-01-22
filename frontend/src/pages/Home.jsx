import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, CardBody } from '@nextui-org/react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiShield, FiZap, FiGlobe } from 'react-icons/fi'
import CampaignCard from '@/components/CampaignCard'
import campaignService from '@/services/campaignService'
import useCampaignStore from '@/store/useCampaignStore'

const Home = () => {
  const { featuredCampaigns, trendingCampaigns, setFeaturedCampaigns, setTrendingCampaigns } = useCampaignStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const [featured, trending] = await Promise.all([
        campaignService.getFeaturedCampaigns(),
        campaignService.getTrendingCampaigns()
      ])

      setFeaturedCampaigns(featured.data)
      setTrendingCampaigns(trending.data)
    } catch (error) {
      console.error('Load campaigns error:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <FiShield size={40} />,
      title: 'Secure & Transparent',
      description: 'All transactions are recorded on the blockchain, ensuring complete transparency and security.'
    },
    {
      icon: <FiZap size={40} />,
      title: 'Instant Funding',
      description: 'Receive funds directly to your wallet with no intermediaries or delays.'
    },
    {
      icon: <FiGlobe size={40} />,
      title: 'Global Access',
      description: 'Connect with supporters from around the world using cryptocurrency.'
    },
    {
      icon: <FiTrendingUp size={40} />,
      title: 'Low Fees',
      description: 'Pay only 2.5% platform fee, much lower than traditional crowdfunding platforms.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Fund Your Dreams with
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Blockchain Technology
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              The decentralized crowdfunding platform that empowers creators and connects them with supporters worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={Link}
                to="/create"
                size="lg"
                color="warning"
                variant="shadow"
                className="text-lg font-semibold px-8"
              >
                Start a Campaign
              </Button>
              <Button
                as={Link}
                to="/explore"
                size="lg"
                variant="bordered"
                className="text-lg font-semibold px-8 text-white border-white hover:bg-white hover:text-purple-600"
              >
                Explore Projects
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h3 className="text-4xl font-bold mb-2">1,000+</h3>
                <p className="text-lg opacity-80">Campaigns Funded</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <h3 className="text-4xl font-bold mb-2">$5M+</h3>
                <p className="text-lg opacity-80">Total Raised</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <h3 className="text-4xl font-bold mb-2">50K+</h3>
                <p className="text-lg opacity-80">Active Users</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '4s' }}></div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Campaigns</h2>
            <p className="text-gray-600 text-lg">
              Discover the most promising projects on RaiseHive
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-96 animate-pulse">
                  <CardBody className="bg-gray-200"></CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCampaigns.slice(0, 3).map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button
              as={Link}
              to="/explore"
              color="primary"
              variant="flat"
              size="lg"
            >
              View All Campaigns
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose RaiseHive?</h2>
            <p className="text-gray-600 text-lg">
              The future of crowdfunding is here
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardBody className="text-center p-8">
                    <div className="text-purple-600 mb-4 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Campaigns */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Trending Now 🔥</h2>
            <p className="text-gray-600 text-lg">
              Join the community supporting these amazing projects
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="h-80 animate-pulse">
                  <CardBody className="bg-gray-200"></CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {trendingCampaigns.slice(0, 4).map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Bring Your Idea to Life?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who have successfully funded their projects on RaiseHive
          </p>
          <Button
            as={Link}
            to="/create"
            size="lg"
            color="warning"
            variant="shadow"
            className="text-lg font-semibold px-12"
          >
            Start Your Campaign Today
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg">
              Launch your campaign in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '1',
                title: 'Create Campaign',
                description: 'Connect your wallet and create your campaign with details, goals, and milestones.'
              },
              {
                step: '2',
                title: 'Share & Promote',
                description: 'Share your campaign with your network and reach potential backers worldwide.'
              },
              {
                step: '3',
                title: 'Receive Funds',
                description: 'When your goal is reached, withdraw funds directly to your wallet and start your project.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home