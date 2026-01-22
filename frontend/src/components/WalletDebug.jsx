import { useAddress } from '@thirdweb-dev/react'
import useAuthStore from '@/store/useAuthStore'
import { Card, CardBody } from '@nextui-org/react'

const WalletDebug = () => {
  const address = useAddress()
  const { user, isAuthenticated, token } = useAuthStore()

  if (import.meta.env.PROD) return null

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 opacity-90">
      <CardBody className="text-xs">
        <div className="font-bold mb-2">🔍 Debug Info</div>
        <div className="space-y-1">
          <div>
            <strong>Wallet:</strong> {address ? `${address.slice(0, 6)}...${address.slice(-4)} ✅` : '❌ Not connected'}
          </div>
          <div>
            <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>User Address:</strong> {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}... ✅` : '❌ None'}
          </div>
          <div>
            <strong>Has Token:</strong> {token ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>Match:</strong> {address?.toLowerCase() === user?.walletAddress?.toLowerCase() ? '✅ Yes' : '❌ No'}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default WalletDebug