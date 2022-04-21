import React from 'react';
import Flex from '../Flex';
import { Typography } from '@mui/material';
import styled from 'styled-components';
import { default as walletPackageJson } from '../../../package.json';
import useAppVersion from '../../hooks/useAppVersion';

const { productName } = walletPackageJson;

const StyledRoot = styled(Flex)`
  background-color: ${({ theme }) =>
    theme.palette.type === 'dark' ? '#333333' : '#FCF6E0'};
  padding: 1rem;
`;

export default function SettingsFooter() {
  const { version } = useAppVersion();

  return (
    <StyledRoot>
      <Typography color="textSecondary" variant="caption">
        {productName} {version}
      </Typography>
    </StyledRoot>
  )
}
