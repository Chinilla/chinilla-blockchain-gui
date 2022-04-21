import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { useCurrencyCode, vojoToChinillaLocaleString, CardSimple, useLocale } from '@chinilla/core';
import { useGetFarmedAmountQuery } from '@chinilla/api-react';

export default function FarmCardTotalChinillaFarmed() {
  const currencyCode = useCurrencyCode();
  const [locale] = useLocale();
  const { data, isLoading, error } = useGetFarmedAmountQuery();

  const farmedAmount = data?.farmedAmount;

  const totalChinillaFarmed = useMemo(() => {
    if (farmedAmount !== undefined) {
      return (
        <>
          {vojoToChinillaLocaleString(farmedAmount, locale)}
          &nbsp;
          {currencyCode}
        </>
      );
    }
  }, [farmedAmount, locale, currencyCode]);

  return (
    <CardSimple
      title={<Trans>Total Chinilla Farmed</Trans>}
      value={totalChinillaFarmed}
      loading={isLoading}
      error={error}
    />
  );
}
