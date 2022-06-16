import React from 'react';
import { Flex } from '@chinilla/core';
import { type NFTInfo } from '@chinilla/api';
import { Dialog } from '@mui/material';
import NFTPreview from './NFTPreview';

type NFTPreviewDialogProps = {
  nft: NFTInfo;
  open?: boolean;
  onClose?: () => void;
};

export default function NFTPreviewDialog(props: NFTPreviewDialogProps) {
  const { nft, onClose = () => ({}), open = false, ...rest } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperComponent={({ children }) => (
        <Flex width="95vw" height="95vh" onClick={onClose} justifyContent="center" alignItems="center" position="relative">
          {children}
        </Flex>
      )}
      {...rest}
    >
      <NFTPreview nft={nft} width="100%" height="100%" fit="contain" />
    </Dialog>
  );
}
