import React, { useState } from 'react';
import { space, Box, Text } from '@blockstack/ui';
import { ExplorerLink } from './explorer-link';
import { Container } from './home';
import { useConnect } from '@stacks/connect-react';
import { getAuthOrigin, stacksNetwork as network } from '@common/utils';
import {
  standardPrincipalCV,
  uintCV
} from '@stacks/transactions';
import { useSTXAddress } from '@common/use-stx-address';

export const NewVault = () => {
  const { doContractCall } = useConnect();
  const address = useSTXAddress();
  const [txId, setTxId] = useState<string>('');
  const [txType, setTxType] = useState<string>('');

  const clearState = () => {
    setTxId('');
    setTxType('');
  };

  const setState = (type: string, id: string) => {
    setTxId(id);
    setTxType(type);
  };

  const callCollateralizeAndMint = async () => {
    clearState();
    const authOrigin = getAuthOrigin();
    const args = [
      uintCV(10 * 1000000),
      standardPrincipalCV(address || '')
    ];
    await doContractCall({
      network,
      authOrigin,
      contractAddress: 'ST31HHVBKYCYQQJ5AQ25ZHA6W2A548ZADDQ6S16GP',
      contractName: 'stx-reserve',
      functionName: 'collateralize-and-mint',
      functionArgs: args,
      postConditionMode: 0x01,
      finished: data => {
        console.log('finished collateralizing!', data);
        console.log(data.stacksTransaction.auth.spendingCondition?.nonce.toNumber());
        setState('Contract Call', data.txId);
      },
    });
  };

  return (
    <Container>
      <Box py={6}>
        <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
          <div className="mt-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                Deposit Stacks and generate sUSD
              </h2>
              {txId && (
                <Text textStyle="body.large" display="block" my={space('base')}>
                  <Text color="green" fontSize={1}>
                    Successfully broadcasted &quot;{txType}&quot;
                  </Text>
                  <ExplorerLink txId={txId} />
                </Text>
              )}

              <div className="bg-white shadow sm:rounded-lg mt-5">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Manage subscription
                  </h3>
                  <div className="mt-2 sm:flex sm:items-start sm:justify-between">
                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae voluptatibus corrupti atque repudiandae nam.
                      </p>
                    </div>
                    <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
                      <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">
                        Change plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </Box>
    </Container>
  );
};
