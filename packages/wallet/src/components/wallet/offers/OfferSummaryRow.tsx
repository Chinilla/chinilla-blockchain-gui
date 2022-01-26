import React from 'react';
import { Plural, t } from '@lingui/macro';
import {
  CopyToClipboard,
  Flex,
  FormatLargeNumber,
  TooltipIcon,
} from '@chinilla/core';
import {
  Box,
  Typography,
} from '@material-ui/core';
import useAssetIdName from '../../../hooks/useAssetIdName';
import WalletType from '../../../constants/WalletType';
import { formatAmountForWalletType } from './utils';
import { chin_to_colouredcoin_string } from '../../../util/chinilla';
import styled from 'styled-components';

const StyledTitle = styled(Box)`
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.7);
`;

const StyledValue = styled(Box)`
  word-break: break-all;
`;

type OfferChinAmountProps = {
  chins: number;
};

function OfferChinAmount(props: OfferChinAmountProps): React.ReactElement | null {
  const { chins } = props;

  return (
    <Flex flexDirection="row" flexGrow={1} gap={1}>
      (
      <FormatLargeNumber value={chins} />
      <Box>
        <Plural value={chins} one="chin" other="chins" />
      </Box>
      )
    </Flex>
  );
}

OfferChinAmount.defaultProps = {
  chins: 0,
};

function shouldShowChinAmount(chins: number, chinThreshold: number = 1000000000 /* 1 billion */): boolean {
  return chinThreshold > 0 && (chins < chinThreshold);
}

type Props = {
  assetId: string;
  amount: number;
  rowNumber?: number;
};

export default function OfferSummaryRow(props: Props) {
  const { assetId, amount, rowNumber } = props;
  const { lookupByAssetId } = useAssetIdName();
  const assetIdInfo = lookupByAssetId(assetId);
  const displayAmount = assetIdInfo ? formatAmountForWalletType(amount as number, assetIdInfo.walletType) : chin_to_colouredcoin_string(amount);
  const displayName = assetIdInfo?.displayName ?? t`Unknown CAT`;
  const showChinAmount = assetIdInfo?.walletType === WalletType.STANDARD_WALLET && shouldShowChinAmount(amount);

  return (
    <Flex flexDirections="row" alignItems="center" gap={1}>
      <Typography variant="body1">
        <Flex flexDirection="row" alignItems="center" gap={1}>
          {rowNumber !== undefined && (
            <Typography variant="body1" color="secondary" style={{fontWeight: 'bold'}}>{`${rowNumber})`}</Typography>
          )}
          <Typography>{displayAmount} {displayName}</Typography>
        </Flex>
      </Typography>
      {showChinAmount && (
        <Typography variant="body1" color="textSecondary">
          <OfferChinAmount chins={amount} />
        </Typography>
      )}
      <TooltipIcon interactive>
        <Flex flexDirection="column" gap={1}>
          <Flex flexDirection="column" gap={0}>
            <StyledTitle>Name</StyledTitle>
            <StyledValue>{assetIdInfo?.name}</StyledValue>
          </Flex>
          {assetIdInfo?.walletType !== WalletType.STANDARD_WALLET && (
            <Flex flexDirection="column" gap={0}>
              <StyledTitle>Asset ID</StyledTitle>
              <Flex alignItems="center" gap={1}>
                <StyledValue>{assetId.toLowerCase()}</StyledValue>
                <CopyToClipboard value={assetId.toLowerCase()} fontSize="small" />
              </Flex>
            </Flex>
          )}
        </Flex>
      </TooltipIcon>
    </Flex>
  );
}
