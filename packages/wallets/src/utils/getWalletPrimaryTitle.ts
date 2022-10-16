import { WalletType } from '@chinilla/api';
import type { Wallet } from '@chinilla/api';

export default function getWalletPrimaryTitle(wallet: Wallet): string {
  switch (wallet.type) {
    case WalletType.STANDARD_WALLET:
      return 'Chinilla';
    default:
      return wallet.meta?.name ?? wallet.name;
  }
}
