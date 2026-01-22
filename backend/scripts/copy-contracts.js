const fs = require('fs');
const path = require('path');

const blockchainArtifactsPath = path.join(__dirname, '../../blockchain/artifacts/contracts');
const backendContractsPath = path.join(__dirname, '../contracts');

// Create contracts directory if it doesn't exist
if (!fs.existsSync(backendContractsPath)) {
  fs.mkdirSync(backendContractsPath, { recursive: true });
}

// Copy Factory ABI
const factoryArtifact = path.join(
  blockchainArtifactsPath,
  'CrowdfundingFactory.sol',
  'CrowdfundingFactory.json'
);

const campaignArtifact = path.join(
  blockchainArtifactsPath,
  'Campaign.sol',
  'Campaign.json'
);

if (fs.existsSync(factoryArtifact)) {
  fs.copyFileSync(
    factoryArtifact,
    path.join(backendContractsPath, 'CrowdfundingFactory.json')
  );
  console.log('✅ Copied CrowdfundingFactory.json');
} else {
  console.log('❌ CrowdfundingFactory artifact not found');
  console.log('   Run: cd ../blockchain && npm run compile');
}

if (fs.existsSync(campaignArtifact)) {
  fs.copyFileSync(
    campaignArtifact,
    path.join(backendContractsPath, 'Campaign.json')
  );
  console.log('✅ Copied Campaign.json');
} else {
  console.log('❌ Campaign artifact not found');
}

console.log('\n✨ Contract ABIs copied successfully!');