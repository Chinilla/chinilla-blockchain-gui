import React from 'react';
import { Trans } from '@lingui/macro';
import { FormatBytes } from '@chinilla/core';
import { useGetBlockchainStateQuery } from '@chinilla/api-react';
import FarmCard from './FarmCard';

export default function FarmCardTotalNetworkSpace() {
  const { data, isLoading } = useGetBlockchainStateQuery();
  const totalNetworkSpace = data?.space ?? 0;

  return (
    <FarmCard
      title={<Trans>Total Network Space</Trans>}
      value={<FormatBytes value={totalNetworkSpace} precision={3} />}
      description={<Trans>Best estimate over last 24 hours</Trans>}
      loading={isLoading}
    />
  );
}
