import React from 'react';
import { Flex, Box, Text } from '@blockstack/ui';
import { getPerson, getUserData, userSession } from '../auth';
import { Logo } from './icons/logo';
import { Link } from 'react-router-dom'

const Auth = () => {
  if (!userSession.isUserSignedIn()) {
    return null;
  }

  const Avatar = () => {
    const person = getPerson();

    if (person.avatarUrl()) {
      return (
        <Box
          borderRadius="50%"
          width="24px"
          height="24px"
          display="inline-block"
          overflow="hidden"
          mr={2}
          style={{ position: 'relative', top: '6px' }}
        >
          <Box as="img" src={person.avatarUrl()} maxWidth="100%" minHeight="24px" minWidth="24px" />
        </Box>
      );
    }
    return null;
  };

  const shortAddress = () => {
    const addr = getUserData().profile.stxAddress;

    return `${addr.substring(0, 5)}...${addr.substring(addr.length - 1, addr.length - 6)}`;
  };

  return (
    <Box>
      <Avatar />
      <Link to ="/"><Text fontWeight="300">Market</Text></Link>
      <Link to ="/governance"><Text fontWeight="300" ml={5}>Governance</Text></Link>
      <Link to ="/profile"><Text fontWeight="300" ml={5}>{shortAddress()}</Text></Link>
      <Text
        fontWeight="300"
        display="inline-block"
        ml={5}
        color="ink.400"
        cursor="pointer"
        onClick={() => {
          userSession.signUserOut();
          window.location = '/';
        }}
      >
        Sign out
      </Text>
    </Box>
  );
};

export const Header = () => {
  return (
    <Flex width="100%" justifyContent="space-between" px={4} py={3}>
      <Box alignItems onClick={() => (document.location = '/')} cursor="pointer">
        <Logo style={{ position: 'relative', top: '-1px' }} />
        <Text ml={2} display="inline-block" fontWeight="600">
          ArkDAO
        </Text>
      </Box>
      <Auth />
    </Flex>
  );
};
