import { vojoToCAT, vojoToChinilla } from '@chinilla/core';
import BigNumber from 'bignumber.js';
import type OfferBuilderData from '../@types/OfferBuilderData';
import type OfferSummary from '../@types/OfferSummary';
import { launcherIdToNFTId } from '../util/nfts';

export default function offerToOfferBuilderData(
  offerSummary: OfferSummary,
): OfferBuilderData {
  const { fees, offered, requested, infos } = offerSummary;

  const offeredHcx: OfferBuilderData['offered']['hcx'] = [];
  const offeredTokens: OfferBuilderData['offered']['tokens'] = [];
  const offeredNfts: OfferBuilderData['offered']['nfts'] = [];
  const requestedHcx: OfferBuilderData['requested']['hcx'] = [];
  const requestedTokens: OfferBuilderData['requested']['tokens'] = [];
  const requestedNfts: OfferBuilderData['requested']['nfts'] = [];

  // processing requested first because it's what you/we will give

  Object.keys(requested).forEach((id) => {
    const amount = new BigNumber(requested[id]);
    const info = infos[id];

    if (info?.type === 'CAT') {
      offeredTokens.push({
        amount: vojoToCAT(amount).toFixed(),
        assetId: id,
      });
    } else if (info?.type === 'singleton') {
      offeredNfts.push({
        nftId: launcherIdToNFTId(info.launcherId),
      });
    } else if (id === 'hcx') {
      offeredHcx.push({
        amount: vojoToChinilla(amount).toFixed(),
      });
    }
  });

  Object.keys(offered).forEach((id) => {
    const amount = new BigNumber(offered[id]);
    const info = infos[id];

    if (info?.type === 'CAT') {
      requestedTokens.push({
        amount: vojoToCAT(amount).toFixed(),
        assetId: id,
      });
    } else if (info?.type === 'singleton') {
      requestedNfts.push({
        nftId: launcherIdToNFTId(info.launcherId),
      });
    } else if (id === 'hcx') {
      requestedHcx.push({
        amount: vojoToChinilla(amount).toFixed(),
      });
    }
  });

  return {
    offered: {
      hcx: offeredHcx,
      tokens: offeredTokens,
      nfts: offeredNfts,
      fee: [],
    },
    requested: {
      hcx: requestedHcx,
      tokens: requestedTokens,
      nfts: requestedNfts,
      fee: [
        {
          amount: vojoToChinilla(fees).toFixed(),
        },
      ],
    },
  };
}
