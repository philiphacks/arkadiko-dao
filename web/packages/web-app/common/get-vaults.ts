import { useContext, useState, useEffect } from 'react';
import { AppContext } from '@common/context';
import { useSTXAddress } from './use-stx-address';
import { stacksNetwork as network } from '@common/utils';
import { callReadOnlyFunction, cvToJSON, standardPrincipalCV } from '@stacks/transactions';

export const getVaults = () => {
  const stxAddress = useSTXAddress();
  const state = useContext(AppContext);
  const [vaults, setVaults] = useState({});

  useEffect(() => {
    const getVaults = async () => {
      const vaults = await callReadOnlyFunction({
        contractAddress: 'ST31HHVBKYCYQQJ5AQ25ZHA6W2A548ZADDQ6S16GP',
        contractName: "stx-reserve",
        functionName: "get-vaults",
        functionArgs: [standardPrincipalCV(stxAddress || '')],
        senderAddress: stxAddress || '',
        network: network,
      });
      console.log(vaults);      
      const json = cvToJSON(vaults);
      setVaults(json);
    };
    void getVaults();
  }, [state.userData]);

  return {
    vaults,
  };
};
