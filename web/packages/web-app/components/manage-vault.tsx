import React, { useContext } from 'react';
import { Box } from '@blockstack/ui';
import { Container } from './home';
import { NavLink as RouterLink } from 'react-router-dom'
import { Link } from '@components/link';
import { getAuthOrigin, stacksNetwork as network } from '@common/utils';
import { useSTXAddress } from '@common/use-stx-address';
import { useConnect } from '@stacks/connect-react';
import {
  uintCV,
  standardPrincipalCV
} from '@stacks/transactions';
import { AppContext } from '@common/context';
import { getCollateralToDebtRatio } from '@common/get-collateral-to-debt-ratio';
import { debtClass } from './vault';
import { getStxPrice } from '@common/get-stx-price';

export const ManageVault = ({ match }) => {
  const { doContractCall } = useConnect();
  const senderAddress = useSTXAddress();
  const state = useContext(AppContext);
  const price = parseFloat(getStxPrice().price);

  const searchVault = (id: string) => {
    for (let i = 0; i < state.vaults.length; i++) {
      let vault = state.vaults[i];
      console.log(vault);
      if (vault.id === parseInt(id, 10)) {
        return vault;
      }
    }
  }
  console.log('Go', match.params.id);
  const vault = searchVault(match.params.id);

  const callBurn = async () => {
    const authOrigin = getAuthOrigin();
    await doContractCall({
      network,
      authOrigin,
      contractAddress: 'ST31HHVBKYCYQQJ5AQ25ZHA6W2A548ZADDQ6S16GP',
      contractName: 'stx-reserve',
      functionName: 'burn',
      functionArgs: [uintCV(2), standardPrincipalCV(senderAddress || '')],
      postConditionMode: 0x01,
      finished: data => {
        console.log('finished burn!', data);
        console.log(data.stacksTransaction.auth.spendingCondition?.nonce.toNumber());
        window.location.href = '/';
      },
    });
  };
  let debtRatio = 0;
  if (match.params.id) {
    debtRatio = getCollateralToDebtRatio(match.params.id)?.collateralToDebt;
  }

  const liquidationPrice = () => {
    if (vault) {
      const liquidationRatio = parseInt(state.riskParameters['liquidation-ratio'], 10);
      return (liquidationRatio * vault['coins-minted'] / 1000000000);
    }

    return 0;
  }

  const stxLocked = () => {
    if (vault) {
      return parseInt(vault['stx-collateral'], 10) / 1000000;
    }

    return 0;
  }

  const outstandingDebt = () => {
    if (vault) {
      return parseInt(vault['coins-minted'], 10) / 1000000;
    }

    return 0;
  }

  return (
    <Container>
      <Box py={6}>
        <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
          <div className="mt-8">
            <h1 className="text-2xl leading-6 font-medium text-gray-900 mb-4">
              STX/xUSD Vault #{match.params.id}
            </h1>
          </div>

          <ul className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <li className="relative col-span-2 flex shadow-sm rounded-md">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mt-8 mb-4">
                Liquidation Price
              </h2>
            </li>

            <li className="relative col-span-2 flex shadow-sm rounded-md">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mt-8 mb-4">
                Collateral to Debt Ratio
              </h2>
            </li>
          </ul>

          <ul className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <li className="relative col-span-2 flex shadow-sm rounded-md">
              <div className="bg-white shadow sm:rounded-lg w-full">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    ${liquidationPrice()} USD (STX/USD)
                  </h2>
                  <div className="mt-2 sm:flex sm:items-start sm:justify-between">
                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        Current Price Information
                      </p>
                    </div>

                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        ${parseFloat(price / 100)} USD
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 sm:flex sm:items-start sm:justify-between">
                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        Liquidation Penalty
                      </p>
                    </div>

                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        {state.riskParameters['liquidation-penalty']}%
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </li>

            <li className="relative col-span-2 flex shadow-sm rounded-md">
              <div className="bg-white shadow sm:rounded-lg w-full">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className={`text-lg leading-6 font-medium ${debtClass(debtRatio)}`}>
                    {debtRatio}%
                  </h2>
                  <div className="mt-2 sm:flex sm:items-start sm:justify-between">
                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        Minimum Ratio (before liquidation)
                      </p>
                    </div>

                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        {state.riskParameters['liquidation-ratio']}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 sm:flex sm:items-start sm:justify-between">
                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        Stability Fee
                      </p>
                    </div>

                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        0.0%
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </li>
          </ul>






          <ul className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4 mt-8">
            <li className="relative col-span-2 flex shadow-sm rounded-md">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mt-8 mb-4">
                STX Locked
              </h2>
            </li>

            <li className="relative col-span-2 flex shadow-sm rounded-md">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mt-8 mb-4">
                Outstanding xUSD debt
              </h2>
            </li>
          </ul>

          <ul className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <li className="relative col-span-2 flex shadow-sm rounded-md">
              <div className="bg-white shadow sm:rounded-lg w-full">
                <div className="px-4 py-5 sm:p-6">
                  <div className="mt-2 sm:flex sm:items-start sm:justify-between mb-5">
                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        STX Locked
                      </p>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>
                        {stxLocked()} STX
                      </p>
                    </div>

                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        <RouterLink to={`vaults/2`} exact className="px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Deposit
                        </RouterLink>
                      </p>
                    </div>
                  </div>
                  <hr/>

                  <div className="mt-5 sm:flex sm:items-start sm:justify-between">
                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        Able to withdraw
                      </p>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>
                        0 STX
                      </p>
                    </div>

                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        <RouterLink to={`vaults/2`} exact className="px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Withdraw
                        </RouterLink>
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </li>

            <li className="relative col-span-2 flex shadow-sm rounded-md">
              <div className="bg-white shadow sm:rounded-lg w-full">
                <div className="px-4 py-5 sm:p-6">
                  <div className="mt-2 sm:flex sm:items-start sm:justify-between mb-5">
                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        Outstanding xUSD debt
                      </p>
                    </div>

                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        {outstandingDebt()} xUSD
                      </p>
                    </div>

                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        <Link onClick={() => callBurn()} exact className="px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Pay back
                        </Link>
                      </p>
                    </div>
                  </div>
                  <hr/>

                  <div className="mt-5 sm:flex sm:items-start sm:justify-between">
                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        Available to mint
                      </p>
                    </div>

                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        0 xUSD
                      </p>
                    </div>

                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        <Link onClick={() => callBurn()} className="px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Mint
                        </Link>
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </li>
          </ul>


        </main>
      </Box>
    </Container>
  )
};
