import { WalletType } from '@chinilla/api';
import { useGetWalletsQuery, useCreateOfferForIdsMutation, usePrefs } from '@chinilla/api-react';
import { Flex, ButtonLoading, useOpenDialog, Loading } from '@chinilla/core';
import { t, Trans } from '@lingui/macro';
import { Grid } from '@mui/material';
import React, { useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import type OfferBuilderData from '../../@types/OfferBuilderData';
import offerBuilderDataToOffer from '../../util/offerBuilderDataToOffer';
import OfferEditorConfirmationDialog from '../offers/OfferEditorConfirmationDialog';
import OfferLocalStorageKeys from '../offers/OfferLocalStorage';
import OfferBuilder, { emptyDefaultValues } from './OfferBuilder';
import OfferNavigationHeader from './OfferNavigationHeader';

type CreateDefaultValuesParams = {
  walletType?: WalletType; // CAT or STANDARD_WALLET (HCX), indicates whether a token or CAT has a default entry
  assetId?: string; // Asset ID of the CAT
  nftId?: string; // NFT to include in the offer by default
  nftIds?: string[]; // multiple NFT selection
  nftWalletId?: number; // If set, indicates that we are offering the NFT, otherwise we are requesting it
};

export function createDefaultValues(params: CreateDefaultValuesParams): OfferBuilderData {
  const { walletType, assetId, nftId, nftWalletId, nftIds } = params;

  const nfts =
    nftIds && nftWalletId ? nftIds.map((nftIdItem) => ({ nftId: nftIdItem })) : nftId && nftWalletId ? [{ nftId }] : [];

  return {
    ...emptyDefaultValues,
    offered: {
      ...emptyDefaultValues.offered,
      nfts,
      hcx: walletType === WalletType.STANDARD_WALLET ? [{ amount: '' }] : [],
      tokens: walletType === WalletType.CAT && assetId ? [{ assetId, amount: '' }] : [],
    },
    requested: {
      ...emptyDefaultValues.requested,
      nfts: nftId && !nftWalletId ? [{ nftId }] : [], // NFTs that are not in a wallet are requested
    },
  };
}

export type CreateOfferBuilderProps = {
  walletType?: WalletType;
  assetId?: string;
  nftId?: string;
  nftWalletId?: number;
  referrerPath?: string;
  onOfferCreated: (obj: { offerRecord: any; offerData: any }) => void;
  nftIds?: string[];
};

export default function CreateOfferBuilder(props: CreateOfferBuilderProps) {
  const { referrerPath, onOfferCreated, walletType, assetId, nftId, nftWalletId, nftIds } = props;

  const openDialog = useOpenDialog();
  const navigate = useNavigate();
  const { data: wallets, isLoading } = useGetWalletsQuery();
  const [createOfferForIds] = useCreateOfferForIdsMutation();
  const offerBuilderRef = useRef<{ submit: () => void } | undefined>(undefined);

  const defaultValues = useMemo(
    () =>
      createDefaultValues({
        walletType,
        assetId,
        nftId,
        nftWalletId,
        nftIds,
      }),
    [walletType, assetId, nftId, nftWalletId, nftIds]
  );

  const [suppressShareOnCreate] = usePrefs<boolean>(OfferLocalStorageKeys.SUPPRESS_SHARE_ON_CREATE);

  function handleCreateOffer() {
    offerBuilderRef.current?.submit();
  }

  async function handleSubmit(values: OfferBuilderData) {
    const offer = await offerBuilderDataToOffer(values, wallets, false);

    const confirmedCreation = await openDialog(<OfferEditorConfirmationDialog />);

    if (!confirmedCreation) {
      return;
    }

    try {
      const response = await createOfferForIds({
        ...offer,
        disableJSONFormatting: true,
      }).unwrap();

      const { offer: offerData, tradeRecord: offerRecord } = response;

      navigate(-1);

      if (!suppressShareOnCreate) {
        onOfferCreated({ offerRecord, offerData });
      }
    } catch (error) {
      if ((error as Error).message.startsWith('insufficient funds')) {
        throw new Error(t`
          Insufficient funds available to create offer. Ensure that your
          spendable balance is sufficient to cover the offer amount.
        `);
      } else {
        throw error;
      }
    }
  }

  return (
    <Grid container>
      <Flex flexDirection="column" flexGrow={1} gap={4}>
        <Flex alignItems="center" justifyContent="space-between" gap={2}>
          <OfferNavigationHeader referrerPath={referrerPath} />
          <ButtonLoading variant="contained" color="primary" onClick={handleCreateOffer} disableElevation>
            <Trans>Create Offer</Trans>
          </ButtonLoading>
        </Flex>

        {isLoading ? (
          <Loading center />
        ) : (
          <OfferBuilder onSubmit={handleSubmit} defaultValues={defaultValues} ref={offerBuilderRef} />
        )}
      </Flex>
    </Grid>
  );
}
