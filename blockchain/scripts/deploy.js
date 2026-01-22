const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying RaiseHive Smart Contracts...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy CrowdfundingFactory
  console.log("📦 Deploying CrowdfundingFactory...");
  const CrowdfundingFactory = await hre.ethers.getContractFactory("CrowdfundingFactory");
  const factory = await CrowdfundingFactory.deploy();
  
  // Wait for deployment
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("✅ CrowdfundingFactory deployed to:", factoryAddress);
  
  // Get platform fee
  const platformFee = await factory.platformFee();
  console.log("🔍 Platform Fee:", platformFee.toString(), "basis points\n");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: network.chainId.toString(),
    factoryAddress: factoryAddress,
    deployer: deployer.address,
    deployerBalance: hre.ethers.formatEther(balance),
    timestamp: new Date().toISOString(),
    platformFee: platformFee.toString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  console.log("📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info to file
  const filename = `${hre.network.name}-${Date.now()}.json`;
  const filePath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\n💾 Deployment info saved to: deployments/${filename}`);

  // Also save latest deployment for easy access
  const latestPath = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
  fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Latest deployment saved to: deployments/${hre.network.name}-latest.json`);

  // Verify on Etherscan (if not local)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    
    // Wait for 6 confirmations
    const deploymentTx = factory.deploymentTransaction();
    if (deploymentTx) {
      await deploymentTx.wait(6);
      console.log("✅ Confirmed!");
    }
    
    console.log("\n🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      if (error.message.includes("Already Verified") || error.message.includes("already verified")) {
        console.log("✅ Contract already verified on Etherscan");
      } else {
        console.log("⚠️ Verification failed:", error.message);
        console.log("\nYou can verify manually later with:");
        console.log(`npx hardhat verify --network ${hre.network.name} ${factoryAddress}`);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✨ DEPLOYMENT COMPLETED SUCCESSFULLY! ✨");
  console.log("=".repeat(60));
  
  console.log("\n📝 NEXT STEPS:");
  console.log("─".repeat(60));
  console.log("\n1️⃣  Update Backend Environment:");
  console.log(`   Edit: backend/.env`);
  console.log(`   Set: FACTORY_CONTRACT_ADDRESS=${factoryAddress}`);
  
  console.log("\n2️⃣  Update Frontend Environment:");
  console.log(`   Edit: frontend/.env`);
  console.log(`   Set: VITE_FACTORY_CONTRACT_ADDRESS=${factoryAddress}`);
  
  console.log("\n3️⃣  Start the Backend:");
  console.log(`   cd backend`);
  console.log(`   npm run dev`);
  
  console.log("\n4️⃣  Start the Frontend:");
  console.log(`   cd frontend`);
  console.log(`   npm run dev`);
  
  console.log("\n" + "─".repeat(60));
  console.log("\n🔗 IMPORTANT ADDRESSES:");
  console.log("─".repeat(60));
  console.log(`\n📍 Factory Contract: ${factoryAddress}`);
  console.log(`🌐 Network: ${hre.network.name} (Chain ID: ${network.chainId})`);
  console.log(`👤 Deployer: ${deployer.address}`);
  
  if (hre.network.name === "sepolia") {
    console.log(`\n🔍 View on Etherscan:`);
    console.log(`   https://sepolia.etherscan.io/address/${factoryAddress}`);
  }
  
  console.log("\n" + "=".repeat(60) + "\n");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n" + "=".repeat(60));
    console.error("❌ DEPLOYMENT FAILED");
    console.error("=".repeat(60));
    console.error("\nError:", error.message);
    console.error("\nStack trace:", error.stack);
    console.error("\n" + "=".repeat(60) + "\n");
    process.exit(1);
  });