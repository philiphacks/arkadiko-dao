import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '@common/context';
import { Box, Text, Modal } from '@blockstack/ui';
import { Redirect } from 'react-router-dom';
import { Container } from './home'
import { getAuthOrigin, stacksNetwork as network } from '@common/utils';
import { useConnect } from '@stacks/connect-react';
import { callReadOnlyFunction, cvToJSON, tupleCV, uintCV } from '@stacks/transactions';
import { useSTXAddress } from '@common/use-stx-address';
import { AuctionGroup } from '@components/auction-group';

export const Auctions: React.FC = () => {
  const state = useContext(AppContext);
  const { doContractCall } = useConnect();
  const stxAddress = useSTXAddress();
  const [auctions, setAuctions] = useState([]);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidAuctionId, setBidAuctionId] = useState(0);

  const registerStacker = async () => {
    const authOrigin = getAuthOrigin();
    await doContractCall({
      network,
      authOrigin,
      contractAddress: 'ST31HHVBKYCYQQJ5AQ25ZHA6W2A548ZADDQ6S16GP',
      contractName: 'stacker-registry',
      functionName: 'register',
      functionArgs: [],
      postConditionMode: 0x01,
      finished: data => {
        console.log('finished registering stacking!', data);
        window.location.href = '/';
      },
    });
  };

  useEffect(() => {
    let mounted = true;

    const getData = async () => {
      const auctions = await callReadOnlyFunction({
        contractAddress: 'ST31HHVBKYCYQQJ5AQ25ZHA6W2A548ZADDQ6S16GP',
        contractName: "auction-engine",
        functionName: "get-auctions",
        functionArgs: [],
        senderAddress: stxAddress || '',
        network: network,
      });
      const json = cvToJSON(auctions);
      let serializedAuctions:Array<{ id: string, 'ustx-amount': string, 'debt': string, 'ends-at': string }> = [];
      json.value.value.forEach((e: object) => {
        const vault = tupleCV(e);
        const data = vault.data.value;
        if (data['is-open'].value) {
          serializedAuctions.push({
            id: data['id'].value,
            'collateral-amount': data['collateral-amount'].value,
            'debt': data['debt-to-raise'].value,
            'ends-at': data['ends-at'].value
          });
        }
      });

      setAuctions(serializedAuctions);
    };
    if (mounted) {
      void getData();
    }

    return () => { mounted = false; }
  }, []);

  const onInputChange = (event) => {
    const value = event.target.value;
    setBidAmount(value);
  };


  const addDeposit = async () => {
    if (!bidAmount) {
      return;
    }

    const authOrigin = getAuthOrigin();
    await doContractCall({
      network,
      authOrigin,
      contractAddress: 'ST31HHVBKYCYQQJ5AQ25ZHA6W2A548ZADDQ6S16GP',
      contractName: 'auction-engine',
      functionName: 'bid',
      functionArgs: [uintCV(1), uintCV(2180000), uintCV(3955000)],
      postConditionMode: 0x01,
      finished: data => {
        console.log('finished deposit!', data);
        console.log(data.stacksTransaction.auth.spendingCondition?.nonce.toNumber());
      },
    });
  };

  return (
    <Box>
      {state.userData ? (
        <Container>

          <Modal isOpen={showBidModal}>
            <div className="flex pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="inline-block align-bottom bg-white rounded-lg px-2 pt-5 pb-4 text-left overflow-hidden sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                      Bid on Auction
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bidding $2.2 will close the auction and assign you the collateral.
                      </p>

                      <div className="mt-4 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          $
                        </div>
                        <input type="text" name="stx" id="stxAmount"
                              value={bidAmount}
                              onChange={onInputChange}
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00" aria-describedby="stx-currency" />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm" id="stx-currency">
                            xUSD
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button type="button" onClick={() => addDeposit()} className="mb-5 inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">
                    Add bid
                  </button>

                  <button type="button" onClick={() => setShowBidModal(false)} className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </Modal>

          <Box py={6}>
            <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
              <div className="mt-8">

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-lg leading-6 font-medium text-gray-900 mt-8">Auctions</h2>

                  <div className="hidden sm:block mb-5">
                    <div className="flex flex-col">
                      <div className="align-middle min-w-full overflow-x-auto shadow overflow-hidden sm:rounded-lg"></div>
                      {state.isStacker ? (
                        <p>You are a registered stacker and are able to buy up auctions.</p>
                      ) : (
                        <Box my="base">
                          <Text onClick={() => registerStacker()}
                                _hover={{ cursor: 'pointer'}}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-5">
                            Register as Stacker
                          </Text>
                        </Box>
                      )}
                    </div>
                  </div>

                  {auctions ? (
                    <AuctionGroup auctions={auctions} setBidAuctionId={setBidAuctionId} setShowBidModal={setShowBidModal} />
                  ) : (
                    <p>There are currently no open auctions</p>
                  )}
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
