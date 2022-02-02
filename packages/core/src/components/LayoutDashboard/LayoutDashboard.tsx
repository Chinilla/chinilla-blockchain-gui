import React, { ReactNode, Suspense } from 'react';
import styled from 'styled-components';
import { useNavigate, Outlet } from 'react-router-dom';
import { t, Trans } from '@lingui/macro';
import { AppBar, Toolbar, Drawer, Divider, Container, IconButton } from '@material-ui/core';
import {
  Flex,
  Logo,
  ToolbarSpacing,
  Loading,
} from '@chinilla/core';
import { DashboardTitleTarget } from '../DashboardTitle';
import { useLogout } from '@chinilla/api-react';
import { ExitToApp as ExitToAppIcon } from '@material-ui/icons';
import Settings from '../Settings';
import Tooltip from '../Tooltip';
// import LayoutFooter from '../LayoutMain/LayoutFooter';

const StyledRoot = styled(Flex)`
  background-color: ${({ theme }) =>
    theme.palette.type === 'dark' ? '#424242' : '#F3E5AB'};
  height: 100%;
  //overflow: hidden;
`;

const StyledContainer = styled(Container)`
  padding-top: ${({ theme }) => `${theme.spacing(2)}px`};
  padding-bottom: ${({ theme }) => `${theme.spacing(2)}px`};
  background-color: ${({ theme }) =>
    theme.palette.type === 'dark' ? '#424242' : '#F3E5AB'};
`;

const StyledAppBar = styled(AppBar)`
  background-color: ${({ theme }) =>
    theme.palette.type === 'dark' ? '#424242' : '#F3E5AB'};
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
  width: ${({ theme, drawer }) => drawer ? `calc(100% - ${theme.drawer.width})` : '100%'};
  margin-left: ${({ theme, drawer }) => drawer ? theme.drawer.width : 0};
  z-index: ${({ theme }) => theme.zIndex.drawer + 1};};
`;

const StyledDrawer = styled(Drawer)`
  background-color: ${({ theme }) =>
    theme.palette.type === 'dark' ? '#424242' : '#F3E5AB'};
  z-index: ${({ theme }) => theme.zIndex.drawer + 2};
  width: ${({ theme }) => theme.drawer.width};
  flex-shrink: 0;

  > div {
    width: ${({ theme }) => theme.drawer.width};
  }
`;

const StyledBody = styled(Flex)`
  background-color: ${({ theme }) =>
    theme.palette.type === 'dark' ? '#424242' : '#F3E5AB'};
  min-width: 0;
`;

const StyledBrandWrapper = styled(Flex)`
  background-color: ${({ theme }) =>
    theme.palette.type === 'dark' ? '#424242' : '#F3E5AB'};
  height: 64px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  // border-right: 1px solid rgba(0, 0, 0, 0.12);
`;

const StyledToolbar = styled(Toolbar)`
  padding-left: 0;
  padding-right: 0;
  background-color: ${({ theme }) =>
    theme.palette.type === 'dark' ? '#424242' : '#F3E5AB'};
`;

export type LayoutDashboardProps = {
  children?: ReactNode;
  sidebar?: ReactNode;
  outlet?: boolean;
  settings?: ReactNode;
};

export default function LayoutDashboard(props: LayoutDashboardProps) {
  const { children, sidebar, settings, outlet } = props;

  const navigate = useNavigate();
  const logout = useLogout();

  async function handleLogout() {
    await logout();

    navigate('/');
  }

  return (
    <StyledRoot>
      <Suspense fallback={<Loading center />}>
        {sidebar ? (
          <>
            <StyledAppBar position="fixed" color="transparent" elevation={0} drawer>
              <StyledToolbar>
                <Container maxWidth="lg">
                  <Flex alignItems="center">
                    <DashboardTitleTarget />
                    <Flex flexGrow={1} />
                    <Tooltip title={<Trans>Logout</Trans>}>
                      <IconButton color="inherit" onClick={handleLogout} title={t`Log Out`}>
                        <ExitToAppIcon />
                      </IconButton>
                    </Tooltip>
                    <Settings>
                      {settings}
                    </Settings>
                  </Flex>
                </Container>
              </StyledToolbar>
            </StyledAppBar>
            <StyledDrawer variant="permanent">
              <StyledBrandWrapper>
                <Logo width={2 / 3} />
              </StyledBrandWrapper>
              <Divider />
              {sidebar}
            </StyledDrawer>
          </>
        ): (
          <StyledAppBar position="fixed" color="transparent" elevation={0}>
            <StyledToolbar>
              <Container maxWidth="lg">
                <Flex alignItems="center">
                  <Logo width="100px" />
                  <Flex flexGrow={1} />
                  <Tooltip title={<Trans>Logout</Trans>}>
                    <IconButton color="inherit" onClick={handleLogout} title={t`Log Out`}>
                      <ExitToAppIcon />
                    </IconButton>
                  </Tooltip>
                  <Settings>
                    {settings}
                  </Settings>
                </Flex>
              </Container>
            </StyledToolbar>
          </StyledAppBar>
        )}

        <StyledBody flexDirection="column" flexGrow={1}>
          <ToolbarSpacing />
          <StyledContainer maxWidth="lg">
            <Flex flexDirection="column" gap={2}>
              <Suspense fallback={<Loading center />}>
                {outlet ? <Outlet /> : children}
              </Suspense>
              {/* <LayoutFooter /> */}
            </Flex>
          </StyledContainer>
        </StyledBody>
      </Suspense>
    </StyledRoot>
  );
}

LayoutDashboard.defaultProps = {
  children: undefined,
  outlet: false,
};
