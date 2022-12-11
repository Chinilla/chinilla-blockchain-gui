import { WalletType } from '@chinilla/api';
import { Flex, MenuItem } from '@chinilla/core';
import { Offers as OffersIcon } from '@chinilla/icons';
import { Trans } from '@lingui/macro';
import { Box, Typography, ListItemIcon } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import WalletHeader from '../WalletHeader';
import WalletHistory from '../WalletHistory';
import WalletReceiveAddress from '../WalletReceiveAddress';
import WalletSend from '../WalletSend';
import WalletStandardCards from './WalletStandardCards';

type StandardWalletProps = {
  walletId: number;
};

export default function StandardWallet(props: StandardWalletProps) {
  const { walletId } = props;
  // const showDebugInformation = useShowDebugInformation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'summary' | 'send' | 'receive'>('summary');

  function handleCreateOffer() {
    navigate('/dashboard/offers/builder', {
      state: {
        walletType: WalletType.STANDARD_WALLET,
        referrerPath: location.hash.split('#').slice(-1)[0],
      },
    });
  }

  return (
    <Flex flexDirection="column" gap={2.5}>
      <WalletHeader
        walletId={walletId}
        tab={selectedTab}
        onTabChange={setSelectedTab}
        actions={
          <MenuItem onClick={handleCreateOffer} close>
            <ListItemIcon>
              <OffersIcon />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>
              <Trans>Create Offer</Trans>
            </Typography>
          </MenuItem>
        }
      />

      <Box display={selectedTab === 'summary' ? 'block' : 'none'}>
        <Flex flexDirection="column" gap={4}>
          <WalletStandardCards walletId={walletId} />
          <WalletHistory walletId={walletId} />
        </Flex>
      </Box>
      <Box display={selectedTab === 'send' ? 'block' : 'none'}>
        <WalletSend walletId={walletId} />
      </Box>
      <Box display={selectedTab === 'receive' ? 'block' : 'none'}>
        <WalletReceiveAddress walletId={walletId} />
      </Box>

      {/*
      {showDebugInformation && (
        <WalletConnections walletId={walletId} />
      )}
      */}
    </Flex>
  );
}
