import { WalletType } from '@chinilla/api';
import type { Wallet } from '@chinilla/api';
import { useGetWalletsQuery, useGetCatListQuery } from '@chinilla/api-react';
import { useCurrencyCode } from '@chinilla/core';
import { useMemo } from 'react';

export default function useWallet(walletId?: number | string): {
  loading: boolean;
  wallet?: Wallet;
  unit?: string;
} {
  const currencyCode = useCurrencyCode();
  const { data: wallets, isLoading } = useGetWalletsQuery();
  const { data: catList = [], isLoading: isCatListLoading } = useGetCatListQuery();

  const wallet = useMemo(
    () => wallets?.find((item) => item.id.toString() === walletId?.toString()),
    [wallets, walletId]
  );

  const unit = useMemo(() => {
    if (wallet) {
      if (!isCatListLoading && wallet.type === WalletType.CAT) {
        const token = catList.find((item) => item.assetId === wallet.meta?.assetId);
        if (token) {
          return token.symbol;
        }

        return undefined;
      }

      return currencyCode;
    }
    return undefined;
  }, [wallet, currencyCode, isCatListLoading]);

  return {
    wallet,
    loading: isLoading,
    unit,
  };
}
