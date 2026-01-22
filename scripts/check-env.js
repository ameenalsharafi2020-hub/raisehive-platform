const fs = require('fs');
const path = require('path');

const checkEnvFile = (filePath, requiredVars) => {
  console.log(`\n🔍 Checking ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  const envContent = fs.readFileSync(filePath, 'utf8');
  const missingVars = [];

  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm');
    if (!regex.test(envContent)) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.log(`❌ Missing variables:`);
    missingVars.forEach(v => console.log(`   - ${v}`));
    return false;
  }

  console.log(`✅ All required variables present`);
  return true;
};

// Required variables for each .env file
const blockchainVars = [
  'SEPOLIA_RPC_URL',
  'PRIVATE_KEY',
  'ETHERSCAN_API_KEY'
];

const backendVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'ETHEREUM_RPC_URL',
  'FACTORY_CONTRACT_ADDRESS',
  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_PASS'
];

const frontendVars = [
  'VITE_API_URL',
  'VITE_FACTORY_CONTRACT_ADDRESS',
  'VITE_THIRDWEB_CLIENT_ID',
  'VITE_CHAIN_ID'
];

console.log('🚀 Checking environment files...\n');

const blockchainOk = checkEnvFile(
  path.join(__dirname, '../blockchain/.env'),
  blockchainVars
);

const backendOk = checkEnvFile(
  path.join(__dirname, '../backend/.env'),
  backendVars
);

const frontendOk = checkEnvFile(
  path.join(__dirname, '../frontend/.env'),
  frontendVars
);

console.log('\n' + '='.repeat(50));
if (blockchainOk && backendOk && frontendOk) {
  console.log('✅ All environment files configured correctly!');
} else {
  console.log('❌ Some environment files need attention');
  console.log('\nPlease check the missing variables above.');
}
console.log('='.repeat(50) + '\n');