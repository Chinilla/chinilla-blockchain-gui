import type { NFTInfo } from '@chinilla/api';
import { useCurrencyCode } from '@chinilla/core';

import useOpenExternal from './useOpenExternal';

/* ========================================================================== */

function getForgeFarmURL(nft: NFTInfo, testnet: boolean) {
  const url = `https://${testnet ? 'testnet.' : ''}forgefarm.io/nfts/${nft.$nftId}`;
  return url;
}

function getSpacescanURL(nft: NFTInfo, testnet: boolean) {
  const url = `https://spacescan.io/${testnet ? 'thcx10' : 'hcx'}/nft/${nft.$nftId}`;
  return url;
}

/* ========================================================================== */

export enum NFTExplorer {
  ForgeFarm = 'forgefarm',
  Spacescan = 'spacescan',
}

const UrlBuilderMapping = {
  [NFTExplorer.ForgeFarm]: getForgeFarmURL,
  [NFTExplorer.Spacescan]: getSpacescanURL,
};

export default function useViewNFTOnExplorer() {
  const openExternal = useOpenExternal();
  const testnet = useCurrencyCode() === 'THCX';

  function handleViewNFTOnExplorer(nft: NFTInfo, explorer: NFTExplorer) {
    const urlBuilder = UrlBuilderMapping[explorer];
    const url = urlBuilder(nft, testnet);

    openExternal(url);
  }

  return handleViewNFTOnExplorer;
}
