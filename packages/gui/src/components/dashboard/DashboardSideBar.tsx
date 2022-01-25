import React from 'react';
import styled from 'styled-components';
import { Trans } from '@lingui/macro';
import { List } from '@material-ui/core';
import {
  Wallet as WalletIcon,
  Farm as FarmIcon,
  Keys as KeysIcon,
  Home as HomeIcon,
  Plot as PlotIcon,
  Pool as PoolIcon,
  Settings as SettingsIcon,
} from '@chia/icons';
import { Flex, SideBarItem, Suspender } from '@chia/core';
import { useGetKeyringStatusQuery, useLogout } from '@chia/api-react';
import { useNavigate } from 'react-router';

const StyledRoot = styled(Flex)`
  height: 100%;
  overflow-y: auto;
`;

const StyledList = styled(List)`
  width: 100%;
`;

export default function DashboardSideBar() {
<<<<<<< HEAD
  const logout = useLogout();
  const navigate = useNavigate();
=======
  /*
  const logout = useLogout();
  const navigate = useNavigate();

>>>>>>> 207cb1a67d4bce2ecd46a9125678de02d66d71b1
  const { data, isLoading, error } = useGetKeyringStatusQuery();

  if (isLoading) {
    return (
      <Suspender />
    );
  }

  const { passphraseSupportEnabled } = data;

  function handleLogOut() {
    logout();
    navigate('/');
  }
  */

  return (
    <StyledRoot>
      <StyledList disablePadding>
        <SideBarItem
          to="/dashboard"
          icon={<HomeIcon fontSize="large" />}
          title={<Trans>Full Node</Trans>}
          end
        />
        <SideBarItem
          to="/dashboard/wallets"
          icon={<WalletIcon fontSize="large" />}
          title={<Trans>Wallets</Trans>}
        />
        <SideBarItem
          to="/dashboard/plot"
          icon={<PlotIcon fontSize="large" />}
          title={<Trans>Plots</Trans>}
        />
        <SideBarItem
          to="/dashboard/farm"
          icon={<FarmIcon fontSize="large" />}
          title={<Trans>Farm</Trans>}
        />
        <SideBarItem
          to="/dashboard/pool"
          icon={<PoolIcon fontSize="large" />}
          title={<Trans>Pool</Trans>}
        />
<<<<<<< HEAD
        {passphraseSupportEnabled && (
=======
        {/* passphraseSupportEnabled && (
>>>>>>> 207cb1a67d4bce2ecd46a9125678de02d66d71b1
          <SideBarItem
            to="/dashboard/settings"
            icon={<SettingsIcon fontSize="large" />}
            title={<Trans>Settings</Trans>}
          />
<<<<<<< HEAD
        )}
        <SideBarItem
          to="/"
          icon={<KeysIcon fontSize="large" />}
          onSelect={handleLogOut}
          title={<Trans>Keys</Trans>}
          end
        />
=======
        ) */}
>>>>>>> 207cb1a67d4bce2ecd46a9125678de02d66d71b1
      </StyledList>
    </StyledRoot>
  );
}
