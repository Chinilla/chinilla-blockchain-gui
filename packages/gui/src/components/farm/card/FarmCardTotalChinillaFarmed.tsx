import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { useCurrencyCode, chinToChinillaLocaleString } from '@chinilla/core';
import { useGetFarmedAmountQuery } from '@chinilla/api-react';
import FarmCard from './FarmCard';

export default function FarmCardTotalChinillaFarmed() {
  const currencyCode = useCurrencyCode();
  const { data, isLoading } = useGetFarmedAmountQuery();

  const farmedAmount = data?.farmedAmount;

  const totalChinillaFarmed = useMemo(() => {
    if (farmedAmount !== undefined) {
      return (
        <>
          {chinToChinillaLocaleString(farmedAmount)}
          &nbsp;
          {currencyCode}
        </>
      );
    }
  }, [farmedAmount]);

  return (
    <FarmCard
      title={<Trans>Total Chinilla Farmed</Trans>}
      value={totalChinillaFarmed}
      loading={isLoading}
    />
  );
}
