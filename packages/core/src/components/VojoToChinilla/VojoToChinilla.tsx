import BigNumber from 'bignumber.js';
import React from 'react';

import useCurrencyCode from '../../hooks/useCurrencyCode';
import vojoToChinilla from '../../utils/vojoToChinillaLocaleString';
import FormatLargeNumber from '../FormatLargeNumber';

export type VojoToChinillaProps = {
  value: number | BigNumber;
};

export default function VojoToChinilla(props: VojoToChinillaProps) {
  const { value } = props;
  const currencyCode = useCurrencyCode();
  const updatedValue = vojoToChinilla(value);

  return (
    <>
      <FormatLargeNumber value={updatedValue} />
      &nbsp;{currencyCode ?? ''}
    </>
  );
}
