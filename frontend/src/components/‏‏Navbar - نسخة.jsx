import { useState } from 'react'
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
import { useAddress, useDisconnect, ConnectWallet } from '@thirdweb-dev/react'
import { FiSearch, FiPlusCircle } from 'react-icons/fi'
import useAuthStore from '@/store/useAuthStore'
import authService from '@/services/authService'
import { toast } from 'react-toastify'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const address = useAddress()
  const disconnect = useDisconnect()
  const navigate = useNavigate()
  
  const { user, isAuthenticated, setAuth, logout } = useAuthStore()

  const handleConnect = async (walletAddress) => {
    try {
      const response = await authService.loginWithWallet(walletAddress)
      setAuth(response.data.user, response.data.token)
      toast.success('Connected successfully!')
    } catch (error) {
      console.error('Connection error:', error)
      toast.error('Failed to connect')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    logout()
    navigate('/')
    toast.info('Disconnected')
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
      className="bg-white/90 backdrop-blur-md"
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
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden md:flex">
          <Button
            isIconOnly
            variant="light"
            onClick={() => navigate('/explore')}
          >
            <FiSearch size={20} />
          </Button>
        </NavbarItem>

        {isAuthenticated && address ? (
          <>
            <NavbarItem>
              <Button
                as={Link}
                to="/create"
                color="primary"
                variant="flat"
                startContent={<FiPlusCircle />}
              >
                Create Campaign
              </Button>
            </NavbarItem>

            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    className="transition-transform"
                    src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`}
                    size="sm"
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold text-purple-600">
                      {user?.username || `${address.slice(0, 6)}...${address.slice(-4)}`}
                    </p>
                  </DropdownItem>
                  <DropdownItem key="dashboard" onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </DropdownItem>
                  <DropdownItem key="my-campaigns" onClick={() => navigate(`/profile/${address}`)}>
                    My Profile
                  </DropdownItem>
                  <DropdownItem key="settings" onClick={() => navigate('/settings')}>
                    Settings
                  </DropdownItem>
                  <DropdownItem key="logout" color="danger" onClick={handleDisconnect}>
                    Disconnect
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        ) : (
          <NavbarItem>
            <ConnectWallet
              theme="light"
              btnTitle="Connect Wallet"
              modalTitle="Connect to RaiseHive"
              onConnect={() => address && handleConnect(address)}
            />
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              to={item.path}
              className="w-full text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </NextNavbar>
  )
}

export default Navbar