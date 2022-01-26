import React from 'react';
import { Trans } from '@lingui/macro';
import { FormatLargeNumber, CardSimple } from '@chinilla/core';
import { useGetBlockchainStateQuery } from '@chinilla/api-react';

export default function FullNodeCardDifficulty() {
  const { data, isLoading } = useGetBlockchainStateQuery();
  const value = data?.difficulty;

  return (
    <CardSimple
      loading={isLoading}
      valueColor="textPrimary"
      title={<Trans>Difficulty</Trans>}
      value={<FormatLargeNumber value={value} />}
    />
  );
}
