import React, { useState } from 'react';
import { Box, Text } from '@blockstack/ui';
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
              <h2 className="text-lg leading-6 font-medium text-gray-900">Overview</h2>

              <ExplorerLink
                txId="ST31HHVBKYCYQQJ5AQ25ZHA6W2A548ZADDQ6S16GP.stx-reserve"
                text="View contract in explorer"
                skipConfirmCheck
              />
              {txId && (
                <Text textStyle="body.large" display="block" my={space('base')}>
                  <Text color="green" fontSize={1}>
                    Successfully broadcasted &quot;{txType}&quot;
                  </Text>
                  <ExplorerLink txId={txId} />
                </Text>
              )}

              <h2 className="text-3xl font-extrabold text-gray-900 text-center">
                TBD
              </h2>
            </div>
          </div>
        </main>
      </Box>
    </Container>
  );
};
