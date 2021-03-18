import React from 'react';
import { Box } from '@blockstack/ui';
import { Container } from './home';

export const ViewProposal = ({ match }) => {
  return (
    <Box>
      <Container>
        Proposal {match.params.id}
      </Container>
    </Box>
  );
};
