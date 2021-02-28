import { StacksTestnet, StacksMocknet, StacksMainnet } from '@stacks/network';

const contractAddresses = {
  'stx-reserve': {
    'mocknet': '',
    'testnet': '',
    'mainnet': ''
  }
}

export function resolveNetwork() {
  if (process.env.REACT_APP_NETWORK_ENV === 'mocknet') {
    console.log('Connecting to Mocknet');
    return new StacksMocknet();
  } else if (process.env.REACT_APP_NETWORK_ENV === 'testnet') {
    return new StacksTestnet();
  } else {
    return new StacksMainnet();
  }
}

export function getContractAddress(contractName) {
  return contractAddresses[contractName][process.env.REACT_APP_NETWORK_ENV];
}
