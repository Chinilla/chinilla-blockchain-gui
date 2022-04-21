import React, { ReactElement, ReactNode } from 'react';
import { Container } from '@mui/material';
import styled from 'styled-components';
import Flex from '../Flex';
import { Outlet } from 'react-router-dom';
import LayoutFooter from './LayoutFooter';

const StyledContainer = styled(Container)`
  padding-top: ${({ theme }) => `${theme.spacing(3)}`};
  padding-bottom: ${({ theme }) => `${theme.spacing(3)}`};
  flex-grow: 1;
  display: flex;
  background-color: ${({ theme }) =>
    theme.palette.type === 'dark' ? '#424242' : '#F3E5AB'};
`;

const StyledInnerContainer = styled(Flex)`
  box-shadow: inset 6px 0 8px -8px rgba(0, 0, 0, 0.2);
  flex-grow: 1;
  background-color: ${({ theme }) =>
    theme.palette.type === 'dark' ? '#333333' : '#FCF6E0'};
`;

const StyledBody = styled(Flex)`
  background-color: ${({ theme }) =>
    theme.palette.type === 'dark' ? '#424242' : '#F3E5AB'};
  min-width: 0;
`;

export type LayoutMainProps = {
  children?: ReactElement<any>;
  bodyHeader?: ReactNode;
  outlet?: boolean;
};

export default function LayoutMain(props: LayoutMainProps) {
  const { children, bodyHeader, outlet = false } = props;

  return (
    <>
      <StyledInnerContainer flexDirection="column">
        {bodyHeader}
        <StyledContainer maxWidth="lg">
          <StyledBody flexDirection="column" gap={2} flexGrow="1">
            {outlet ? <Outlet /> : children}
          </StyledBody>
        </StyledContainer>
      </StyledInnerContainer>
      <LayoutFooter />
    </>
  );
}
