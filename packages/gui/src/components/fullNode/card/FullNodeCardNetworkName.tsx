import React from 'react';
import { Trans } from '@lingui/macro';
import { useGetNetworkInfoQuery } from '@chinilla/api-react';
import { CardSimple } from '@chinilla/core';

export default function FullNodeCardNetworkName() {
  const { data: networkInfo, isLoading } = useGetNetworkInfoQuery(); 
  const value = networkInfo?.networkName;

  return (
    <CardSimple
      loading={isLoading}
      valueColor="textPrimary"
      title={<Trans>Network Name</Trans>}
      value={value}
    />
  );
}
