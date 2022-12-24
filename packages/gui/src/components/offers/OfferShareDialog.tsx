import child_process from 'child_process';
import fs from 'fs';
import path from 'path';

import { OfferTradeRecord } from '@chinilla/api';
import { usePrefs } from '@chinilla/api-react';
import {
  ButtonLoading,
  CopyToClipboard,
  DialogActions,
  Flex,
  TooltipIcon,
  useOpenDialog,
  useShowError,
  useOpenExternal,
} from '@chinilla/core';
import { Trans, t } from '@lingui/macro';
import {
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  FormControlLabel,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import debug from 'debug';
import React, { useMemo } from 'react';

import useAssetIdName, { AssetIdMapEntry } from '../../hooks/useAssetIdName';
import { NFTOfferSummary } from './NFTOfferViewer';
import OfferLocalStorageKeys from './OfferLocalStorage';
import OfferSummary from './OfferSummary';
import { offerContainsAssetOfType, shortSummaryForOffer, suggestedFilenameForOffer } from './utils';

const log = debug('chinilla-gui:offers');

/* ========================================================================== */

enum OfferSharingService {
  ForgeFarm = 'ForgeFarm',
  Chinilla = 'Chinilla',
}

enum OfferSharingCapability {
  Token = 'Token',
  NFT = 'NFT',
}

interface OfferSharingProvider {
  service: OfferSharingService;
  name: string;
  capabilities: OfferSharingCapability[];
}

type CommonOfferProps = {
  offerRecord: OfferTradeRecord;
  // eslint-disable-next-line react/no-unused-prop-types -- False positive
  offerData: string;
  // eslint-disable-next-line react/no-unused-prop-types -- False positive
  testnet?: boolean;
};

type CommonDialogProps = {
  open?: boolean;
  onClose?: (value: boolean) => void;
};

type OfferShareServiceDialogProps = CommonOfferProps & CommonDialogProps;

const testnetDummyHost = 'offers-api-sim.chinilla.com';

const OfferSharingProviders: {
  [key in OfferSharingService]: OfferSharingProvider;
} = {
  [OfferSharingService.ForgeFarm]: {
    service: OfferSharingService.ForgeFarm,
    name: 'ForgeFarm.io',
    capabilities: [OfferSharingCapability.Token, OfferSharingCapability.NFT],
  },
  [OfferSharingService.Chinilla]: {
    service: OfferSharingService.Chinilla,
    name: 'Chinilla.com',
    capabilities: [OfferSharingCapability.Token],
  },
};

/* ========================================================================== */

async function postToForgeFarm(offerData: string, testnet: boolean): Promise<string> {
  const { ipcRenderer } = window as any;
  const requestOptions = {
    method: 'POST',
    protocol: 'https:',
    hostname: testnet ? testnetDummyHost : 'forgefarm.io',
    port: 443,
    path: '/upload/chinilla',
  };
  const requestHeaders = {
    'Content-Type': 'application/text',
  };
  const requestData = offerData;
  const { err, statusCode, statusMessage, responseBody } = await ipcRenderer?.invoke(
    'fetchTextResponse',
    requestOptions,
    requestHeaders,
    requestData
  );

  if (err || statusCode !== 200) {
    const error = new Error(
      `ForgeFarm upload failed: ${err}, statusCode=${statusCode}, statusMessage=${statusMessage}, response=${responseBody}`
    );
    throw error;
  }

  const jsonObj = JSON.parse(responseBody);
  const { status, message, offer } = jsonObj;
 
  if (status == "error") {
    const error = new Error(message);
    throw error;
  }
  
  console.log('ForgeFarm Offer upload completed');

  return `https://forgefarm.io/offer/details/${offer}`;
}

// Posts the offer data to Chinilla and returns a URL to the offer.
async function postToChinilla(offerData: string, sharePrivately: boolean, testnet: boolean): Promise<string> {
  const { ipcRenderer } = window as any;
  const requestOptions = {
    method: 'POST',
    protocol: 'https:',
    hostname: testnet ? testnetDummyHost : 'chinilla.com',
    port: 443,
    path: testnet
      ? `/chinilla${sharePrivately ? '?private=true' : ''}`
      : `/upload${sharePrivately ? '?private=true' : ''}`,
  };
  const requestHeaders = {
    'Content-Type': 'application/text',
  };
  const requestData = offerData;
  const { err, statusCode, statusMessage, responseBody } = await ipcRenderer?.invoke(
    'fetchTextResponse',
    requestOptions,
    requestHeaders,
    requestData
  );

  if (err || statusCode !== 200) {
    const error = new Error(
      `Chinilla upload failed: ${err}, statusCode=${statusCode}, statusMessage=${statusMessage}, response=${responseBody}`
    );
    throw error;
  }

  const jsonObj = JSON.parse(responseBody);
  const { status, message, offer } = jsonObj;
 
  if (status == "error") {
    const error = new Error(message);
    throw error;
  }
  
  console.log('Chinilla.com Offer upload completed');

  return `https://chinilla.com/offer/details/${offer}`;
}

/* ========================================================================== */

function OfferShareForgeFarmDialog(props: OfferShareServiceDialogProps) {
  const { offerRecord, offerData, testnet = false, onClose = () => {}, open = false } = props;
  const openExternal = useOpenExternal();
  const [sharedURL, setSharedURL] = React.useState('');

  function handleClose() {
    onClose(false);
  }

  async function handleConfirm() {
    const url = await postToForgeFarm(offerData, testnet);
    log(`ForgeFarm URL: ${url}`);
    setSharedURL(url);
  }

  if (sharedURL) {
    return (
      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <DialogTitle>
          <Trans>Offer Shared</Trans>
        </DialogTitle>
        <DialogContent dividers>
          <Flex flexDirection="column" gap={3} sx={{ paddingTop: '1em' }}>
            <TextField
              label={<Trans>ForgeFarm URL</Trans>}
              value={sharedURL}
              variant="filled"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <CopyToClipboard value={sharedURL} />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
            <Flex>
              <Button variant="outlined" onClick={() => openExternal(sharedURL)}>
                <Trans>View on ForgeFarm</Trans>
              </Button>
            </Flex>
          </Flex>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">
            <Trans>Close</Trans>
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <OfferShareConfirmationDialog
      offerRecord={offerRecord}
      offerData={offerData}
      testnet={testnet}
      title={<Trans>Share on ForgeFarm.io</Trans>}
      onConfirm={handleConfirm}
      open={open}
      onClose={onClose}
    />
  );
}

function OfferShareChinillaDialog(props: OfferShareServiceDialogProps) {
  const { offerRecord, offerData, testnet = false, onClose = () => {}, open = false } = props;
  const openExternal = useOpenExternal();
  const [sharePrivately, setSharePrivately] = React.useState(false);
  const [sharedURL, setSharedURL] = React.useState('');

  function handleClose() {
    onClose(false);
  }

  async function handleConfirm() {
    const url = await postToChinilla(offerData, sharePrivately, testnet);
    log(`Chinilla URL (private=${sharePrivately}): ${url}`);
    setSharedURL(url);
  }

  if (sharedURL) {
    return (
      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <DialogTitle>
          <Trans>Offer Shared</Trans>
        </DialogTitle>
        <DialogContent dividers>
          <Flex flexDirection="column" gap={3} sx={{ paddingTop: '1em' }}>
            <TextField
              label={<Trans>Chinilla URL</Trans>}
              value={sharedURL}
              variant="filled"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <CopyToClipboard value={sharedURL} />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
            <Flex>
              <Button variant="outlined" onClick={() => openExternal(sharedURL)}>
                <Trans>View on Chinilla</Trans>
              </Button>
            </Flex>
          </Flex>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">
            <Trans>Close</Trans>
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <OfferShareConfirmationDialog
      offerRecord={offerRecord}
      offerData={offerData}
      testnet={testnet}
      title={<Trans>Share on Chinilla.com</Trans>}
      onConfirm={handleConfirm}
      open={open}
      onClose={onClose}
      actions={
        <FormControlLabel
          control={
            <Checkbox
              name="sharePrivately"
              checked={sharePrivately}
              onChange={(event) => setSharePrivately(event.target.checked)}
            />
          }
          label={
            <>
              <Trans>Share Privately</Trans>{' '}
              <TooltipIcon>
                <Trans>If selected, your offer will be not be shared publicly.</Trans>
              </TooltipIcon>
            </>
          }
        />
      }
    />
  );
}

/* ========================================================================== */

type OfferShareConfirmationDialogProps = CommonOfferProps &
  CommonDialogProps & {
    title: React.ReactElement;
    onConfirm: () => Promise<void>;
    actions?: React.ReactElement;
  };

function OfferShareConfirmationDialog(props: OfferShareConfirmationDialogProps) {
  const { offerRecord, title, onConfirm, actions = null, onClose = () => {}, open = false } = props;
  const showError = useShowError();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isNFTOffer = offerContainsAssetOfType(offerRecord.summary, 'singleton');
  const OfferSummaryComponent = isNFTOffer ? NFTOfferSummary : OfferSummary;

  function handleClose() {
    onClose(false);
  }

  async function handleConfirm() {
    try {
      setIsSubmitting(true);

      await onConfirm();
    } catch (e) {
      showError(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      open={open}
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent dividers>
        <Flex flexDirection="column" gap={1} style={{ paddingTop: '1em' }}>
          <OfferSummaryComponent
            isMyOffer
            imported={false}
            summary={offerRecord.summary}
            makerTitle={
              <Typography variant="subtitle1">
                <Trans>Your offer:</Trans>
              </Typography>
            }
            takerTitle={
              <Typography variant="subtitle1">
                <Trans>In exchange for:</Trans>
              </Typography>
            }
            rowIndentation={3}
            showNFTPreview
          />
        </Flex>
      </DialogContent>
      <DialogActions>
        {actions}
        <Flex flexGrow={1} />
        <Button onClick={handleClose} color="primary" variant="contained" disabled={isSubmitting}>
          <Trans>Cancel</Trans>
        </Button>
        <ButtonLoading onClick={handleConfirm} variant="outlined" loading={isSubmitting}>
          <Trans>Share</Trans>
        </ButtonLoading>
      </DialogActions>
    </Dialog>
  );
}

/* ========================================================================== */

type OfferShareDialogProps = CommonOfferProps &
  CommonDialogProps & {
    showSuppressionCheckbox?: boolean;
    exportOffer?: () => void;
  };

interface OfferShareDialogProvider extends OfferSharingProvider {
  dialogComponent: React.FunctionComponent<OfferShareServiceDialogProps>;
  props: Record<string, unknown>;
}

export default function OfferShareDialog(props: OfferShareDialogProps) {
  const {
    offerRecord,
    offerData,
    exportOffer,
    open = false,
    onClose = () => {},
    showSuppressionCheckbox = false,
    testnet = false,
  } = props;
  const openDialog = useOpenDialog();
  const [suppressShareOnCreate, setSuppressShareOnCreate] = usePrefs<boolean>(
    OfferLocalStorageKeys.SUPPRESS_SHARE_ON_CREATE
  );
  const isNFTOffer = offerContainsAssetOfType(offerRecord.summary, 'singleton');

  const shareOptions: OfferShareDialogProvider[] = useMemo(() => {
    const capabilities = isNFTOffer ? [OfferSharingCapability.NFT] : [OfferSharingCapability.Token];

    const dialogComponents: {
      [key in OfferSharingService]: {
        component: React.FunctionComponent<OfferShareServiceDialogProps>;
        props: any;
      };
    } = {
      [OfferSharingService.ForgeFarm]: {
        component: OfferShareForgeFarmDialog,
        props: {},
      },
      [OfferSharingService.Chinilla]: {
        component: OfferShareChinillaDialog,
        props: {},
      },
    };

    const options = Object.keys(OfferSharingService)
      .filter((key) => Object.keys(dialogComponents).includes(key))
      .filter((key) =>
        OfferSharingProviders[key as OfferSharingService].capabilities.some((cap) => capabilities.includes(cap))
      )
      .map((key) => {
        const { component, props: dialogProps } = dialogComponents[key as OfferSharingService];
        return {
          ...OfferSharingProviders[key as OfferSharingService],
          dialogComponent: component,
          dialogProps,
        };
      });

    return options;
  }, [isNFTOffer]);

  function handleClose() {
    onClose(false);
  }

  async function handleShare(dialogProvider: OfferShareDialogProvider) {
    const DialogComponent = dialogProvider.dialogComponent;
    const { props: dialogProps } = dialogProvider;

    await openDialog(
      <DialogComponent offerRecord={offerRecord} offerData={offerData} testnet={testnet} {...dialogProps} />
    );
  }

  function toggleSuppression(value: boolean) {
    setSuppressShareOnCreate(value);
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="md"
      open={open}
    >
      <DialogTitle id="alert-dialog-title">
        <Trans>Share Offer</Trans>
      </DialogTitle>

      <DialogContent dividers>
        <Flex flexDirection="column" gap={2}>
          <Flex flexDirection="column" gap={2}>
            <Typography variant="subtitle1">Where would you like to share your offer?</Typography>
            <Flex flexDirection="column" gap={3}>
              {shareOptions.map((dialogProvider) => (
                <Button variant="outlined" onClick={() => handleShare(dialogProvider)} key={dialogProvider.name}>
                  {dialogProvider.name}
                </Button>
              ))}
              {exportOffer !== undefined && (
                <Button variant="outlined" color="secondary" onClick={exportOffer}>
                  <Flex flexDirection="column">Save Offer File</Flex>
                </Button>
              )}
            </Flex>
          </Flex>
          {showSuppressionCheckbox && (
            <FormControlLabel
              control={
                <Checkbox
                  name="suppressShareOnCreate"
                  checked={!!suppressShareOnCreate}
                  onChange={(event) => toggleSuppression(event.target.checked)}
                />
              }
              label={<Trans>Do not show this dialog again</Trans>}
            />
          )}
        </Flex>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" variant="contained">
          <Trans>Close</Trans>
        </Button>
      </DialogActions>
    </Dialog>
  );
}
