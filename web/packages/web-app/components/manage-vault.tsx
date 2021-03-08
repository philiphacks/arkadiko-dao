import React, { useState } from 'react';
import { Box } from '@blockstack/ui';
import { Container } from './home';
import { useConnect } from '@stacks/connect-react';
import { getAuthOrigin, stacksNetwork as network } from '@common/utils';
import {
  standardPrincipalCV,
  uintCV
} from '@stacks/transactions';
import { useSTXAddress } from '@common/use-stx-address';

export const ManageVault = ({ match }) => {
  const { doContractCall } = useConnect();

  return (
    <Container>
      <Box py={6}>
        <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
          <div className="mt-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Vault {match.params.id}
              </h2>
            </div>
          </div>
        </main>
      </Box>
    </Container>
  )
};
