import React from 'react';
import Big from 'big.js';
import { Trans } from '@lingui/macro';
import { Box } from '@material-ui/core';
import styled from 'styled-components';
import StateColor from '../../constants/StateColor';
import Amount, { AmountProps } from '../Amount';

const StyledWarning = styled(Box)`
  color: ${StateColor.WARNING};
`;

const StyledError = styled(Box)`
  color: ${StateColor.ERROR};
`;

type FeeProps = AmountProps;

export default function Fee(props: FeeProps) {
  return (
    <Amount {...props}>
      {({ value, vojo}) => {
        const bigVojo= new Big(vojo.toString());
        const isHigh = bigVojo.gte('1000');
        const isLow = bigVojo.gt('0') && bigVojo.lt('1');

        if (!value) {
          return;
        }

        if (isHigh) {
          return (
            <StyledWarning>
              <Trans>Value seems high</Trans>
            </StyledWarning>
          );
        }

        if (isLow) {
          return (
            <StyledError>
              <Trans>Incorrect value</Trans>
            </StyledError>
          );
        }

        return null;
      }}
    </Amount>
  );
}

Fee.defaultProps = {
  label: <Trans>Fee</Trans>,
  name: 'fee',
};
