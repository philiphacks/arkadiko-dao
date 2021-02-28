import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  standardPrincipalCV,
} from '@stacks/transactions';
import { resolveNetwork, getContractAddress } from './utils';
import { getUserData, getAppDetails } from './auth';

export async function mint() {
  const addr = getUserData().profile.stxAddress;
  const amountInUSTX = 500 * 1000000;
  const functionArgs = [
    uintCV(amountInUSTX),
    standardPrincipalCV(addr)
  ];
  
  const options = {
    contractAddress: getContractAddress('stx-reserve'),
    contractName: 'stx-reserve',
    functionName: 'collateralize-and-mint',
    functionArgs,
    network: resolveNetwork(),
    appDetails: getAppDetails(),
    onFinish: data => {
      console.log('Stacks Transaction:', data.stacksTransaction);
      console.log('Transaction ID:', data.txId);
      console.log('Raw transaction:', data.txRaw);
    },
  };
  
  await openContractCall(options);
}
