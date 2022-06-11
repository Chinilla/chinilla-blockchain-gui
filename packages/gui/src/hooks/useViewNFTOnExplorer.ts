import React from 'react';
import type { NFTInfo } from '@chinilla/api';
import { useCurrencyCode } from '@chinilla/core';
import useOpenExternal from './useOpenExternal';
import { slice } from 'lodash';

/* ========================================================================== */

function getForgeFarmURL(nft: NFTInfo, testnet: boolean) {
  const url = `https://${testnet ? 'testnet.' : ''}forgefarm.io/nfts/${
    nft.$nftId
  }`;
  return url;
}

function getSkyNFTURL(nft: NFTInfo, testnet: boolean) {
  const launcherId = nft.launcherId.startsWith('0x')
    ? nft.launcherId.substring(2)
    : nft.launcherId;
  const url = `https://${
    testnet ? 'test.' : ''
  }skynft.org/item.php?launcher_id=${launcherId}`;
  return url;
}

function getSpacescanURL(nft: NFTInfo, testnet: boolean) {
  const url = `https://spacescan.io/${testnet ? 'txch10' : 'xch'}/nft/${
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
