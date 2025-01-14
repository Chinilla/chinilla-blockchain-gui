import { WalletType } from '@chinilla/api';
import { useGetCatListQuery, useGetWalletsQuery } from '@chinilla/api-react';
import { CATToken, Wallet, useCurrencyCode } from '@chinilla/core';
import { useMemo } from 'react';

export type AssetIdMapEntry = {
  walletId: number;
  walletType: WalletType;
  isVerified: boolean;
  name: string;
  symbol?: string;
  displayName: string;
};

export default function useAssetIdName() {
  const { data: wallets, isLoading } = useGetWalletsQuery();
  const { data: catList = [], isLoading: isCatListLoading } = useGetCatListQuery();
  const currencyCode = useCurrencyCode();

  const memoized = useMemo(() => {
    const assetIdNameMapping = new Map<string, AssetIdMapEntry>();
    const walletIdNameMapping = new Map<number, AssetIdMapEntry>();

    if (isLoading || isCatListLoading) {
      return { assetIdNameMapping, walletIdNameMapping };
    }

    wallets.map((wallet: Wallet) => {
      const walletId: number = wallet.id;
      const walletType: WalletType = wallet.type;
      let assetId: string | undefined;
      let name: string | undefined;
      let symbol: string | undefined;
      let isVerified = false;

      if (walletType === WalletType.STANDARD_WALLET) {
        assetId = 'hcx';
        name = 'Chinilla';
        symbol = currencyCode;
        isVerified = true;
      } else if (walletType === WalletType.CAT) {
        const lowercaseTail = wallet.meta.assetId.toLowerCase();
        const cat = catList.find((catItem: CATToken) => catItem.assetId.toLowerCase() === lowercaseTail);

        assetId = lowercaseTail;
        name = wallet.name;

        if (cat) {
          symbol = cat.symbol;
          isVerified = true;
        }
      }

      if (assetId && name) {
        const displayName = symbol || name;
        const entry: AssetIdMapEntry = {
          walletId,
          walletType,
          name,
          symbol,
          displayName,
          isVerified,
        };
        assetIdNameMapping.set(assetId, entry);
        walletIdNameMapping.set(walletId, entry);
      }
    });

    catList.map((cat: CATToken) => {
      if (assetIdNameMapping.has(cat.assetId)) {
        return;
      }

      const { assetId } = cat;
      const { name } = cat;
      const { symbol } = cat;
      const displayName = symbol || name;
      const entry: AssetIdMapEntry = {
        walletId: 0,
        walletType: WalletType.CAT,
        name,
        symbol,
        displayName,
        isVerified: true,
      };
      assetIdNameMapping.set(assetId, entry);
    });

    // If using testnet, add a THCX assetId entry
    if (currencyCode === 'THCX') {
      const assetId = 'thcx';
      const name = 'Chinilla (Testnet)';
      const symbol = 'THCX';
      const displayName = symbol || name;
      const entry: AssetIdMapEntry = {
        walletId: 1,
        walletType: WalletType.STANDARD_WALLET,
        name,
        symbol,
        displayName,
        isVerified: true,
      };
      assetIdNameMapping.set(assetId, entry);
    }

    return { assetIdNameMapping, walletIdNameMapping };
  }, [catList, wallets, isCatListLoading, isLoading]);

  function lookupByAssetId(assetId: string): AssetIdMapEntry | undefined {
    return memoized.assetIdNameMapping.get(assetId.toLowerCase());
  }

  function lookupByWalletId(walletId: number | string): AssetIdMapEntry | undefined {
    return memoized.walletIdNameMapping.get(Number(walletId));
  }

  return { lookupByAssetId, lookupByWalletId };
}
