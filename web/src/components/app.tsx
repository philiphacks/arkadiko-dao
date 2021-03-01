import React, { useEffect } from 'react';
import { Auth } from './Auth';
import { Header } from './Header';
import { Main } from './Main';
import { ThemeProvider, theme, CSSReset, ToastProvider } from '@blockstack/ui';
import { Connect } from '@stacks/connect-react';

import { AuthOptions } from '@stacks/connect';
import { defaultState, AppContext, AppState } from '../common/context';
import { getAuthOrigin } from '../common/utils';
import { UserSession, AppConfig } from 'blockstack';

const icon = '/assets/messenger-app-icon.png';
export const App: React.FC = () => {
  const [state, setState] = React.useState<AppState>(defaultState());
  const [authResponse, setAuthResponse] = React.useState('');
  const [appPrivateKey, setAppPrivateKey] = React.useState('');

  const appConfig = new AppConfig(['store_write', 'publish_data'], document.location.href);
  const userSession = new UserSession({ appConfig });

  const signOut = () => {
    userSession.signUserOut();
    setState({ userData: null });
  };

  const authOrigin = getAuthOrigin();

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setState({ userData });
    }
  }, []);

  const handleRedirectAuth = async () => {
    if (userSession.isSignInPending()) {
      const userData = await userSession.handlePendingSignIn();
      setState({ userData });
      setAppPrivateKey(userData.appPrivateKey);
    } else if (userSession.isUserSignedIn()) {
      setAppPrivateKey(userSession.loadUserData().appPrivateKey);
    }
  };

  React.useEffect(() => {
    void handleRedirectAuth();
  }, []);

  const authOptions: AuthOptions = {
    manifestPath: '/static/manifest.json',
    redirectTo: '/',
    userSession,
    finished: ({ userSession, authResponse }) => {
      const userData = userSession.loadUserData();
      setAppPrivateKey(userSession.loadUserData().appPrivateKey);
      setAuthResponse(authResponse);
      setState({ userData });
      console.log(userData);
    },
    onCancel: () => {
      console.log('popup closed!');
    },
    authOrigin,
    appDetails: {
      name: 'ArkDAO',
      icon,
    },
  };

  return (
    <Connect authOptions={authOptions}>
      <ThemeProvider theme={theme}>
        <AppContext.Provider value={state}>
          <ToastProvider>
            <div className="site-wrapper">
              <div className="site-wrapper-inner">
                <Header />
                {!userSession.isUserSignedIn() ? <Auth /> : <Main />}
              </div>
            </div>
          </ToastProvider>
          <CSSReset />
        </AppContext.Provider>
      </ThemeProvider>
    </Connect>
  );

  // componentDidMount() {
  //   if (userSession.isSignInPending()) {
  //     userSession.handlePendingSignIn().then(userData => {
  //       window.history.replaceState({}, document.title, '/');
  //       this.setState({ userData: userData });
  //     });
  //   } else if (userSession.isUserSignedIn()) {
  //     this.setState({ userData: userSession.loadUserData() });
  //   }
  // }
};
