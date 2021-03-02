import React, { useContext, useState } from 'react';
import { AppContext } from '@common/context';
import { Box, Text, Flex, space, BoxProps } from '@blockstack/ui';
import { Auth } from './auth';
import { Tab } from './tab';
import { Borrow } from './borrow';
import { Governance } from './governance';
import { Vault } from './vault';
import { getBalance } from '@common/get-balance';
// import { ExplorerLink } from './explorer-link';

type Tabs = 'borrow' | 'governance' | 'vault';

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
  const [tab, setTab] = useState<Tabs>('vault');
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
            <Tab active={tab === 'vault'}>
              <Text onClick={() => setTab('vault')}>Mint & Burn</Text>
            </Tab>
            <Tab active={tab === 'borrow'}>
              <Text onClick={() => setTab('borrow')}>Borrow & Lend</Text>
            </Tab>
            <Tab active={tab === 'governance'}>
              <Text onClick={() => setTab('governance')}>Governance</Text>
            </Tab>
          </Flex>
        </Container>
        <Container>
          {tab === 'borrow' && <Borrow />}
          {tab === 'governance' && <Governance />}
          {tab === 'vault' && <Vault />}
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
