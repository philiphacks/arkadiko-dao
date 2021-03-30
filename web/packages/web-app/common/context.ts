import { createContext } from 'react';
import { UserSession, AppConfig, UserData } from '@stacks/auth';
import { VaultProps } from '@components/vault';

interface UserBalance {
  stx: number;
  xusd: number;
  diko: number;
}

interface CollateralType {
  name: string;
  token: string;
  url: string;
  'total-debt': number;
  'stability-fee': number;
  'stability-fee-apy': number;
  'liquidation-ratio': number;
  'liquidation-penalty': number;
  'collateral-to-debt-ratio': number;
  'maximum-debt': number;
}

export interface AppState {
  userData: UserData | null;
  balance: UserBalance;
  vaults: VaultProps[];
  collateralTypes: CollateralType[];
  isStacker: boolean;
}

export const defaultBalance = () => {
  return { stx: 0, xusd: 0, diko: 0 };
};

export const defaultState = (): AppState => {
  const appConfig = new AppConfig(['store_write'], document.location.href);
  const userSession = new UserSession({ appConfig });

  if (userSession.isUserSignedIn()) {
    return {
      userData: userSession.loadUserData(),
      balance: defaultBalance(),
      vaults: [],
      collateralTypes: [],
      isStacker: false
    };
  }

  return {
    userData: null,
    balance: { stx: 0, xusd: 0, diko: 0 },
    vaults: [],
    collateralTypes: [],
    isStacker: false
  };
};

export const AppContext = createContext<AppState>(defaultState());
