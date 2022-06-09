import React from 'react';
import type { NFTInfo } from '@chinilla/api';
import { useCurrencyCode } from '@chinilla/core';
import useOpenExternal from './useOpenExternal';

/* ========================================================================== */

function getBlexieURL(nft: NFTInfo, testnet: boolean) {
  const url = `https://${testnet ? 'testnet.' : ''}blexie.com/nft/${
    nft.$nftId
  }`;
  return url;
}

/* ========================================================================== */

export enum NFTExplorer {
  Blexie = 'blexie',
}

const UrlBuilderMapping = {
  [NFTExplorer.Blexie]: getBlexieURL,
};

export default function useViewNFTOnExplorer() {
  const openExternal = useOpenExternal();
  const testnet = useCurrencyCode() === 'THCX';

  function handleViewNFTOnExplorer(nft: NFTInfo, explorer: NFTExplorer) {
    const { nftId: $nftId } = nft;
    const urlBuilder = UrlBuilderMapping[explorer];
    const url = urlBuilder(nft, testnet);

    openExternal(url);
  }

  return handleViewNFTOnExplorer;
}
