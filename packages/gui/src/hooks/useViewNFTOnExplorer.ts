import React from 'react';
import type { NFTInfo } from '@chinilla/api';
import { useCurrencyCode } from '@chinilla/core';
import useOpenExternal from './useOpenExternal';

/* ========================================================================== */

function getForgeFarmURL(nft: NFTInfo, testnet: boolean) {
  const url = `https://${testnet ? 'testnet.' : ''}forgefarm.io/nft/${
    nft.$nftId
  }`;
  return url;
}

/* ========================================================================== */

export enum NFTExplorer {
  ForgeFarm = 'forgefarm',
}

const UrlBuilderMapping = {
  [NFTExplorer.ForgeFarm]: getForgeFarmURL,
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
