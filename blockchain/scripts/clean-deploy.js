const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function cleanAndDeploy() {
  try {
    console.log('🧹 Cleaning...');
    await execPromise('npx hardhat clean');
    
    console.log('🔨 Compiling...');
    await execPromise('npx hardhat compile');
    
    console.log('🚀 Deploying...');
    await execPromise('npx hardhat run scripts/deploy.js --network sepolia');
    
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanAndDeploy();