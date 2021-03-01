import React from 'react';
import { Box, Text, Button } from '@blockstack/ui';

export const Governance = () => {
  return (
    <Box width="100%" textAlign="center">
      <Box maxWidth="800px" mx="auto" mt={[6, '100px']}>
        <Text fontWeight="700" fontSize={['36px', '50px']} lineHeight={1} display="block">
          ArkDAO - Stablecoin Liquidity on Stacks and Bitcoin
        </Text>
        <Box mt={[5, '60px']}>
          <Button onClick={() => false}>Go Vote!</Button>
        </Box>
      </Box>
    </Box>
  );
};
