import React from 'react';
import { Trans } from '@lingui/macro';
import { useGetNFTInfoQuery } from '@chinilla/api-react';
import { Button, Flex, Loading, TooltipIcon } from '@chinilla/core';
import { Card, Typography } from '@mui/material';
import NFTCard from '../nfts/NFTCard';
import { launcherIdFromNFTId } from '../../util/nfts';
import { NFTContextualActionTypes } from '../nfts/NFTContextualActions';
import styled from 'styled-components';
import useViewNFTOnExplorer, {
  NFTExplorer,
} from '../../hooks/useViewNFTOnExplorer';

/* ========================================================================== */

const StyledPreviewContainer = styled(Flex)`
  width: 364px;
  border-left: 1px solid ${({ theme }) => theme.palette.border.main};
  padding-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledCard = styled(Card)`
  width: 300px;
  height: 362px;
  display: flex;
`;

/* ========================================================================== */

type NFTOfferPreviewProps = {
  nftId?: string;
};

export default function NFTOfferPreview(props: NFTOfferPreviewProps) {
  const { nftId } = props;
  const launcherId = launcherIdFromNFTId(nftId ?? '');
  const {
    data: nft,
    isLoading: isLoadingNFT,
    error,
  } = useGetNFTInfoQuery({ coinId: launcherId });
  const viewOnExplorer = useViewNFTOnExplorer();

  const cardContentElem = (function () {
    if (isLoadingNFT) {
      return (
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          flexGrow={1}
          gap={1}
          style={{
            wordBreak: 'break-all',
          }}
        >
          <Loading center>
            <Trans>Loading NFT Info...</Trans>
          </Loading>
        </Flex>
      );
    } else if (launcherId && nft) {
      return (
        <NFTCard
          nft={nft}
          canExpandDetails={false}
          availableActions={
            NFTContextualActionTypes.CopyNFTId |
            NFTContextualActionTypes.ViewOnExplorer |
            NFTContextualActionTypes.OpenInBrowser |
            NFTContextualActionTypes.CopyURL
          }
        />
      );
    } else if (error) {
      return (
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          flexGrow={1}
          gap={1}
          style={{
            wordBreak: 'break-all',
          }}
        >
          <Typography variant="body1" color="error">
            {error.message}
          </Typography>
        </Flex>
      );
    } else {
      <Flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}
        gap={1}
        style={{
          wordBreak: 'break-all',
        }}
      >
        <Typography variant="h6">
          <Trans>NFT not specified</Trans>
        </Typography>
      </Flex>;
    }
  })();

  return (
    <StyledPreviewContainer
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={1}
    >
      <Flex
        flexDirection="column"
        gap={1}
        style={{
          padding: '1.5rem',
        }}
      >
        <Typography variant="subtitle1">Preview</Typography>
        <StyledCard>{cardContentElem}</StyledCard>
      </Flex>
      {nft && (
        <Flex
          flexDirection="column"
          flexGrow={1}
          alignItems="center"
          gap={2}
          style={{
            width: '100%',
            padding: '0 2rem',
          }}
        >
          <Flex
            flexDirection="row"
            alignItems="center"
            gap={0.5}
            style={{ width: '100%' }}
          >
            <Typography variant="subtitle1">Provenance</Typography>
            <TooltipIcon>
              <Trans>
                An NFT's provenance is a complete record of its ownership
                history. It provides a direct lineage that connects everyone who
                has owned the NFT, all the way back to the original artist. This
                helps to verify that the NFT is authentic.
              </Trans>
            </TooltipIcon>
          </Flex>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => viewOnExplorer(nft, NFTExplorer.Blexie)}
            style={{ width: '100%' }}
          >
            <Typography variant="caption" color="secondary">
              <Trans>Check Provenance on Blexie</Trans>
            </Typography>
          </Button>
        </Flex>
      )}
    </StyledPreviewContainer>
  );
}
