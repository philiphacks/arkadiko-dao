import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { Person } from '@stacks/profile';

const appConfig = new AppConfig(
  [],
  'http://localhost:3000',
  'http://localhost:3000',
  '',
  'http://locahost:9333',
  'http://localhost:9333'
);

export const userSession = new UserSession({ appConfig });

export function getAppDetails() {
  return {
    name: 'ArkDAO',
    icon: window.location.origin + '/logo.svg',
  }
}

export function authenticate() {
  showConnect({
    appDetails: getAppDetails(),
    redirectTo: '/',
    finished: () => {
      window.location.reload();
    },
    userSession: userSession
  });
}

export function getUserData() {
  return userSession.loadUserData();
}

export function getPerson() {
  return new Person(getUserData().profile);
}
