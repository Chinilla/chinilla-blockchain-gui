import React from 'react';
import { AdvancedOptions, Flex, LayoutDashboardSub } from '@chinilla/core';
import { useGetHarvesterConnectionsQuery } from '@chinilla/api-react';
import FarmOverview from './overview/FarmOverview';
import FarmLatestBlockChallenges from './FarmLatestBlockChallenges';
import FarmFullNodeConnections from './FarmFullNodeConnections';
import FarmYourHarvesterNetwork from './FarmYourHarvesterNetwork';
import FarmLastAttemptedProof from './FarmLastAttemptedProof';
import usePlots from '../../hooks/usePlots';

export default function Farm() {
  const { hasPlots } = usePlots();
  const { data: connections } = useGetHarvesterConnectionsQuery();

  return (
    <LayoutDashboardSub>
      <Flex flexDirection="column" gap={4}>
        <FarmOverview />

        {hasPlots ? (
          <>
            <FarmLastAttemptedProof />
            <FarmLatestBlockChallenges />
            <AdvancedOptions>
              <Flex flexDirection="column" gap={3}>
                <FarmFullNodeConnections />
                <FarmYourHarvesterNetwork />
              </Flex>
            </AdvancedOptions>
          </>
        ) : (
          <>
            <FarmLatestBlockChallenges />
            {!!connections && (
              <AdvancedOptions>
                <Flex flexDirection="column" gap={3}>
                  <FarmYourHarvesterNetwork />
                </Flex>
              </AdvancedOptions>
            )}
          </>
        )}
      </Flex>
    </LayoutDashboardSub>
  );
}
