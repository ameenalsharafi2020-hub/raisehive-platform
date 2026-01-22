import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'

const chains = [sepolia]
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID' // Get from https://cloud.walletconnect.com/

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})

export const ethereumClient = new EthereumClient(wagmiConfig, chains)

export { projectId }