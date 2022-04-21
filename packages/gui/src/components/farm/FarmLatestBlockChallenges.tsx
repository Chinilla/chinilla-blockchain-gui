import React from 'react';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Link, Table, Card } from '@chinilla/core';
import { useGetSignagePointsQuery, useGetCombinedPlotsQuery } from '@chinilla/api-react';
import type { Row } from '../core/components/Table/Table';

const cols = [
  {
    minWidth: '200px',
    tooltip: true,
    field: 'signagePoint.challengeHash',
    title: <Trans>Challenge Hash</Trans>,
  },
  {
    field: (row: Row) => row.signagePoint.signagePointIndex,
    title: <Trans>Index</Trans>,
  },
];

export default function FarmLatestBlockChallenges() {
  const { data: signagePoints = [], isLoading: isLoadingSignagePoints } = useGetSignagePointsQuery();
  const { data: plots, isLoading: isLoadingPlots } = useGetCombinedPlotsQuery();

  const isLoading = isLoadingSignagePoints || isLoadingPlots;
  const hasPlots = plots?.length > 0;
  const reducedSignagePoints = signagePoints;

  return (
    <Card
      gap={1}
      title={<Trans>Latest Block Challenges</Trans>}
      tooltip={
        hasPlots ? (
          <Trans>
            Below are the current block challenges. You may or may not have a
            proof of space for these challenges. These blocks do not currently
            contain a proof of time.
          </Trans>
        ) : undefined
      }
      transparent
    >
      <Table
        cols={cols}
        rows={reducedSignagePoints}
        rowsPerPageOptions={[5, 10, 25, 100]}
        rowsPerPage={5}
        isLoading={isLoading}
        caption={!hasPlots && (
          <Trans>
            Here are the current block challenges. You may or may not have a
            proof of space for these challenges. These blocks do not currently
            contain a proof of time.
          </Trans>
        )}
        pages
      />
      <Typography variant="caption">
        <Trans>
          *Want to explore Chinilla’s blocks further? Check out{' '}
          <Link
            color="primary"
            href="https://www.chinilla.com/blockchain"
            target="_blank"
          >
            Chinilla Explorer
          </Link>{' '}
        </Trans>
      </Typography>
    </Card>
  );
}
