// test-blockchain.js
const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(
  process.env.ETHEREUM_RPC_URL
);

provider.getBlockNumber()
  .then(blockNumber => {
    console.log('✅ Connected to blockchain');
    console.log(`Current block: ${blockNumber}`);
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Blockchain connection failed:', err.message);
    process.exit(1);
  });