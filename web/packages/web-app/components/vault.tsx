import React from 'react';
import { Box, Flex, Text, Button } from '@blockstack/ui';
import { getAuthOrigin, stacksNetwork as network } from '@common/utils';
import { useSTXAddress } from '@common/use-stx-address';
import { useConnect } from '@stacks/connect-react';
import {
  uintCV,
  standardPrincipalCV
} from '@stacks/transactions';

export const Vault: React.FC = () => {
  const { doContractCall } = useConnect();
  const address = useSTXAddress();

  const callBurn = async () => {
    const authOrigin = getAuthOrigin();
    await doContractCall({
      network,
      authOrigin,
      contractAddress: 'ST31HHVBKYCYQQJ5AQ25ZHA6W2A548ZADDQ6S16GP',
      contractName: 'stx-reserve',
      functionName: 'burn',
      functionArgs: [uintCV(2), standardPrincipalCV(address || '')],
      finished: data => {
        console.log('finished burn!', data);
        console.log(data.stacksTransaction.auth.spendingCondition?.nonce.toNumber());
      },
    });
  };

  return (
    <Box p="5" maxWidth="320px" borderWidth="1px">
      <Text mt={2} fontSize="xl" fontWeight="semibold" lineHeight="short">
        Vault 1
      </Text>
      <Flex mt={2} align="center">
        <Text ml={1} fontSize="sm">
          <b>STX in collateral</b>: 50
        </Text>
      </Flex>
      <Flex mt={2} align="center">
        <Text ml={1} fontSize="sm">
          <b>Amount of $DIKO</b>: 25
        </Text>
      </Flex>
      <Flex mt={2} align="center">
        <Text ml={1} fontSize="sm">
          <b>Current Collateral to Debt</b>: 200
        </Text>
      </Flex>
      <Flex mt={2} align="center">
        <Button mt={3} onClick={() => callBurn()}>
          Burn Stablecoin in Vault
        </Button>
      </Flex>
    </Box>
  );
};
