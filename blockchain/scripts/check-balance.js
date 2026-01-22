const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log("\n" + "=".repeat(60));
  console.log("💰 WALLET BALANCE CHECK");
  console.log("=".repeat(60));
  console.log(`\n📍 Address: ${deployer.address}`);
  console.log(`💵 Balance: ${hre.ethers.formatEther(balance)} ETH`);
  
  const network = await hre.ethers.provider.getNetwork();
  console.log(`🌐 Network: ${hre.network.name} (Chain ID: ${network.chainId})`);
  
  // Check if sufficient for deployment
  const minRequired = hre.ethers.parseEther("0.01"); // 0.01 ETH minimum
  const hasSufficientFunds = balance >= minRequired;
  
  console.log(`\n💡 Status: ${hasSufficientFunds ? '✅ Sufficient funds' : '❌ Insufficient funds'}`);
  
  if (!hasSufficientFunds) {
    console.log(`⚠️  Need at least 0.01 ETH for deployment`);
    console.log(`⚠️  Please get testnet ETH from a faucet`);
  }
  
  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });