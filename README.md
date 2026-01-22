## README.md (Root)

```markdown
# 🚀 RaiseHive - Blockchain Crowdfunding Platform

A decentralized crowdfunding platform built on Ethereum blockchain that enables creators to raise funds transparently and securely.

![RaiseHive](https://img.shields.io/badge/Blockchain-Ethereum-blue)
![Smart Contracts](https://img.shields.io/badge/Solidity-0.8.19-green)
![Frontend](https://img.shields.io/badge/React-18.2-cyan)
![Backend](https://img.shields.io/badge/Node.js-Express-yellow)

## ✨ Features

### For Creators
- 🎯 Create crowdfunding campaigns on the blockchain
- 💰 Set funding goals and deadlines
- 📊 Track campaign performance in real-time
- 🎨 Customizable campaign pages with rich media
- 📝 Post updates to keep backers informed
- ✅ Define and complete project milestones
- 💸 Automatic fund withdrawal when goals are met

### For Backers
- 🔍 Discover innovative projects across categories
- 💳 Contribute using cryptocurrency (ETH)
- 🔒 Transparent tracking of all contributions
- 🔄 Automatic refunds for unsuccessful campaigns
- 💬 Comment and engage with creators
- ❤️ Support multiple campaigns

### Platform Features
- 🔐 Secure wallet-based authentication
- 🌐 Decentralized and transparent
- ⚡ Low platform fees (2.5%)
- 📱 Responsive design for all devices
- 🔔 Real-time notifications
- 📈 Advanced analytics dashboard

## 🏗️ Tech Stack

### Blockchain Layer
- **Solidity** ^0.8.19 - Smart contract development
- **Hardhat** - Development environment
- **OpenZeppelin** - Secure contract libraries
- **Ethers.js** v5 - Blockchain interaction
- **Thirdweb** - Web3 integration

### Frontend
- **React** 18.2 - UI framework
- **Vite** 3 - Build tool
- **Tailwind CSS** 3.4 - Styling
- **NextUI** - Component library
- **Framer Motion** - Animations
- **React Router** v6 - Routing
- **Zustand** - State management
- **React Toastify** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **Mongoose** - ODM
- **Nodemailer** - Email service
- **Node-cron** - Scheduled tasks
- **Pino** - Logging
- **JWT** - Authentication

## 📁 Project Structure

```
raisehive-platform/
├── blockchain/              # Smart contracts
│   ├── contracts/
│   │   ├── CrowdfundingFactory.sol
│   │   └── Campaign.sol
│   ├── scripts/
│   ├── test/
│   └── hardhat.config.js
├── backend/                 # Node.js API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── jobs/
│   └── server.js
├── frontend/               # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.x
- npm or yarn
- MetaMask wallet
- MongoDB Atlas account
- Ethereum testnet ETH (Sepolia)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/raisehive-platform.git
cd raisehive-platform
```

2. **Install Blockchain Dependencies**
```bash
cd blockchain
npm install
```

3. **Configure Blockchain Environment**
```bash
cp .env.example .env
# Edit .env with your values:
# - SEPOLIA_RPC_URL
# - PRIVATE_KEY
# - ETHERSCAN_API_KEY
```

4. **Compile and Deploy Smart Contracts**
```bash
npm run compile
npm run deploy:sepolia
# Save the deployed factory contract address
```

5. **Install Backend Dependencies**
```bash
cd ../backend
npm install
```

6. **Configure Backend Environment**
```bash
cp .env.example .env
# Edit .env with:
# - MONGODB_URI
# - JWT_SECRET
# - FACTORY_CONTRACT_ADDRESS (from step 4)
# - EMAIL credentials
```

7. **Start Backend Server**
```bash
npm run dev
# Server runs on http://localhost:5000
```

8. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

9. **Configure Frontend Environment**
```bash
cp .env.example .env
# Edit .env with:
# - VITE_FACTORY_CONTRACT_ADDRESS
# - VITE_THIRDWEB_CLIENT_ID
```

10. **Start Frontend Development Server**
```bash
npm run dev
# App runs on http://localhost:5173
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd blockchain
npm test
```

### Run with Coverage
```bash
npm run test:coverage
```

## 📝 Smart Contract Architecture

### CrowdfundingFactory.sol
Main factory contract that creates and manages campaign instances.

**Key Functions:**
- `createCampaign()` - Deploy new campaign contract
- `getAllCampaigns()` - Get all campaign addresses
- `getCampaignsByCreator()` - Get user's campaigns
- `updatePlatformFee()` - Admin function to update fees

### Campaign.sol
Individual campaign contract with funding logic.

**Key Functions:**
- `contribute()` - Accept contributions
- `withdrawFunds()` - Creator withdraws funds (if successful)
- `requestRefund()` - Contributor requests refund (if failed)
- `completeMilestone()` - Mark milestone as complete
- `cancelCampaign()` - Creator cancels campaign

## 🔐 Security Features

- ✅ ReentrancyGuard protection
- ✅ Access control with OpenZeppelin
- ✅ Safe math operations
- ✅ Input validation
- ✅ Emergency pause functionality
- ✅ Secure wallet authentication
- ✅ Rate limiting on API
- ✅ CORS protection

## 📊 API Endpoints

### Authentication
- `POST /api/auth/nonce` - Get nonce for signing
- `POST /api/auth/wallet` - Authenticate with wallet
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `POST /api/campaigns/:id/updates` - Add update
- `POST /api/campaigns/:id/comments` - Add comment

### Users
- `GET /api/users/:address` - Get user profile
- `GET /api/users/:address/campaigns` - Get user's campaigns

### Blockchain
- `POST /api/blockchain/sync/:address` - Sync campaign data
- `GET /api/blockchain/stats/:address` - Get blockchain stats

## 🌐 Deployment

### Smart Contracts
Deploy to mainnet:
```bash
cd blockchain
npm run deploy:mainnet
```

### Backend
Deploy to your preferred hosting (Heroku, AWS, etc.):
```bash
# Build and start
npm start
```

### Frontend
Build for production:
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel, Netlify, etc.
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Your Name** - Full Stack & Blockchain Developer

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Thirdweb for Web3 integration tools
- NextUI for beautiful components
- The Ethereum community

## 📞 Contact

- Website: (https://tech-for-students.com/))
- Email: ameenalsharafi2020@gmail.com

