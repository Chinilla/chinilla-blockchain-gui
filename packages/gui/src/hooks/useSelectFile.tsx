<<<<<<< HEAD
import React from 'react';
import isElectron from 'is-electron';
import { Trans } from '@lingui/macro';
import { AlertDialog, useOpenDialog } from '@chia/core';
=======
import { useShowSaveDialog, useShowError } from '@chia/core';
>>>>>>> 207cb1a67d4bce2ecd46a9125678de02d66d71b1

export default function useSelectFile(): () => Promise<string | undefined> {
  const showSaveDialog = useShowSaveDialog();
  const showError = useShowError();

  async function handleSelect(): Promise<string | undefined> {
<<<<<<< HEAD
    if (isElectron()) {
      // @ts-ignore
      const result = await window.ipcRenderer?.send('showSaveDialog',{});
=======
    try {
      const result = await showSaveDialog();
>>>>>>> 207cb1a67d4bce2ecd46a9125678de02d66d71b1
      const { filePath } = result;

      return filePath;
    } catch (error: any) {
      showError(error);
    }
  }

  return handleSelect;
}
