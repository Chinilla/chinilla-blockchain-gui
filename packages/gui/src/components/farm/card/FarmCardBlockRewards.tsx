import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { useCurrencyCode, vojoToChinillaLocaleString } from '@chinilla/core';
import { useGetFarmedAmountQuery } from '@chinilla/api-react';
import FarmCard from './FarmCard';

export default function FarmCardBlockRewards() {
  const currencyCode = useCurrencyCode();
  const { data, isLoading } = useGetFarmedAmountQuery();

  const farmerRewardAmount = data?.farmerRewardAmount;
  const poolRewardAmount = data?.poolRewardAmount;

  const blockRewards = useMemo(() => {
    if (farmerRewardAmount !== undefined && poolRewardAmount !== undefined) {
      const val =
        BigInt(farmerRewardAmount.toString()) +
        BigInt(poolRewardAmount.toString());
      return (
        <>
          {vojoToChinillaLocaleString(val)}
          &nbsp;
          {currencyCode}
        </>
      );
    }
  }, [farmerRewardAmount, poolRewardAmount]);

  return (
    <FarmCard
      title={<Trans>Block Rewards</Trans>}
      description={<Trans>Without fees</Trans>}
      value={blockRewards}
      loading={isLoading}
    />
  );
}
