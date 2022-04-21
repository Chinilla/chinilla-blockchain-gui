import { WalletType, type Wallet } from '@chinilla/api';

export default function getWalletPrimaryTitle(wallet: Wallet): string {
  switch (wallet.type) {
    case WalletType.STANDARD_WALLET:
      return 'Chinilla';
    default:
      return wallet.name;
  }
}
