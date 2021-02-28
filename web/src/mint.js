import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  standardPrincipalCV,
} from '@stacks/transactions';
import { resolveNetwork, getContractAddress } from 'utils';
import { getAppDetails } from 'auth';

export function mint(recipientAddress, amountInUSTX) {
  const functionArgs = [
    uintCV(amountInUSTX),
    standardPrincipalCV(recipientAddress)
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
