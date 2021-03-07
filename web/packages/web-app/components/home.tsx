import React, { useContext, useState } from 'react';
import { AppContext } from '@common/context';
import { Box, Text, Flex, space, BoxProps } from '@blockstack/ui';
import { Auth } from './auth';
import { Mint } from './mint';
import { getBalance } from '@common/get-balance';
import { getStxPrice } from '@common/get-stx-price';

const Container: React.FC<BoxProps> = ({ children, ...props }) => {
  return (
    <Box width="100%" px={6} {...props}>
      <Box maxWidth="900px" mx="auto">
        {children}
      </Box>
    </Box>
  );
};

export const Home: React.FC = () => {
  const state = useContext(AppContext);
  const [tab, setTab] = useState<Tabs>('mint');

  const Page: React.FC = () => {
    const balance = getBalance();
    const price = parseFloat(getStxPrice().price);

    return (
      <>
        <Container>
          {state.userData ? (
            <Box>
              <Text textStyle="body.large" display="block">
                Current $STX balance: {parseInt(balance.balance['stx'], 10) / 1000000} STX
              </Text>
              <Text textStyle="body.large" display="block">
                Current $DIKO balance: {parseInt(balance.balance['arkadiko'], 10) / 1000000} DIKO
              </Text>
              <Text textStyle="body.large" display="block">
                Current $STX price: ${price / 100}
              </Text>
            </Box>
          ) : null }
        </Container>
        <Container>
          <Mint />
        </Container>
      </>
    );
  };
  return (
    <Flex flexWrap="wrap">
      <Container mt={10}>
        <Text as="h1" textStyle="display.large" fontSize={7} mb={space('loose')} display="block">
          Arkadiko Stablecoin Liquidity
        </Text>
      </Container>
      {state.userData ? (
        <Page />
      ) : (
        <Container>
          <Auth />
        </Container>
      )}
    </Flex>
  );
};
