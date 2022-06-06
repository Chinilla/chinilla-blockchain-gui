import React, { useMemo, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { Trans, t } from '@lingui/macro';
import { useLocalStorage } from '@rehooks/local-storage';
import type { NFTInfo } from '@chinilla/api';
import {
  useCreateOfferForIdsMutation,
  useGetNFTInfoQuery,
} from '@chinilla/api-react';
import {
  Amount,
  Back,
  Button,
  ButtonLoading,
  Fee,
  Flex,
  Form,
  TextField,
  chinillaToVojo,
  useOpenDialog,
  useShowError,
} from '@chinilla/core';
import { Divider, Grid, Tabs, Tab, Typography } from '@mui/material';
import OfferLocalStorageKeys from './OfferLocalStorage';
import OfferEditorConfirmationDialog from './OfferEditorConfirmationDialog';
import { isValidNFTId, launcherIdFromNFTId } from '../../util/nfts';
import NFTOfferPreview from './NFTOfferPreview';

/* ========================================================================== */
/*              Temporary home for the NFT-specific Offer Editor              */
/*        An NFT offer consists of a single NFT being offered for HCX         */
/* ========================================================================== */

/* ========================================================================== */

enum NFTOfferEditorExchangeType {
  NFTForHCX = 'nft_for_hcx',
  HCXForNFT = 'hcx_for_nft',
}

/* ========================================================================== */

type NFTOfferConditionalsPanelProps = {
  defaultValues: NFTOfferEditorFormData;
  isProcessing: boolean;
};

function NFTOfferConditionalsPanel(props: NFTOfferConditionalsPanelProps) {
  const { defaultValues, isProcessing } = props;
  const disabled = isProcessing;
  const methods = useFormContext();
  const [amountFocused, setAmountFocused] = useState<boolean>(false);

  const tab = methods.watch('exchangeType');
  const amount = methods.watch('hcxAmount');
  // HACK: manually determine the value for the amount field's shrink input prop.
  // Without this, toggling between the two tabs with an amount specified will cause
  // the textfield's label and value to overlap.
  const shrink = useMemo(() => {
    if (!amountFocused && (amount === undefined || amount.length === 0)) {
      return false;
    }
    return true;
  }, [amount, amountFocused]);

  const nftElem = (
    <Grid item>
      <TextField
        id={`${tab}-nftId}`}
        key={`${tab}-nftId}`}
        variant="filled"
        name="nftId"
        color="secondary"
        disabled={disabled}
        label={<Trans>NFT</Trans>}
        defaultValue={defaultValues.nftId}
        placeholder={t`NFT Identifier`}
        inputProps={{ spellCheck: false }}
        fullWidth
        required
      />
    </Grid>
  );
  const amountElem = (
    <Grid item>
      <Amount
        id={`${tab}-amount}`}
        key={`${tab}-amount}`}
        variant="filled"
        name="hcxAmount"
        color="secondary"
        disabled={disabled}
        label={<Trans>Amount</Trans>}
        defaultValue={amount}
        onChange={handleAmountChange}
        onFocus={() => setAmountFocused(true)}
        onBlur={() => setAmountFocused(false)}
        showAmountInVojos={true}
        InputLabelProps={{ shrink }}
        required
      />
    </Grid>
  );
  const offerElem =
    tab === NFTOfferEditorExchangeType.NFTForHCX ? nftElem : amountElem;
  const takerElem =
    tab === NFTOfferEditorExchangeType.NFTForHCX ? amountElem : nftElem;

  function handleAmountChange(amount: string) {
    methods.setValue('hcxAmount', amount);
  }

  function handleFeeChange(fee: string) {
    methods.setValue('fee', fee);
  }

  function handleReset() {
    methods.reset(defaultValues);
  }

  return (
    <Flex
      flexDirection="column"
      flexGrow={1}
      gap={3}
      style={{ padding: '1.5rem' }}
    >
      <Tabs
        value={tab}
        onChange={(_event, newValue) =>
          methods.setValue('exchangeType', newValue)
        }
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab
          value={NFTOfferEditorExchangeType.NFTForHCX}
          label={<Trans>NFT for HCX</Trans>}
          disabled={disabled}
        />
        <Tab
          value={NFTOfferEditorExchangeType.HCXForNFT}
          label={<Trans>HCX for NFT</Trans>}
          disabled={disabled}
        />
      </Tabs>
      <Grid container>
        <Flex flexDirection="column" flexGrow={1} gap={3}>
          <Flex flexDirection="column" gap={1}>
            <Typography variant="subtitle1">You will offer</Typography>
            {offerElem}
          </Flex>
          <Flex flexDirection="column" gap={1}>
            <Typography variant="subtitle1">In exchange for</Typography>
            {takerElem}
          </Flex>
          <Divider />
          <Grid item>
            <Fee
              id="fee"
              variant="filled"
              name="fee"
              color="secondary"
              disabled={disabled}
              onChange={handleFeeChange}
              defaultValue={defaultValues.fee}
              label={<Trans>Fee</Trans>}
            />
          </Grid>
        </Flex>
      </Grid>
      <Flex
        flexDirection="column"
        flexGrow={1}
        alignItems="flex-end"
        justifyContent="flex-end"
      >
        <Flex justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            type="reset"
            onClick={handleReset}
            disabled={isProcessing}
          >
            <Trans>Reset</Trans>
          </Button>
          <ButtonLoading
            variant="contained"
            color="primary"
            type="submit"
            loading={isProcessing}
          >
            <Trans>Create Offer</Trans>
          </ButtonLoading>
        </Flex>
      </Flex>
    </Flex>
  );
}

NFTOfferConditionalsPanel.defaultProps = {
  isProcessing: false,
};

/* ========================================================================== */
/*                              NFT Offer Editor                              */
/*             Currently only supports a single NFT <--> HCX offer            */
/* ========================================================================== */

type NFTOfferEditorFormData = {
  exchangeType: NFTOfferEditorExchangeType;
  nftId?: string;
  hcxAmount: string;
  fee: string;
};

type NFTOfferEditorValidatedFormData = {
  exchangeType: NFTOfferEditorExchangeType;
  launcherId: string;
  hcxAmount: string;
  fee: string;
};

type NFTOfferEditorProps = {
  nft?: NFTInfo;
  onOfferCreated: (obj: { offerRecord: any; offerData: any }) => void;
};

function buildOfferRequest(
  exchangeType: NFTOfferEditorExchangeType,
  nft: NFTInfo,
  nftLauncherId: string,
  hcxAmount: string,
  fee: string,
) {
  const baseVojoAmount: BigNumber = chinillaToVojo(hcxAmount);
  const vojoAmount =
    exchangeType === NFTOfferEditorExchangeType.NFTForHCX
      ? baseVojoAmount
      : baseVojoAmount.negated();
  const feeVojoAmount = chinillaToVojo(fee);
  const nftAmount =
    exchangeType === NFTOfferEditorExchangeType.NFTForHCX ? -1 : 1;
  const hcxWalletId = 1;
  const driverDict = {
    [nftLauncherId]: {
      type: 'singleton',
      launcher_id: `0x${nftLauncherId}`,
      launcher_ph: nft.launcherPuzhash,
      also: {
        type: 'metadata',
        metadata: nft.chainInfo,
        updater_hash: nft.updaterPuzhash,
      },
    },
  };

  return [
    {
      [nftLauncherId]: nftAmount,
      [hcxWalletId]: vojoAmount,
    },
    driverDict,
    feeVojoAmount,
  ];
}

export default function NFTOfferEditor(props: NFTOfferEditorProps) {
  const { nft, onOfferCreated } = props;
  const [createOfferForIds] = useCreateOfferForIdsMutation();
  const [isProcessing, setIsProcessing] = useState(false);
  const openDialog = useOpenDialog();
  const errorDialog = useShowError();
  const navigate = useNavigate();
  const [suppressShareOnCreate] = useLocalStorage<boolean>(
    OfferLocalStorageKeys.SUPPRESS_SHARE_ON_CREATE,
  );
  const defaultValues: NFTOfferEditorFormData = {
    exchangeType: NFTOfferEditorExchangeType.NFTForHCX,
    nftId: nft?.$nftId ?? '',
    hcxAmount: '',
    fee: '',
  };
  const methods = useForm<NFTOfferEditorFormData>({
    shouldUnregister: false,
    defaultValues,
  });
  const nftId = methods.watch('nftId');
  const launcherId = launcherIdFromNFTId(nftId ?? '');
  const {
    data: queriedNFTInfo,
    isLoading,
    error,
  } = useGetNFTInfoQuery({ coinId: launcherId });

  function validateFormData(
    unvalidatedFormData: NFTOfferEditorFormData,
  ): NFTOfferEditorValidatedFormData | undefined {
    const { exchangeType, nftId, hcxAmount, fee } = unvalidatedFormData;
    let result: NFTOfferEditorValidatedFormData | undefined = undefined;

    if (!nftId) {
      errorDialog(new Error(t`Please enter an NFT identifier`));
    } else if (!isValidNFTId(nftId)) {
      errorDialog(new Error(t`Invalid NFT identifier`));
    } else if (!launcherId) {
      errorDialog(new Error(t`Failed to decode NFT identifier`));
    } else if (!hcxAmount || hcxAmount === '0') {
      errorDialog(new Error(t`Please enter an amount`));
    } else {
      result = {
        exchangeType,
        launcherId,
        hcxAmount,
        fee,
      };
    }

    return result;
  }

  async function handleSubmit(unvalidatedFormData: NFTOfferEditorFormData) {
    const formData = validateFormData(unvalidatedFormData);

    if (!formData) {
      console.log('Invalid NFT offer:');
      console.log(unvalidatedFormData);
      return;
    }

    const offerNFT = nft || queriedNFTInfo;

    if (!offerNFT) {
      errorDialog(new Error(t`NFT details not available`));
      return;
    }

    const { exchangeType, launcherId, hcxAmount, fee } = formData;
    const [offer, driverDict, feeInVojos] = buildOfferRequest(
      exchangeType,
      offerNFT,
      launcherId,
      hcxAmount,
      fee,
    );

    const confirmedCreation = await openDialog(
      <OfferEditorConfirmationDialog />,
    );

    if (!confirmedCreation) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await createOfferForIds({
        walletIdsAndAmounts: offer,
        feeInVojos,
        driverDict,
        validateOnly: false,
        disableJSONFormatting: true,
      }).unwrap();

      if (response.success === false) {
        const error =
          response.error ||
          new Error('Encountered an unknown error while creating offer');
        errorDialog(error);
      } else {
        const { offer: offerData, tradeRecord: offerRecord } = response;

        navigate(-1);

        if (!suppressShareOnCreate) {
          onOfferCreated({ offerRecord, offerData });
        }
      }
    } catch (err) {
      errorDialog(err);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Form methods={methods} onSubmit={handleSubmit}>
      <Flex
        flexDirection="column"
        flexGrow={1}
        gap={1}
        style={{
          border: '1px solid #E0E0E0',
          boxSizing: 'border-box',
          borderRadius: '8px',
        }}
      >
        <Flex flexDirection="row">
          <NFTOfferConditionalsPanel
            defaultValues={defaultValues}
            isProcessing={isProcessing}
          />
          <NFTOfferPreview nftId={nftId} />
        </Flex>
      </Flex>
    </Form>
  );
}

/* ========================================================================== */
/*                    Create and Host the NFT Offer Editor                    */
/* ========================================================================== */

type CreateNFTOfferEditorProps = {
  nft?: NFTInfo;
  referrerPath?: string;
  onOfferCreated: (obj: { offerRecord: any; offerData: any }) => void;
};

export function CreateNFTOfferEditor(props: CreateNFTOfferEditorProps) {
  const { nft, referrerPath, onOfferCreated } = props;

  const title = <Trans>Create an NFT Offer</Trans>;
  const navElement = referrerPath ? (
    <Back variant="h5" to={referrerPath}>
      {title}
    </Back>
  ) : (
    <>{title}</>
  );

  return (
    <Grid container>
      <Flex flexDirection="column" flexGrow={1} gap={3}>
        <Flex>{navElement}</Flex>
        <NFTOfferEditor nft={nft} onOfferCreated={onOfferCreated} />
      </Flex>
    </Grid>
  );
}
