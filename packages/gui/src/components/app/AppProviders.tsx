import { store, api } from '@chinilla/api-react';
import {
  useDarkMode,
  sleep,
  ThemeProvider,
  ModalDialogsProvider,
  ModalDialogs,
  LocaleProvider,
  LayoutLoading,
  dark,
  light,
  ErrorBoundary,
} from '@chinilla/core';
import { nativeTheme } from '@electron/remote';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import isElectron from 'is-electron';
import React, { ReactNode, useEffect, useState, Suspense } from 'react';
import { Provider } from 'react-redux';
import { Outlet } from 'react-router-dom';
import WebSocket from 'ws';

import { i18n, defaultLocale, locales } from '../../config/locales';
import LRUsProvider from '../lrus/LRUsProvider';
import WalletConnectProvider, { WalletConnectChinillaProjectId } from '../walletConnect/WalletConnectProvider';
import AppState from './AppState';

async function waitForConfig() {
  // eslint-disable-next-line no-constant-condition -- We want this
  while (true) {
    // eslint-disable-next-line no-await-in-loop -- We want to run promises in series
    const config = await window.ipcRenderer.invoke('getConfig');
    if (config) {
      return config;
    }
    // eslint-disable-next-line no-await-in-loop -- We want to run promises in series
    await sleep(50);
  }
}

type AppProps = {
  outlet?: boolean;
  children?: ReactNode;
};

export default function App(props: AppProps) {
  const { children, outlet } = props;
  const [isReady, setIsReady] = useState<boolean>(false);
  const { isDarkMode } = useDarkMode();

  const theme = isDarkMode ? dark : light;
  if (isElectron()) {
    nativeTheme.themeSource = isDarkMode ? 'dark' : 'light';
  }

  async function init() {
    const config = await waitForConfig();
    const { cert, key, url } = config;

    store.dispatch(
      api.initializeConfig({
        url,
        cert,
        key,
        webSocket: WebSocket,
      })
    );

    setIsReady(true);
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <Provider store={store}>
      <LocaleProvider i18n={i18n} defaultLocale={defaultLocale} locales={locales}>
        <ThemeProvider theme={theme} fonts global>
          <ErrorBoundary>
            <LRUsProvider>
              <ModalDialogsProvider>
                <WalletConnectProvider projectId={WalletConnectChinillaProjectId}>
                  {isReady ? (
                    <Suspense fallback={<LayoutLoading />}>
                      <AppState>{outlet ? <Outlet /> : children}</AppState>
                    </Suspense>
                  ) : (
                    <LayoutLoading>
                      <Typography variant="body1">
                        <Trans>Loading configuration</Trans>
                      </Typography>
                    </LayoutLoading>
                  )}
                  <ModalDialogs />
                </WalletConnectProvider>
              </ModalDialogsProvider>
            </LRUsProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </LocaleProvider>
    </Provider>
  );
}
