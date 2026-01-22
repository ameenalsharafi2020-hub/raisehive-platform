import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Navbar as NextNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar
} from '@nextui-org/react'
import { 
  useAddress, 
  useDisconnect,
  useConnectionStatus,
  useWallet
} from '@thirdweb-dev/react'
import { FiSearch, FiPlusCircle } from 'react-icons/fi'
import useAuthStore from '@/store/useAuthStore'
import authService from '@/services/authService'
import { toast } from 'react-toastify'
import CustomConnectWallet from './CustomConnectWallet'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [authAttempted, setAuthAttempted] = useState(false)
  
  const address = useAddress()
  const disconnect = useDisconnect()
  const connectionStatus = useConnectionStatus()
  const wallet = useWallet()
  const navigate = useNavigate()
  
  const { user, isAuthenticated, setAuth, logout } = useAuthStore()

  // Enhanced logging
  useEffect(() => {
    console.log('🔌 Connection Status Changed:', {
      status: connectionStatus,
      address: address,
      wallet: wallet?.walletId,
      isAuthenticated: isAuthenticated,
      connecting: connecting
    })
  }, [connectionStatus, address, wallet, isAuthenticated, connecting])

  // Listen for wallet connection
  useEffect(() => {
    if (address && connectionStatus === 'connected') {
      console.log('✅ Wallet connected successfully!')
      console.log('📍 Address:', address)
      
      // Auto-authenticate if not already authenticated
      if (!isAuthenticated && !connecting && !authAttempted) {
        console.log('🔐 Starting authentication...')
        handleAutoConnect()
      }
    }
  }, [address, connectionStatus])

  // Reset auth attempt when disconnected
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      setAuthAttempted(false)
      setConnecting(false)
    }
  }, [connectionStatus])

  const handleAutoConnect = async () => {
    if (!address) {
      console.log('⚠️ No address available for authentication')
      return
    }

    try {
      setConnecting(true)
      setAuthAttempted(true)
      
      console.log('🚀 Starting wallet authentication for:', address)
      
      // Add delay to ensure wallet is fully ready
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const response = await authService.loginWithWallet(address)
      
      console.log('✅ Authentication response:', {
        hasUser: !!response.data.user,
        hasToken: !!response.data.token,
        userAddress: response.data.user?.walletAddress
      })
      
      setAuth(response.data.user, response.data.token)
      
      toast.success('🎉 Wallet connected and authenticated!', {
        position: 'top-right',
        autoClose: 3000
      })
      
    } catch (error) {
      console.error('❌ Authentication error:', error)
      
      setAuthAttempted(false) // Allow retry
      
      if (error.message.includes('rejected')) {
        toast.error('❌ Signature request rejected. Please try again.')
      } else if (error.message.includes('User denied')) {
        toast.error('❌ You rejected the signature request')
      } else {
        toast.error('❌ Authentication failed. Please reconnect your wallet.')
        // Optionally disconnect
        // disconnect()
      }
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = () => {
    console.log('🔌 Disconnecting wallet...')
    disconnect()
    logout()
    setAuthAttempted(false)
    navigate('/')
    toast.info('Wallet disconnected')
  }

  const handleCreateCampaign = () => {
    if (!address) {
      toast.warning('⚠️ Please connect your wallet first')
      return
    }
    
    if (!isAuthenticated) {
      toast.warning('⚠️ Please wait for authentication...')
      return
    }

    navigate('/create')
  }

  // Manual retry authentication
  const handleRetryAuth = async () => {
    if (address && !isAuthenticated) {
      setAuthAttempted(false)
      await handleAutoConnect()
    }
  }

  const menuItems = [
    { name: 'Explore', path: '/explore' },
    { name: 'How it Works', path: '/how-it-works' },
    { name: 'About', path: '/about' }
  ]

  return (
    <NextNavbar
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="xl"
      className="bg-white/90 backdrop-blur-md shadow-sm"
      isMenuOpen={isMenuOpen}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="font-bold text-xl gradient-text">RaiseHive</span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.name}>
            <Link
              to={item.path}
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-3">
        <NavbarItem className="hidden md:flex">
          <Button
            isIconOnly
            variant="light"
            onClick={() => navigate('/explore')}
          >
            <FiSearch size={20} />
          </Button>
        </NavbarItem>

        {address && isAuthenticated ? (
          <>
            <NavbarItem>
              <Button
                color="secondary"
                variant="solid"
                startContent={<FiPlusCircle />}
                onClick={handleCreateCampaign}
                className="font-semibold"
              >
                Create Campaign
              </Button>
            </NavbarItem>

            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    className="transition-transform hover:scale-110"
                    src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`}
                    size="sm"
                    isBordered
                    color="secondary"
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold text-purple-600">
                      {user?.username || `${address.slice(0, 6)}...${address.slice(-4)}`}
                    </p>
                  </DropdownItem>
                  <DropdownItem 
                    key="dashboard" 
                    onClick={() => navigate('/dashboard')}
                  >
                    Dashboard
                  </DropdownItem>
                  <DropdownItem 
                    key="my-campaigns" 
                    onClick={() => navigate(`/profile/${address}`)}
                  >
                    My Profile
                  </DropdownItem>
                  <DropdownItem 
                    key="logout" 
                    color="danger" 
                    onClick={handleDisconnect}
                  >
                    Disconnect Wallet
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        ) : address && !isAuthenticated && connectionStatus === 'connected' ? (
          // Wallet connected but not authenticated
          <NavbarItem>
            <Button
              color="warning"
              variant="solid"
              onClick={handleRetryAuth}
              isLoading={connecting}
              className="font-semibold"
            >
              {connecting ? 'Authenticating...' : 'Complete Authentication'}
            </Button>
          </NavbarItem>
        ) : (
          <NavbarItem>
            <CustomConnectWallet />
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              to={item.path}
              className="w-full text-lg py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        
        {address && isAuthenticated && (
          <>
            <NavbarMenuItem>
              <Link
                to="/create"
                className="w-full text-lg py-2 text-purple-600 font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Campaign
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                to="/dashboard"
                className="w-full text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </NextNavbar>
  )
}

export default Navbar