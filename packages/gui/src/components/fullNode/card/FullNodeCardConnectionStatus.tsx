import React from 'react';
import { Trans } from '@lingui/macro';
import { CardSimple } from '@chinilla/core';
import { ServiceName } from '@chinilla/api';
import { useService } from '@chinilla/api-react';

export default function FullNodeCardConnectionStatus() {
  const { isRunning, isLoading, error } = useService(ServiceName.FULL_NODE);

  return (
    <CardSimple
      loading={isLoading}
      valueColor={isRunning ? 'primary' : 'textPrimary'}
      title={<Trans>Connection Status</Trans>}
      value={
        isRunning ? <Trans>Connected</Trans> : <Trans>Not connected</Trans>
      }
      error={error}
    />
  );
}
