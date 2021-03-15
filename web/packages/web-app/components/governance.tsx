import React, { useContext } from 'react';
import { Box } from '@blockstack/ui';
import { AppContext } from '@common/context';
import { Redirect } from 'react-router-dom';
import { Container } from './home';
import { getAuthOrigin, stacksNetwork as network } from '@common/utils';
import { useConnect } from '@stacks/connect-react';
import { uintCV, stringAsciiCV } from '@stacks/transactions';

export const Governance = () => {
  const state = useContext(AppContext);
  const { doContractCall } = useConnect();

  const callAddProposal = async () => {
    const authOrigin = getAuthOrigin();
    const content = "<h2>Proposal</h2><p>Add new stability parameter</p>";
    await doContractCall({
      network,
      authOrigin,
      contractAddress: 'ST31HHVBKYCYQQJ5AQ25ZHA6W2A548ZADDQ6S16GP',
      contractName: 'dao',
      functionName: 'propose',
      functionArgs: [uintCV(200), stringAsciiCV(content)],
      postConditionMode: 0x01,
      finished: data => {
        console.log('finished burn!', data);
        console.log(data.stacksTransaction.auth.spendingCondition?.nonce.toNumber());
        window.location.href = '/';
      },
    });
  };
  // callAddProposal();

  return (
    <Box>
      {state.userData ? (
        <Container>
          <Box py={6}>
            <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
              <div className="mt-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                  <div className="bg-indigo-700">
                    <div className="max-w-2xl mx-auto text-center py-5 px-4 sm:py-5 sm:px-6 lg:px-8">
                      <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">Arkadiko Governance</span>
                      </h2>
                      <p className="mt-4 text-lg leading-6 text-indigo-200">
                        ARE tokens represent voting shares in Arkadiko governance. You can vote on each proposal yourself and cannot delegate any votes.
                      </p>
                    </div>
                  </div>

                  <h2 className="text-lg leading-6 font-medium text-gray-900 mt-8">Proposals</h2>
                  <p>There are currently no proposals to vote on.</p>
                </div>
              </div>
            </main>
          </Box>
        </Container>
      ) : (
        <Redirect to={{ pathname: '/' }} />
      )}
    </Box>
  );
};
