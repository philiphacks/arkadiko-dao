import React from 'react';
import { Box, Text, Button } from '@blockstack/ui';
import { mint } from '../mint';

export const Market = () => {
  return (
    <Box width="100%" textAlign="center">
      <Box maxWidth="800px" mx="auto" mt={[2, '30px']}>
        <Text fontWeight="400" fontSize={['24px', '36px']} lineHeight={1} display="block">
          ArkDAO - Stablecoin Liquidity on Stacks and Bitcoin
        </Text>
        <Box p={[5]} borderWidth="1px" borderRadius="lg" overflow="hidden" mt={[2, '30px']}>
          <Text display="block">Mint 500 STX to Stablecoin</Text>
          <Button mt={[1, '5px']} onClick={() => mint()}>Mint</Button>
        </Box>
      </Box>
    </Box>
  );
};
