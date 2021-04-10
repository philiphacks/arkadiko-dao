import { RPCClient } from '@stacks/rpc-client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { StacksTestnet } from '@stacks/network';

dayjs.extend(relativeTime);
const env = process.env.REACT_APP_NETWORK_ENV || 'testnet';

let coreApiUrl = 'https://stacks-node-api.xenon.blockstack.org';
if (location.origin.includes('localhost')) {
  coreApiUrl = 'http://localhost:3999';
}

export const getRPCClient = () => {
  return new RPCClient(coreApiUrl);
};

export const toRelativeTime = (ts: number): string => dayjs().to(ts);

export const stacksNetwork = new StacksTestnet();
stacksNetwork.coreApiUrl = coreApiUrl;
