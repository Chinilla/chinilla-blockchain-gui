import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { useCurrencyCode, vojoToChinillaLocaleString, CardSimple } from '@chinilla/core';
import { useGetFarmedAmountQuery } from '@chinilla/api-react';

export default function FarmCardTotalChinillaFarmed() {
  const currencyCode = useCurrencyCode();
  const { data, isLoading, error } = useGetFarmedAmountQuery();

  const farmedAmount = data?.farmedAmount;

  const totalChinillaFarmed = useMemo(() => {
    if (farmedAmount !== undefined) {
      return (
        <>
          {vojoToChinillaLocaleString(farmedAmount)}
          &nbsp;
          {currencyCode}
        </>
      );
    }
  }, [farmedAmount]);

  return (
    <CardSimple
      title={<Trans>Total Chinilla Farmed</Trans>}
      value={totalChinillaFarmed}
      loading={isLoading}
      error={error}
    />
  );
}
