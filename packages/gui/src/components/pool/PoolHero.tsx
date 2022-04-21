import React from 'react';
import { Trans } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { Button, CardHero } from '@chinilla/core';
import { Pooling } from '@chinilla/icons';

export default function PoolHero() {
  const navigate = useNavigate();

  function handleJoinPool() {
    navigate('/dashboard/pool/add');
  }

  return (
    <Grid container>
      <Grid xs={12} md={6} lg={5} item>
        <CardHero>
          <Pooling color="primary" fontSize="extraLarge" />
          <Typography variant="body1">
            <Trans>
              Smooth out your HCX farming rewards by joining a pool.
            </Trans>
          </Typography>
          <Button onClick={handleJoinPool} variant="contained" color="primary">
            <Trans>Join a Pool</Trans>
          </Button>
        </CardHero>
      </Grid>
    </Grid>
  );
}
