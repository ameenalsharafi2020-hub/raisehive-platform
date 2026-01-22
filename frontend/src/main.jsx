import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { NextUIProvider } from '@nextui-org/react'
import { 
  ThirdwebProvider,
  metamaskWallet,
  walletConnect,
  coinbaseWallet
} from '@thirdweb-dev/react'
import { Sepolia } from '@thirdweb-dev/chains'
import App from './App.jsx'
import './index.css'

const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID

console.log('🔧 Configuration:')
console.log('WalletConnect ID:', WALLETCONNECT_PROJECT_ID || '❌ MISSING')
console.log('Thirdweb ID:', THIRDWEB_CLIENT_ID || '⚠️ Optional')

if (!WALLETCONNECT_PROJECT_ID) {
  console.error('⛔ VITE_WALLETCONNECT_PROJECT_ID is required for QR Code!')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThirdwebProvider
        clientId={THIRDWEB_CLIENT_ID}
        activeChain={Sepolia}
        supportedChains={[Sepolia]}
        supportedWallets={[
          metamaskWallet({
            recommended: true
          }),
          walletConnect({
            projectId: WALLETCONNECT_PROJECT_ID || 'dummy-id-for-development',
            qrModalOptions: {
              themeMode: 'light',
              themeVariables: {
                '--wcm-z-index': '999999',
                '--wcm-accent-color': '#d946ef',
                '--wcm-background-color': '#d946ef'
              },
              // Prevent auto-close
              enableExplorer: true,
              explorerRecommendedWalletIds: [
                'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
              ]
            }
          }),
          coinbaseWallet()
        ]}
        autoConnect={true}
        autoSwitch={true}
        dAppMeta={{
          name: "RaiseHive",
          description: "Decentralized Crowdfunding Platform",
          url: window.location.origin,
          logoUrl: "https://via.placeholder.com/150",
        }}
      >
        <NextUIProvider>
          <App />
        </NextUIProvider>
      </ThirdwebProvider>
    </BrowserRouter>
  </React.StrictMode>,
)