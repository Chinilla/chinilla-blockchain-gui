import React, { useMemo } from 'react';
import { Trans, t } from '@lingui/macro';
import { useLocalStorage } from '@rehooks/local-storage';
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
import { OfferTradeRecord, toBech32m } from '@chinilla/api';
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
import {
  offerContainsAssetOfType,
  shortSummaryForOffer,
  suggestedFilenameForOffer,
} from './utils';
import useAssetIdName, { AssetIdMapEntry } from '../../hooks/useAssetIdName';
import { Shell } from 'electron';
import { NFTOfferSummary } from './NFTOfferViewer';
import OfferLocalStorageKeys from './OfferLocalStorage';
import OfferSummary from './OfferSummary';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';

/* ========================================================================== */

enum OfferSharingService {
  Chinilla = 'Chinilla',
  ForgeFarm = 'ForgeFarm',
  Keybase = 'Keybase',
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
  offerData: string;
  testnet: boolean;
};

type CommonDialogProps = {
  open: boolean;
  onClose: (value: boolean) => void;
};

type OfferShareServiceDialogProps = CommonOfferProps & CommonDialogProps;

const testnetDummyHost = 'file-acceptor.chinilla.com';
const testnetDummyEndpoint = '/';

const OfferSharingProviders: {
  [key in OfferSharingService]: OfferSharingProvider;
} = {
  [OfferSharingService.Chinilla]: {
    service: OfferSharingService.Chinilla,
    name: 'Chinilla',
    capabilities: [OfferSharingCapability.Token],
  },
  [OfferSharingService.ForgeFarm]: {
    service: OfferSharingService.ForgeFarm,
    name: 'ForgeFarm',
    capabilities: [OfferSharingCapability.NFT],
  },
  [OfferSharingService.Keybase]: {
    service: OfferSharingService.Keybase,
    name: 'Keybase',
    capabilities: [OfferSharingCapability.Token, OfferSharingCapability.NFT],
  },
};

/* ========================================================================== */

async function writeTempOfferFile(
  offerData: string,
  filename: string,
): Promise<string> {
  const ipcRenderer = (window as any).ipcRenderer;
  const tempRoot = await ipcRenderer?.invoke('getTempDir');
  const tempPath = fs.mkdtempSync(path.join(tempRoot, 'offer'));
  const filePath = path.join(tempPath, filename);

  fs.writeFileSync(filePath, offerData);

  return filePath;
}

/* ========================================================================== */

async function postToChinilla(
  offerData: string,
  sharePrivately: boolean,
  testnet: boolean,
): Promise<string> {
  const ipcRenderer = (window as any).ipcRenderer;
  const requestOptions = {
    method: 'POST',
    protocol: 'https:',
    hostname: testnet ? testnetDummyHost : 'chinilla.com',
    port: 443,
    path: testnet
      ? testnetDummyEndpoint
      : '/offer/upload',
  };
  const requestHeaders = {
    'accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  const requestData = `offer=${offerData}` + (sharePrivately ? '&private=true' : '');
  const { err, statusCode, statusMessage, responseBody } =
    await ipcRenderer?.invoke(
      'fetchTextResponse',
      requestOptions,
      requestHeaders,
      requestData,
    );

  if (err || statusCode !== 200) {
    const error = new Error(
      `Chinilla.com Offers upload failed: ${err}, statusCode=${statusCode}, statusMessage=${statusMessage}, response=${responseBody}`,
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

async function postToForgeFarm(
  offerData: string,
  testnet: boolean,
): Promise<string> {
  const ipcRenderer = (window as any).ipcRenderer;
  const requestOptions = {
    method: 'POST',
    protocol: 'https:',
    hostname: testnet ? 'testnet.forgefarm.io' : 'forgefarm.io',
    port: 443,
    path: '/offer',
  };
  const requestHeaders = {
    'Content-Type': 'application/json',
  };
  const requestData = JSON.stringify({ offer: offerData });
  const { err, statusCode, statusMessage, responseBody } =
    await ipcRenderer.invoke(
      'fetchTextResponse',
      requestOptions,
      requestHeaders,
      requestData,
    );

  if (err || (statusCode !== 200 && statusCode !== 400)) {
    const error = new Error(
      `ForgeFarm upload failed: ${err}, statusCode=${statusCode}, statusMessage=${statusMessage}, response=${responseBody}`,
    );
    throw error;
  }

  console.log('ForgeFarm upload completed');

  const {
    offer: { nft_id },
  } = JSON.parse(responseBody);
  const nftId = toBech32m(nft_id, 'nft');

  return `https://${testnet ? 'testnet.' : ''}forgefarm.io/nft/${nftId}`;
}

enum KeybaseCLIActions {
  JOIN_TEAM = 'JOIN_TEAM',
  JOIN_CHANNEL = 'JOIN_CHANNEL',
  UPLOAD_OFFER = 'UPLOAD_OFFER',
  CHECK_TEAM_MEMBERSHIP = 'CHECK_TEAM_MEMBERSHIP',
}

type KeybaseCLIRequest = {
  action: KeybaseCLIActions;
  uploadArgs?: {
    title: string;
    filePath: string;
  };
  teamName: string;
  channelName: string;
};

const KeybaseTeamName = 'chinilla_offers';
const KeybaseChannelName = 'offers-trading';

async function execKeybaseCLI(request: KeybaseCLIRequest): Promise<boolean> {
  const { action, uploadArgs, teamName, channelName } = request;

  return new Promise((resolve, reject) => {
    try {
      const options: any = {};

      if (process.platform === 'darwin') {
        const env = Object.assign({}, process.env);

        // Add /usr/local/bin and a direct path to the keybase binary on macOS.
        // Without these additions, the keybase binary may not be found.
        env.PATH = `${env.PATH}:/usr/local/bin:/Applications/Keybase.app/Contents/SharedSupport/bin`;

        options['env'] = env;
      }

      let command: string | undefined = undefined;

      switch (action) {
        case KeybaseCLIActions.JOIN_TEAM:
          command = `keybase team request-access ${teamName}`;
          break;
        case KeybaseCLIActions.JOIN_CHANNEL:
          command = `keybase chat join-channel ${teamName} '#${channelName}'`;
          break;
        case KeybaseCLIActions.UPLOAD_OFFER:
          const { title, filePath } = uploadArgs!;
          if (title && filePath) {
            command = `keybase chat upload "${teamName}" --channel "${channelName}" --title "${title}" "${filePath}"`;
          } else {
            reject(new Error(`Missing title or filePath in uploadArgs`));
          }
          break;
        case KeybaseCLIActions.CHECK_TEAM_MEMBERSHIP:
          command = 'keybase team list-memberships';
          break;
        default:
          reject(new Error(`Unknown KeybaseCLI action: ${action}`));
          break;
      }

      if (command) {
        child_process.exec(command, options, (error, stdout, stderr) => {
          if (error) {
            console.error(`Keybase error: ${error}`);
            switch (action) {
              case KeybaseCLIActions.CHECK_TEAM_MEMBERSHIP:
                resolve(stdout.indexOf(`${teamName}`) === 0);
                break;
              case KeybaseCLIActions.JOIN_TEAM:
                resolve(stderr.indexOf('(code 2665)') !== -1);
                break;
              default:
                if (stderr.indexOf('(code 2623)') !== -1) {
                  resolve(false);
                } else {
                  reject(
                    new Error(t`Failed to execute Keybase command: ${stderr}`),
                  );
                }
            }
          }

          resolve(true);
        });
      } else {
        reject(new Error(`Missing command for action: ${action}`));
      }
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

async function postToKeybase(
  offerRecord: OfferTradeRecord,
  offerData: string,
  teamName: string,
  channelName: string,
  lookupByAssetId: (assetId: string) => AssetIdMapEntry | undefined,
): Promise<boolean> {
  const filename = suggestedFilenameForOffer(
    offerRecord.summary,
    lookupByAssetId,
  );
  const summary = shortSummaryForOffer(offerRecord.summary, lookupByAssetId);

  let filePath = '';
  let success = false;

  filePath = await writeTempOfferFile(offerData, filename);

  try {
    success = await execKeybaseCLI({
      action: KeybaseCLIActions.UPLOAD_OFFER,
      uploadArgs: { title: summary, filePath },
      teamName,
      channelName,
    });
  } finally {
    if (filePath) {
      fs.unlinkSync(filePath);
    }
  }
  return success;
}

/* ========================================================================== */

function OfferShareChinillaDialog(props: OfferShareServiceDialogProps) {
  const { offerRecord, offerData, testnet, onClose, open } = props;
  const openExternal = useOpenExternal();
  const [sharePrivately, setSharePrivately] = React.useState(false);
  const [sharedURL, setSharedURL] = React.useState('');

  function handleClose() {
    onClose(false);
  }

  async function handleConfirm() {
    const url = await postToChinilla(offerData, sharePrivately, testnet);
    console.log(`Chinilla.com Offers URL (private=${sharePrivately}): ${url}`);
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
          <Flex flexDirection="column" gap={3}>
            <TextField
              label={<Trans>Chinilla.com Offers URL</Trans>}
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
              <Button
                variant="outlined"
                onClick={() => openExternal(sharedURL)}
              >
                <Trans>View on Chinilla.com</Trans>
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
                <Trans>
                  If selected, your offer will be not be shared publicly.
                </Trans>
              </TooltipIcon>
            </>
          }
        />
      }
    />
  );
}

OfferShareChinillaDialog.defaultProps = {
  open: false,
  onClose: () => {},
};

function OfferShareForgeFarmDialog(props: OfferShareServiceDialogProps) {
  const { offerRecord, offerData, testnet, onClose, open } = props;
  const openExternal = useOpenExternal();
  const [sharedURL, setSharedURL] = React.useState('');

  function handleClose() {
    onClose(false);
  }

  async function handleConfirm() {
    const url = await postToForgeFarm(offerData, testnet);
    console.log(`ForgeFarm URL: ${url}`);
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
          <Flex flexDirection="column" gap={3}>
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
              <Button
                variant="outlined"
                onClick={() => openExternal(sharedURL)}
              >
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
      title={<Trans>Share on ForgeFarm</Trans>}
      onConfirm={handleConfirm}
      open={open}
      onClose={onClose}
    />
  );
}

OfferShareForgeFarmDialog.defaultProps = {
  open: false,
  onClose: () => {},
};

function OfferShareKeybaseDialog(props: OfferShareServiceDialogProps) {
  const { offerRecord, offerData, testnet, onClose, open } = props;
  const { lookupByAssetId } = useAssetIdName();
  const showError = useShowError();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isJoiningTeam, setIsJoiningTeam] = React.useState(false);
  const [shared, setShared] = React.useState(false);
  const teamName = testnet ? 'testhcxoffersdev' : KeybaseTeamName;
  const channelName = testnet ? 'offers' : KeybaseChannelName;

  function handleClose() {
    onClose(false);
  }

  async function handleKeybaseInstall() {
    try {
      const shell: Shell = (window as any).shell;
      await shell.openExternal('https://keybase.io/download');
    } catch (e) {
      showError(
        new Error(
          t`Unable to open browser. Install Keybase from https://keybase.io`,
        ),
      );
    }
  }

  async function handleKeybaseJoinTeam() {
    setIsJoiningTeam(true);

    try {
      const shell: Shell = (window as any).shell;
      const joinTeamSucceeded = await execKeybaseCLI({
        action: KeybaseCLIActions.JOIN_TEAM,
        teamName,
        channelName,
      });
      let joinTeamThroughURL = false;
      if (joinTeamSucceeded) {
        let attempts = 0;
        let isMember = false;
        while (attempts < 20) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          isMember = await execKeybaseCLI({
            action: KeybaseCLIActions.CHECK_TEAM_MEMBERSHIP,
            teamName,
            channelName,
          });

          if (isMember) {
            console.log('Joined team successfully');
            break;
          }

          attempts++;
        }

        if (isMember) {
          attempts = 0;
          let joinChannelSucceeded = false;
          while (attempts < 30) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            joinChannelSucceeded = await execKeybaseCLI({
              action: KeybaseCLIActions.JOIN_CHANNEL,
              teamName,
              channelName,
            });

            if (joinChannelSucceeded) {
              break;
            }

            attempts++;
          }

          if (joinChannelSucceeded) {
            console.log('Joined channel successfully');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await shell.openExternal(
              `keybase://chat/${teamName}#${channelName}`,
            );
          } else {
            console.error('Failed to join channel');
            shell.openExternal(`keybase://chat/${teamName}#${channelName}`);
          }
        } else {
          console.error('Failed to join team');
          joinTeamThroughURL = true;
        }
      } else {
        joinTeamThroughURL = true;
      }

      if (joinTeamThroughURL) {
        await shell.openExternal(`keybase://team-page/${teamName}/join`);
      }
    } catch (e) {
      showError(
        new Error(
          t`Keybase command failed ${e}. If you haven't installed Keybase, you can download from https://keybase.io`,
        ),
      );
    } finally {
      setIsJoiningTeam(false);
    }
  }

  async function handleKeybaseGoToChannel() {
    try {
      const shell: Shell = (window as any).shell;
      await shell.openExternal(`keybase://chat/${teamName}#${channelName}`);
    } catch (e) {
      showError(
        new Error(
          t`Unable to open Keybase. Install Keybase from https://keybase.io`,
        ),
      );
    }
  }

  async function handleKeybaseShare() {
    let success = false;

    try {
      setIsSubmitting(true);
      success = await postToKeybase(
        offerRecord,
        offerData,
        teamName,
        channelName,
        lookupByAssetId,
      );

      if (success) {
        setShared(true);
      }
    } catch (e) {
      showError(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (shared) {
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
          <Flex flexDirection="column" gap={3}>
            <Trans>Your offer has been successfully posted to Keybase.</Trans>
          </Flex>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleKeybaseGoToChannel} variant="outlined">
            <Trans>Go to #{channelName}</Trans>
          </Button>
          <Button onClick={handleClose} color="primary" variant="contained">
            <Trans>Close</Trans>
          </Button>
        </DialogActions>
      </Dialog>
    );
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
      <DialogTitle id="alert-dialog-title">
        <Trans>Share on Keybase</Trans>
      </DialogTitle>
      <DialogContent dividers>
        <Flex flexDirection="column" gap={2}>
          <Typography variant="body2">
            <Trans>
              Keybase is a secure messaging and file sharing application. To
              share an offer in the Keybase {teamName} team, you must first have
              Keybase installed.
            </Trans>
          </Typography>
          <Flex justifyContent="center" flexGrow={0}>
            <Button onClick={handleKeybaseInstall} variant="outlined">
              <Trans>Install Keybase</Trans>
            </Button>
          </Flex>
          <Divider />
          <Typography variant="body2">
            <Trans>
              Before posting an offer in Keybase to the #{channelName} channel,
              you must first join the {teamName} team. Please note that it might
              take a few moments to join the channel.
            </Trans>
          </Typography>
          <Flex justifyContent="center" flexGrow={0}>
            <ButtonLoading
              onClick={handleKeybaseJoinTeam}
              variant="outlined"
              loading={isJoiningTeam}
            >
              <Trans>Join {teamName}</Trans>
            </ButtonLoading>
          </Flex>
        </Flex>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleKeybaseGoToChannel}
          color="primary"
          variant="contained"
        >
          <Trans>Go to #{channelName}</Trans>
        </Button>
        <Flex flexGrow={1}></Flex>
        <Button
          onClick={handleClose}
          color="primary"
          variant="contained"
          disabled={isSubmitting}
        >
          <Trans>Cancel</Trans>
        </Button>
        <ButtonLoading
          onClick={handleKeybaseShare}
          variant="outlined"
          loading={isSubmitting}
        >
          <Trans>Share</Trans>
        </ButtonLoading>
      </DialogActions>
    </Dialog>
  );
}

OfferShareKeybaseDialog.defaultProps = {
  open: false,
  onClose: () => {},
};

/* ========================================================================== */

type OfferShareConfirmationDialogProps = CommonOfferProps &
  CommonDialogProps & {
    title: React.ReactElement;
    onConfirm: () => Promise<void>;
    actions?: React.ReactElement;
  };

function OfferShareConfirmationDialog(
  props: OfferShareConfirmationDialogProps,
) {
  const {
    offerRecord,
    offerData,
    testnet,
    title,
    onConfirm,
    actions = null,
    onClose,
    open,
  } = props;
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
            isMyOffer={true}
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
            showNFTPreview={true}
          />
        </Flex>
      </DialogContent>
      <DialogActions>
        {actions}
        <Flex flexGrow={1}></Flex>
        <Button
          onClick={handleClose}
          color="primary"
          variant="contained"
          disabled={isSubmitting}
        >
          <Trans>Cancel</Trans>
        </Button>
        <ButtonLoading
          onClick={handleConfirm}
          variant="outlined"
          loading={isSubmitting}
        >
          <Trans>Share</Trans>
        </ButtonLoading>
      </DialogActions>
    </Dialog>
  );
}

/* ========================================================================== */

type OfferShareDialogProps = CommonOfferProps &
  CommonDialogProps & {
    showSuppressionCheckbox: boolean;
    exportOffer?: () => void;
  };

interface OfferShareDialogProvider extends OfferSharingProvider {
  dialogComponent: React.FunctionComponent<OfferShareServiceDialogProps>;
  props: {};
}

export default function OfferShareDialog(props: OfferShareDialogProps) {
  const {
    offerRecord,
    offerData,
    showSuppressionCheckbox,
    testnet,
    exportOffer,
    onClose,
    open,
  } = props;
  const openDialog = useOpenDialog();
  const [suppressShareOnCreate, setSuppressShareOnCreate] =
    useLocalStorage<boolean>(OfferLocalStorageKeys.SUPPRESS_SHARE_ON_CREATE);
  const isNFTOffer = offerContainsAssetOfType(offerRecord.summary, 'singleton');

  const shareOptions: OfferShareDialogProvider[] = useMemo(() => {
    const capabilities = isNFTOffer
      ? [OfferSharingCapability.NFT]
      : [OfferSharingCapability.Token];

    const dialogComponents: {
      [key in OfferSharingService]: {
        component: React.FunctionComponent<OfferShareServiceDialogProps>;
        props: any;
      };
    } = {
      [OfferSharingService.Chinilla]: {
        component: OfferShareChinillaDialog,
        props: {},
      },
      [OfferSharingService.ForgeFarm]: {
        component: OfferShareForgeFarmDialog,
        props: {},
      },
      [OfferSharingService.Keybase]: {
        component: OfferShareKeybaseDialog,
        props: {},
      },
    };

    const options = Object.keys(OfferSharingService)
      .filter((key) => OfferSharingProviders.hasOwnProperty(key))
      .filter((key) =>
        OfferSharingProviders[key as OfferSharingService].capabilities.some(
          (cap) => capabilities.includes(cap),
        ),
      )
      .map((key) => {
        const { component, props } =
          dialogComponents[key as OfferSharingService];
        return {
          ...OfferSharingProviders[key as OfferSharingService],
          dialogComponent: component,
          dialogProps: props,
        };
      });

    return options;
  }, [isNFTOffer]);

  function handleClose() {
    onClose(false);
  }

  async function handleShare(dialogProvider: OfferShareDialogProvider) {
    const DialogComponent = dialogProvider.dialogComponent;
    const props = dialogProvider.props;

    await openDialog(
      <DialogComponent
        offerRecord={offerRecord}
        offerData={offerData}
        testnet={testnet}
        {...props}
      />,
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
            <Typography variant="subtitle1">
              Where would you like to share your offer?
            </Typography>
            <Flex flexDirection="column" gap={3}>
              {shareOptions.map((dialogProvider, index) => {
                return (
                  <Button
                    variant="outlined"
                    onClick={() => handleShare(dialogProvider)}
                    key={index}
                  >
                    {dialogProvider.name}
                  </Button>
                );
              })}
              {exportOffer !== undefined && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={exportOffer}
                >
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

OfferShareDialog.defaultProps = {
  open: false,
  onClose: () => {},
  showSuppressionCheckbox: false,
  testnet: false,
};
