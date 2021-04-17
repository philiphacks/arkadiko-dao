require('dotenv').config();
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const tx = require('@stacks/transactions');
const utils = require('./utils');
const network = utils.resolveNetwork();

const auctionId = process.argv.slice(2)[0];
console.log('Trying to end auction with ID', auctionId);

async function getLastBid(lotIndex) {
  const lastBidTx = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: "auction-engine",
    functionName: "get-last-bid",
    functionArgs: [tx.uintCV(auctionId), tx.uintCV(lotIndex)],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  console.log(lastBidTx);
  return tx.cvToJSON(lastBidTx);
}

async function unlockWinningLot(lotIndex) {
  const lastBidTx = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: "auction-engine",
    functionName: "unlock-winning-lot",
    functionArgs: [tx.uintCV(auctionId), tx.uintCV(lotIndex)],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  console.log(lastBidTx);
  return tx.cvToJSON(lastBidTx);
}

async function transact() {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'auction-engine',
    functionName: 'close-auction',
    functionArgs: [tx.uintCV(auctionId)],
    senderKey: process.env.STACKS_PRIVATE_KEY,
    postConditionMode: 1,
    network
  };
  const transaction = await tx.makeContractCall(txOptions);
  const result = tx.broadcastTransaction(transaction, network);
  const status = await utils.processing(result, transaction.txid(), 0);

  console.log(status);
  let lotIndex = 0;
  if (status) {
    // run get last bid for auction id auctionId from 0 to X, until collateral amount = 0 for bid
    let lastBid = await getLastBid(lotIndex);
    if (lastBid['collateral-amount'].value > 0) {
      unlockWinningLot()
    } else {
      return;
    }
    lotIndex += 1;
  }
};

transact();
