import React from 'react';
import { Plural, t, Trans } from '@lingui/macro';
import {
  CopyToClipboard,
  Flex,
  Link,
  FormatLargeNumber,
  TooltipIcon,
  vojoToCATLocaleString,
} from '@chinilla/core';
import { Box, Typography } from '@mui/material';
import useAssetIdName from '../../hooks/useAssetIdName';
import { WalletType } from '@chinilla/api';
import { formatAmountForWalletType } from './utils';
import { launcherIdToNFTId } from '../../util/nfts';
import NFTSummary from '../nfts/NFTSummary';
import styled from 'styled-components';

/* ========================================================================== */

const StyledTitle = styled(Box)`
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.7);
`;

const StyledValue = styled(Box)`
  word-break: break-all;
`;

/* ========================================================================== */

type OfferVojoAmountProps = {
  vojos: number;
};

function OfferVojoAmount(
  props: OfferVojoAmountProps,
): React.ReactElement | null {
  const { vojos } = props;

  return (
    <Flex flexDirection="row" flexGrow={1} gap={1}>
      (
      <FormatLargeNumber value={vojos} />
      <Box>
        <Plural value={vojos} one="vojo" other="vojos" />
      </Box>
      )
    </Flex>
  );
}

OfferVojoAmount.defaultProps = {
  vojos: 0,
};

function shouldShowVojoAmount(
  vojos: number,
  vojoThreshold = 1000000000 /* 1 billion */,
): boolean {
  return vojoThreshold > 0 && vojos < vojoThreshold;
}

/* ========================================================================== */

type OfferSummaryNFTRowProps = {
  launcherId: string;
  amount: number;
  rowNumber?: number;
  showNFTPreview: boolean;
};

export function OfferSummaryNFTRow(
  props: OfferSummaryNFTRowProps,
): React.ReactElement {
  const { launcherId, rowNumber, showNFTPreview } = props;
  const nftId = launcherIdToNFTId(launcherId);

  return (
    <Flex flexDirection="column" gap={2}>
      {!showNFTPreview && (
        <Flex flexDirections="row" alignItems="center" gap={1}>
          <Typography variant="body1">
            <Flex flexDirection="row" alignItems="center" gap={1}>
              {rowNumber !== undefined && (
                <Typography
                  variant="body1"
                  color="secondary"
                  style={{ fontWeight: 'bold' }}
                >{`${rowNumber})`}</Typography>
              )}
              <Typography>{nftId}</Typography>
            </Flex>
          </Typography>
          {launcherId !== undefined && (
            <TooltipIcon interactive>
              <Flex flexDirection="column" gap={1}>
                <Flex flexDirection="column" gap={0}>
                  <Flex>
                    <Box flexGrow={1}>
                      <StyledTitle>NFT ID</StyledTitle>
                    </Box>
                  </Flex>
                  <Flex alignItems="center" gap={1}>
                    <StyledValue>{nftId}</StyledValue>
                    <CopyToClipboard value={nftId} fontSize="small" />
                  </Flex>
                </Flex>
                <Flex flexDirection="column" gap={0}>
                  <Flex>
                    <Box flexGrow={1}>
                      <StyledTitle>Launcher ID</StyledTitle>
                    </Box>
                  </Flex>
                  <Flex alignItems="center" gap={1}>
                    <StyledValue>{launcherId}</StyledValue>
                    <CopyToClipboard value={launcherId} fontSize="small" />
                  </Flex>
                </Flex>
              </Flex>
            </TooltipIcon>
          )}
        </Flex>
      )}
      {showNFTPreview && <NFTSummary launcherId={launcherId} />}
    </Flex>
  );
}

/* ========================================================================== */

type OfferSummaryTokenRowProps = {
  assetId: string;
  amount: number;
  rowNumber?: number;
  overrideNFTSellerAmount?: number;
};

export function OfferSummaryTokenRow(
  props: OfferSummaryTokenRowProps,
): React.ReactElement {
  const {
    assetId,
    amount: originalAmount,
    rowNumber,
    overrideNFTSellerAmount,
  } = props;
  const { lookupByAssetId } = useAssetIdName();
  const assetIdInfo = lookupByAssetId(assetId);
  const amount = overrideNFTSellerAmount ?? originalAmount;
  const displayAmount = assetIdInfo
    ? formatAmountForWalletType(amount as number, assetIdInfo.walletType)
    : vojoToCATLocaleString(amount);
  const displayName = assetIdInfo?.displayName ?? t`Unknown CAT`;
  const tooltipDisplayName = assetIdInfo?.name ?? t`Unknown CAT`;
  const showVojoAmount =
    assetIdInfo?.walletType === WalletType.STANDARD_WALLET &&
    shouldShowVojoAmount(amount);

  return (
    <Flex flexDirections="row" alignItems="center" gap={1}>
      <Typography variant="body1">
        <Flex flexDirection="row" alignItems="center" gap={1}>
          {rowNumber !== undefined && (
            <Typography
              variant="body1"
              color="secondary"
              style={{ fontWeight: 'bold' }}
            >{`${rowNumber})`}</Typography>
          )}
          <Typography>
            {displayAmount} {displayName}
          </Typography>
        </Flex>
      </Typography>
      {showVojoAmount && (
        <Typography variant="body1" color="textSecondary">
          <OfferVojoAmount vojos={amount} />
        </Typography>
      )}
      <TooltipIcon interactive>
        <Flex flexDirection="column" gap={1}>
          <Flex flexDirection="column" gap={0}>
            <Flex>
              <Box flexGrow={1}>
                <StyledTitle>Name</StyledTitle>
              </Box>
              {(!assetIdInfo || assetIdInfo?.walletType === WalletType.CAT) && (
                <Link
                  href={`https://www.taildatabase.com/tail/${assetId.toLowerCase()}`}
                  target="_blank"
                >
                  <Trans>Search on Tail Database</Trans>
                </Link>
              )}
            </Flex>

            <StyledValue>{tooltipDisplayName}</StyledValue>
          </Flex>
          {(!assetIdInfo || assetIdInfo?.walletType === WalletType.CAT) && (
            <Flex flexDirection="column" gap={0}>
              <StyledTitle>Asset ID</StyledTitle>
              <Flex alignItems="center" gap={1}>
                <StyledValue>{assetId.toLowerCase()}</StyledValue>
                <CopyToClipboard
                  value={assetId.toLowerCase()}
                  fontSize="small"
                />
              </Flex>
            </Flex>
          )}
        </Flex>
      </TooltipIcon>
    </Flex>
  );
}

/* ========================================================================== */

type Props = {
  assetId: string;
  amount: number;
  rowNumber?: number;
};

export default function OfferSummaryRow(props: Props) {
  const { assetId, amount, rowNumber } = props;
  const { lookupByAssetId } = useAssetIdName();
  const assetIdInfo = lookupByAssetId(assetId);
  const displayAmount = assetIdInfo
    ? formatAmountForWalletType(amount as number, assetIdInfo.walletType)
    : vojoToCATLocaleString(amount);
  const displayName = assetIdInfo?.displayName ?? t`Unknown CAT`;
  const showVojoAmount =
    assetIdInfo?.walletType === WalletType.STANDARD_WALLET &&
    shouldShowVojoAmount(amount);

  return (
    <Flex flexDirections="row" alignItems="center" gap={1}>
      <Typography variant="body1">
        <Flex flexDirection="row" alignItems="center" gap={1}>
          {rowNumber !== undefined && (
            <Typography
              variant="body1"
              color="secondary"
              style={{ fontWeight: 'bold' }}
            >{`${rowNumber})`}</Typography>
          )}
          <Typography>
            {displayAmount} {displayName}
          </Typography>
        </Flex>
      </Typography>
      {showVojoAmount && (
        <Typography variant="body1" color="textSecondary">
          <OfferVojoAmount vojos={amount} />
        </Typography>
      )}
      <TooltipIcon interactive>
        <Flex flexDirection="column" gap={1}>
          <Flex flexDirection="column" gap={0}>
            <Flex>
              <Box flexGrow={1}>
                <StyledTitle>Name</StyledTitle>
              </Box>
              {assetIdInfo?.walletType === WalletType.CAT && (
                <Link
                  href={`https://www.taildatabase.com/tail/${assetId.toLowerCase()}`}
                  target="_blank"
                >
                  <Trans>Search on Tail Database</Trans>
                </Link>
              )}
            </Flex>

            <StyledValue>{assetIdInfo?.name}</StyledValue>
          </Flex>
          {assetIdInfo?.walletType === WalletType.CAT && (
            <Flex flexDirection="column" gap={0}>
              <StyledTitle>Asset ID</StyledTitle>
              <Flex alignItems="center" gap={1}>
                <StyledValue>{assetId.toLowerCase()}</StyledValue>
                <CopyToClipboard
                  value={assetId.toLowerCase()}
                  fontSize="small"
                />
              </Flex>
            </Flex>
          )}
        </Flex>
      </TooltipIcon>
    </Flex>
  );
}
