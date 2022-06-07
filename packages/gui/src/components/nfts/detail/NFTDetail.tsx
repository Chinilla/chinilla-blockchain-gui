import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import moment from 'moment';
import {
  Back,
  Flex,
  LayoutDashboardSub,
  Loading,
  Table,
  vojoToChinilla,
  FormatLargeNumber,
  CardKeyValue,
  Truncate,
} from '@chinilla/core';
import type { NFTInfo } from '@chinilla/api';
import { useGetNFTWallets } from '@chinilla/api-react';
import { Box, Grid, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import NFTPreview from '../NFTPreview';
import useFetchNFTs from '../../../hooks/useFetchNFTs';
import useNFTMetadata from '../../../hooks/useNFTMetadata';
import NFTRankings from '../NFTRankings';
import NFTProperties from '../NFTProperties';

export default function NFTDetail() {
  const { nftId } = useParams();
  const { wallets: nftWallets, isLoading: isLoadingWallets } =
    useGetNFTWallets();
  const { nfts, isLoading: isLoadingNFTs } = useFetchNFTs(
    nftWallets.map((wallet: Wallet) => wallet.id),
  );

  const nft: NFTInfo | undefined = useMemo(() => {
    if (!nfts) {
      return;
    }
    return nfts.find((nft: NFTInfo) => nft.$nftId === nftId);
  }, [nfts]);

  const { metadata, isLoading: isLoadingMetadata } = useNFTMetadata(nft);

  const isLoading = isLoadingWallets || isLoadingNFTs || isLoadingMetadata;

  const details = useMemo(() => {
    if (!nft) {
      return [];
    }

    const { dataUris = [] } = nft;

    const rows = [
      {
        key: 'id',
        label: <Trans>Launcher ID</Trans>,
        value: (
          <Truncate tooltip copyToClipboard>
            {nft.launcherId}
          </Truncate>
        ),
      },
      // {
      //   key: 'tokenStandard',
      //   label: <Trans>Token Standard</Trans>,
      //   value: nft.version,
      // },

      // Moved below Description
      // metadata?.collection_name && {
      //   key: 'collectionName',
      //   label: <Trans>Collection Name</Trans>,
      //   value: (
      //     <Truncate tooltip copyToClipboard>
      //       {metadata?.collection_name}
      //     </Truncate>
      //   ),
      // },
    ].filter(Boolean);

    if (dataUris?.length) {
      dataUris.forEach((uri, index) => {
        rows.push({
          key: `dataUri-${index}`,
          label: <Trans>Data URL {index + 1}</Trans>,
          value: uri,
        });
      });
    }

    if (nft.dataHash) {
      rows.push({
        key: 'dataHash',
        label: <Trans>Data Hash</Trans>,
        value: (
          <Truncate tooltip copyToClipboard>
            {nft.dataHash}
          </Truncate>
        ),
      });
    }

    if (nft?.metadataUris?.length) {
      nft?.metadataUris.forEach((uri, index) => {
        rows.push({
          key: `metadataUris-${index}`,
          label: <Trans>Metadata URL {index + 1}</Trans>,
          value: uri,
        });
      });
    }

    if (nft.metadataHash) {
      rows.push({
        key: 'metadataHash',
        label: <Trans>Metadata Hash</Trans>,
        value: <Truncate>{nft.metadataHash}</Truncate>,
      });
    }

    if (nft?.licenseUris?.length) {
      nft?.licenseUris.forEach((uri, index) => {
        rows.push({
          key: `licenseUris-${index}`,
          label: <Trans>License URL {index + 1}</Trans>,
          value: uri,
        });
      });
    }

    if (nft.licenseHash) {
      rows.push({
        key: 'licenseHash',
        label: <Trans>License Hash</Trans>,
        value: <Truncate>{nft.licenseHash}</Truncate>,
      });
    }

    return rows;
  }, [metadata, nft]);

  if (isLoading) {
    return <Loading center />;
  }

  return (
    <LayoutDashboardSub>
      <Flex flexDirection="column" gap={2}>
        <Back variant="h5">
          {metadata?.name ?? <Trans>Title Not Available</Trans>}
        </Back>
        <Box
          border={1}
          borderColor="grey.300"
          borderRadius={4}
          overflow="hidden"
          alignItems="center"
          justifyContent="center"
          display={{ xs: 'flex', md: 'none' }}
        >
          {nft && <NFTPreview nft={nft} height="400px" fit="contain" />}
        </Box>
        <Flex gap={2} alignItems="stretch">
          <Flex
            flexGrow={1}
            border={1}
            borderColor="grey.300"
            borderRadius={4}
            overflow="hidden"
            alignItems="stretch"
            justifyContent="stretch"
            display={{ xs: 'none', md: 'flex' }}
            minHeight="500px"
          >
            {nft && <NFTPreview nft={nft} height="auto" fit="contain" />}
          </Flex>
          <Box maxWidth={{ md: '500px', lg: '600px' }} width="100%">
            <Flex flexDirection="column" gap={3}>
              <Flex flexDirection="column" gap={1}>
                <Typography variant="h6">
                  <Trans>Description</Trans>
                </Typography>

                <Typography>
                  {metadata?.description ?? <Trans>Not Available</Trans>}
                </Typography>
              </Flex>
              {metadata?.collection_name && (
                <Flex flexDirection="column" gap={1}>
                  <Typography variant="h6">
                    <Trans>Collection</Trans>
                  </Typography>

                  <Typography>
                    {metadata?.collection_name ?? <Trans>Not Available</Trans>}
                  </Typography>
                </Flex>
              )}
              {(nft?.seriesTotal ?? 0) > 1 && (
                <Flex flexDirection="column" gap={1}>
                  <Typography variant="h6">
                    <Trans>Series Number</Trans>
                  </Typography>

                  <Typography>
                    <Trans>
                      {nft.seriesNumber} of {nft.seriesTotal}
                    </Trans>
                  </Typography>
                </Flex>
              )}
              <NFTProperties attributes={metadata?.attributes} />
              <NFTRankings attributes={metadata?.attributes} />
              <Flex flexDirection="column" gap={1}>
                <Typography variant="h6">
                  <Trans>Details</Trans>
                </Typography>

                <CardKeyValue rows={details} hideDivider />
              </Flex>
            </Flex>
          </Box>
        </Flex>
        {/*
        <Flex flexDirection="column" gap={1}>
          <Typography variant="h6">
            <Trans>Item Activity</Trans>
          </Typography>
          <Table cols={cols} rows={metadata.activity} />
        </Flex>
        */}
      </Flex>
    </LayoutDashboardSub>
  );
}
