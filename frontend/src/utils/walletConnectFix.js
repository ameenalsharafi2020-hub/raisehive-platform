// Prevent WalletConnect modal from closing automatically
export const fixWalletConnectModal = () => {
  // Prevent clicks outside modal from closing it immediately
  document.addEventListener('click', (e) => {
    const isModalBackdrop = e.target.classList.contains('wcm-overlay')
    if (isModalBackdrop) {
      e.stopPropagation()
      e.preventDefault()
      console.log('🛡️ Prevented modal close')
    }
  }, true)

  // Keep QR code visible
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          // Check for WalletConnect modal
          if (node.classList?.contains('wcm-modal') || 
              node.querySelector?.('[class*="walletconnect"]')) {
            console.log('👀 WalletConnect modal detected')
            
            // Prevent auto-close
            node.style.pointerEvents = 'auto'
            node.style.opacity = '1'
            
            // Find and fix QR code
            const qrCode = node.querySelector('canvas')
            if (qrCode) {
              qrCode.style.minWidth = '300px'
              qrCode.style.minHeight = '300px'
              qrCode.style.display = 'block'
              qrCode.style.margin = '20px auto'
              console.log('✅ QR Code fixed')
            }
          }
        }
      })
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  console.log('🔧 WalletConnect fix initialized')
}