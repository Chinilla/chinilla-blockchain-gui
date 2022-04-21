import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Card, CardContent } from '@mui/material';
import Flex from '../Flex';

const StyledContent = styled(CardContent)`
  padding: ${({ theme }) =>
   `${theme.spacing(5)} ${theme.spacing(4)} !important`};
  background-color: ${({ theme }) =>
    theme.palette.mode === 'dark' ? '#333333' : '#FCF6E0'};
`;

type Props = {
  children?: ReactNode;
};

export default function CardHero(props: Props) {
  const { children } = props;

  return (
    <Card>
      <StyledContent>
        <Flex flexDirection="column" gap={3}>
          {children}
        </Flex>
      </StyledContent>
    </Card>
  );
}

CardHero.defaultProps = {
  children: undefined,
};
