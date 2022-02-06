import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { useCurrencyCode, vojoToChinillaLocaleString } from '@chinilla/core';
import { useGetFarmedAmountQuery } from '@chinilla/api-react';
import FarmCard from './FarmCard';

export default function FarmCardUserFees() {
  const currencyCode = useCurrencyCode();
  const { data, isLoading } = useGetFarmedAmountQuery();

  const feeAmount = data?.feeAmount;

  const userTransactionFees = useMemo(() => {
    if (feeAmount !== undefined) {
      return (
        <>
          {vojoToChinillaLocaleString(feeAmount)}
          &nbsp;
          {currencyCode}
        </>
      );
    }
  }, [feeAmount]);

  return (
    <FarmCard
      title={<Trans>User Transaction Fees</Trans>}
      value={userTransactionFees}
      loading={isLoading}
    />
  );
}
