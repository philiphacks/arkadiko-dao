import { createContext } from 'react';
import { UserSession, AppConfig, UserData } from '@stacks/auth';

export interface AppState {
  userData: UserData | null;
  balance: object | null;
  vaults: object;
}

export const defaultState = (): AppState => {
  const appConfig = new AppConfig(['store_write'], document.location.href);
  const userSession = new UserSession({ appConfig });

  if (userSession.isUserSignedIn()) {
    return {
      userData: userSession.loadUserData(),
      balance: { stx: 0, arkadiko: 0 },
      vaults: []
    };
  }
  return { userData: null, balance: null, vaults: [] };
};

export const AppContext = createContext<AppState>(defaultState());
