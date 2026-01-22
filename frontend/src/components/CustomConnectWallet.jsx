import { ConnectWallet } from '@thirdweb-dev/react'
import { useState } from 'react'

const CustomConnectWallet = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="relative">
      <ConnectWallet
        theme="light"
        modalSize="wide"
        btnTitle="Connect Wallet"
        modalTitle="Connect to RaiseHive"
        switchToActiveChain={true}
        className="connect-wallet-button"
        detailsBtn={() => {
          return (
            <button className="px-6 py-2 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-secondary-600 transition-colors">
              My Wallet
            </button>
          )
        }}
        style={{
          backgroundColor: '#d946ef',
          color: 'white',
          fontWeight: '600',
          borderRadius: '0.5rem',
          padding: '0.5rem 1.5rem',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40px',
          opacity: 1,
          visibility: 'visible'
        }}
        onOpen={() => {
          console.log('🔓 Wallet modal opened')
          setIsModalOpen(true)
        }}
        onClose={() => {
          console.log('🔒 Wallet modal closed')
          setIsModalOpen(false)
        }}
      />
      
      {/* Debug overlay */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full bg-yellow-100 p-2 text-center text-sm z-[100000]">
          ⚠️ Keep QR Code open - Don't click outside
        </div>
      )}
    </div>
  )
}

export default CustomConnectWallet