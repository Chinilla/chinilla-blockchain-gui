import { Wallet, WalletType } from '@chinilla/api';
import { useMemo } from 'react';

import { useGetWalletsQuery } from '../services';

export default function useGetNFTWallets() {
  const { data, isLoading } = useGetWalletsQuery();
  const nftWallets = useMemo(() => {
    if (!data || isLoading) {
      return [];
    }

    return data.filter((wallet: Wallet) => wallet.type === WalletType.NFT);
  }, [data]);

  return { wallets: nftWallets, isLoading };
}
