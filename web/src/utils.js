import { StacksTestnet, StacksMocknet, StacksMainnet } from '@stacks/network';

const contractAddresses = {
  'stx-reserve': {
    'mocknet': 'ST2ZRX0K27GW0SP3GJCEMHD95TQGJMKB7G9Y0X1MH',
    'testnet': '',
    'mainnet': ''
  },
  'arkadiko-token': {
    'mocknet': 'ST2ZRX0K27GW0SP3GJCEMHD95TQGJMKB7G9Y0X1MH'
  }
}

export function resolveNetwork() {
  if (process.env.REACT_APP_NETWORK_ENV === 'mocknet') {
    console.log('Connecting to Mocknet');
    const network = new StacksMocknet();
    network.coreApiUrl = "http://localhost:3999";
    return network;
  } else if (process.env.REACT_APP_NETWORK_ENV === 'testnet') {
    return new StacksTestnet();
  } else {
    return new StacksMainnet();
  }
}

export function getContractAddress(contractName) {
  return contractAddresses[contractName][process.env.REACT_APP_NETWORK_ENV];
}
