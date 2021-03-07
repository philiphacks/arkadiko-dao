import React, { useContext } from 'react';
import { Flex, Box, Button } from '@blockstack/ui';
import { AppContext } from '@common/context';
import { Link } from '@components/link';
import { Link as RouterLink } from 'react-router-dom'
import { useConnect } from '@stacks/connect-react';

interface HeaderProps {
  signOut: () => void;
}

const shortAddress = () => {
  const state = useContext(AppContext);
  if (state.userData) {
    const addr = state.userData.profile.stxAddress['testnet']
    return `${addr.substring(0, 5)}...${addr.substring(addr.length - 1, addr.length - 6)}`;
  }

  return '';
};

export const Header: React.FC<HeaderProps> = ({ signOut }) => {
  const state = useContext(AppContext);
  const env = process.env.REACT_APP_NETWORK_ENV;
  const { doOpenAuth } = useConnect();

  return (
    <Flex as="nav" justifyContent="space-between" alignItems="center" height="64px" px={6}>
      <Box verticalAlign="center">
        Arkadiko
      </Box>
      <Box>
        <Box display="inline-block" color="feedback.success" textStyle="caption.small" mr={5}>using Arkadiko on {env}</Box>
        {state.userData ? (
          <Box display="inline-block">

            <Box display="inline-block" ml={5} mr={5}><RouterLink to="/">Vaults</RouterLink></Box>
            <Box display="inline-block" ml={5} mr={5}><RouterLink to="/governance">Governance</RouterLink></Box>
            <Box display="inline-block" ml={5} mr={5}><RouterLink to="/profile">Docs</RouterLink></Box>
            <Box display="inline-block" ml={5} mr={5}><RouterLink to="/profile">Security</RouterLink></Box>
            <Box display="inline-block" ml={5} mr={5}><RouterLink to="/profile">{shortAddress()}</RouterLink></Box>
            <Link
              display="inline-block"
              ml={5}
              textStyle="caption.medium"
              color="blue"
              onClick={() => {
                signOut();
              }}
            >
              Sign out
            </Link>
          </Box>
        ) :
          <Box display="inline-block">
            <Box display="inline-block" ml={5} mr={5}><RouterLink to="/profile">Docs</RouterLink></Box>
            <Box display="inline-block" ml={5} mr={5}><RouterLink to="/profile">Security</RouterLink></Box>

            <Button mode="secondary" onClick={() => doOpenAuth()}>
              Connect Wallet
            </Button>
          </Box>
        }
      </Box>
    </Flex>
  );
};
