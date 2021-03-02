import React, { useContext, useState } from 'react';
import { AppContext } from '@common/context';
import { Box, Text, Flex, space, BoxProps } from '@blockstack/ui';
import { Auth } from './auth';
import { Tab } from './tab';
import { Status } from './status';
import { Counter } from './counter';
import { Debugger } from './debugger';
import { getBalance } from '@common/get-balance';
// import { ExplorerLink } from './explorer-link';

type Tabs = 'status' | 'counter' | 'debug';

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
  const [tab, setTab] = useState<Tabs>('debug');
  const balance = getBalance();

  const Page: React.FC = () => {
    return (
      <>
        <Container borderColor="#F0F0F5" borderWidth={0} borderBottomWidth="1px">
          <Box>
            <Text textStyle="body.large" display="block" mb={5}>
              Current STX balance: {parseInt(balance['balance'], 10) / 1000000} STX
            </Text>
          </Box>
          <Flex>
            <Tab active={tab === 'debug'}>
              <Text onClick={() => setTab('debug')}>Mint & Burn</Text>
            </Tab>
            <Tab active={tab === 'status'}>
              <Text onClick={() => setTab('status')}>Borrow & Lend</Text>
            </Tab>
            <Tab active={tab === 'counter'}>
              <Text onClick={() => setTab('counter')}>Governance</Text>
            </Tab>
          </Flex>
        </Container>
        <Container>
          {tab === 'status' && <Status />}
          {tab === 'counter' && <Counter />}
          {tab === 'debug' && <Debugger />}
        </Container>
      </>
    );
  };
  return (
    <Flex flexWrap="wrap">
      <Container mt={space('base-loose')}>
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
