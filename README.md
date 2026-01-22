# 🚀 RaiseHive - Blockchain Crowdfunding Platform

<div align="center">
  
![RaiseHive Logo](https://img.shields.io/badge/RaiseHive-Blockchain_Crowdfunding-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.19-363636)
![React](https://img.shields.io/badge/React-18.2-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-16.x-339933)

A decentralized crowdfunding platform built on Ethereum blockchain that enables creators to raise funds transparently and securely.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Demo](#-demo) • [API](#-api) • [Contributing](#-contributing)

</div>

## ✨ Features

### 🎯 **For Creators**
- ✅ Create blockchain-based crowdfunding campaigns
- 💰 Set funding goals and deadlines
- 📊 Real-time campaign analytics
- 🎨 Customizable campaign pages
- 📝 Post updates and milestones
- 💸 Secure fund withdrawal system

### 🤝 **For Backers**
- 🔍 Discover innovative projects
- 💳 Contribute with cryptocurrency (ETH)
- 🔒 Transparent contribution tracking
- 🔄 Automatic refunds for failed campaigns
- 💬 Engage with creators
- ❤️ Support multiple campaigns

### 🏗️ **Platform Features**
- 🔐 Secure wallet authentication
- 🌐 Fully decentralized & transparent
- ⚡ Low platform fees (2.5%)
- 📱 Mobile-responsive design
- 🔔 Real-time notifications
- 📈 Advanced analytics dashboard

## 🛠️ Tech Stack

### 🔗 **Blockchain Layer**
| Technology | Purpose | Version |
|------------|---------|---------|
| **Solidity** | Smart Contracts | ^0.8.19 |
| **Hardhat** | Development Environment | Latest |
| **OpenZeppelin** | Secure Contract Libraries | Latest |
| **Ethers.js** | Blockchain Interaction | v5 |
| **Thirdweb** | Web3 Integration | Latest |

### 🎨 **Frontend**
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.2 |
| **Vite** | Build Tool | 3.x |
| **Tailwind CSS** | Styling | 3.4 |
| **NextUI** | Component Library | Latest |
| **Framer Motion** | Animations | Latest |
| **React Router** | Routing | v6 |
| **Zustand** | State Management | Latest |

### ⚙️ **Backend**
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime | 16.x |
| **Express.js** | Web Framework | Latest |
| **MongoDB Atlas** | Database | Latest |
| **Mongoose** | ODM | Latest |
| **JWT** | Authentication | Latest |
| **Nodemailer** | Email Service | Latest |

## 📁 Project Structure

```
raisehive-platform/
├── 📦 blockchain/          # Smart Contracts
│   ├── contracts/         # Solidity contracts
│   │   ├── CrowdfundingFactory.sol
│   │   └── Campaign.sol
│   ├── scripts/          # Deployment scripts
│   ├── test/             # Contract tests
│   └── hardhat.config.js
├── ⚙️ backend/            # Node.js API
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Auth & validation
│   └── server.js        # Entry point
└── 🎨 frontend/          # React Application
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── services/    # API services
    │   ├── store/       # State management
    │   ├── hooks/       # Custom hooks
    │   └── App.jsx      # Main component
    └── vite.config.js
```

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) ≥ 16.x
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MetaMask](https://metamask.io/) wallet
- [MongoDB Atlas](https://www.mongodb.com/atlas) account
- Ethereum testnet ETH (Sepolia)

### Installation Steps

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/raisehive-platform.git
cd raisehive-platform
```

#### 2️⃣ Setup Blockchain
```bash
cd blockchain
npm install
cp .env.example .env
# Configure your .env file
npm run compile
npm run deploy:sepolia
```

#### 3️⃣ Setup Backend
```bash
cd ../backend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

#### 4️⃣ Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd blockchain
npm test
```

### Test with Coverage
```bash
npm run test:coverage
```

## 📋 Smart Contracts

### 🏭 CrowdfundingFactory.sol
**Main factory contract for campaign management**

```solidity
// Key Functions:
createCampaign()        // Deploy new campaign
getAllCampaigns()       // List all campaigns
getCampaignsByCreator() // Get creator's campaigns
updatePlatformFee()     // Admin: update fee percentage
```

### 🎯 Campaign.sol
**Individual campaign contract**

```solidity
// Key Functions:
contribute()          // Back a campaign
withdrawFunds()       // Creator withdraw funds
requestRefund()       // Backer get refund
completeMilestone()   // Mark milestone complete
cancelCampaign()      // Cancel campaign
```

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| **Reentrancy Protection** | OpenZeppelin ReentrancyGuard |
| **Access Control** | Role-based with OpenZeppelin |
| **Input Validation** | Extensive parameter checks |
| **Safe Math** | Built-in overflow protection |
| **Emergency Stop** | Pausable functionality |
| **Secure Auth** | Wallet-based authentication |
| **API Protection** | Rate limiting & CORS |

## 📡 API Reference

### 🔑 Authentication
```http
POST   /api/auth/nonce     # Get nonce for signing
POST   /api/auth/wallet    # Authenticate with wallet
GET    /api/auth/me        # Get current user
PUT    /api/auth/profile   # Update profile
```

### 🎯 Campaigns
```http
GET    /api/campaigns                 # List all campaigns
GET    /api/campaigns/:id            # Get campaign details
POST   /api/campaigns                # Create campaign
PUT    /api/campaigns/:id            # Update campaign
POST   /api/campaigns/:id/updates    # Add update
POST   /api/campaigns/:id/comments   # Add comment
```

### 👤 Users
```http
GET /api/users/:address           # Get user profile
GET /api/users/:address/campaigns # Get user's campaigns
```

## 🚢 Deployment

### Smart Contracts to Mainnet
```bash
cd blockchain
npm run deploy:mainnet
```

### Backend Deployment
```bash
cd backend
npm run build
npm start
# Deploy to: Heroku, AWS, DigitalOcean
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy dist/ to: Vercel, Netlify, AWS S3
```

## 🤝 Contributing

We love your input! Want to contribute? Here's how:

1. **Fork** the project
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Write clear commit messages
- Add tests for new features
- Update documentation
- Follow existing code style
- Ensure all tests pass

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Team

- **Ameen Alsharafi** - Full Stack & Blockchain Developer  
  📧 ameenalsharafi2020@gmail.com  
  🌐 [tech-for-students.com](https://tech-for-students.com/)

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [Thirdweb](https://thirdweb.com/) for Web3 integration tools
- [NextUI](https://nextui.org/) for beautiful components
- The amazing Ethereum community

## 📞 Contact & Support

Having issues or questions?

- **Email**: ameenalsharafi2020@gmail.com
- **Website**: [tech-for-students.com](https://tech-for-students.com/)
- **Issue Tracker**: [GitHub Issues](https://github.com/ameenalsharafi2020-hub/raisehive-platform/issues)

---

<div align="center">

### ⭐ Star us on GitHub if you like this project!



</div>
