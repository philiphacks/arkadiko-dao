import { useContext, useEffect } from 'react';
import { AppContext } from '@common/context';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';

export const websocketTxUpdater = () => {
  const [state, setState] = useContext(AppContext);
  const env = process.env.REACT_APP_NETWORK_ENV || 'testnet';

  let coreApiUrl = 'ws://stacks-node-api.mainnet.stacks.co';
  if (env.includes('mocknet')) {
    coreApiUrl = 'ws://localhost:3999';
  } else if (env.includes('testnet')) {
    coreApiUrl = 'ws://stacks-node-api.testnet.stacks.co';
  }

  useEffect(() => {
    const subscribe = async (txId:string) => {
      const client = await connectWebSocketClient(coreApiUrl);
      await client.subscribeTxUpdates(txId, update => {
        console.log('Got an update:', update);
        if (update['tx_status'] == 'success') {
          window.location.reload(true);
        } else if (update['tx_status'] == 'abort_by_response') {
          setState(prevState => ({ ...prevState, currentTxStatus: 'error' }));
        }
      });
    };
    if (state.currentTxId) {
      subscribe(state.currentTxId);
    }
  }, [state.currentTxId]);
};
