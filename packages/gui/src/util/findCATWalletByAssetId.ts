import type { Wallet } from '@chinilla/api';
import { WalletType } from '@chinilla/api';

export default function findCATWalletByAssetId(
  wallets: Wallet[],
  assetId: string,
) {
  return wallets.find(
    (wallet) =>
      wallet.type === WalletType.CAT &&
      wallet.meta?.assetId?.toLowerCase() === assetId.toLowerCase(),
  );
}
