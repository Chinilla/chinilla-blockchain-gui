import type { Wallet } from '@chinilla/api';
import { WalletType } from '@chinilla/api';
import { chinToCATLocaleString, chinToChinillaLocaleString } from '@chinilla/core';

export default function getWalletHumanValue(wallet: Wallet, value: number): string {
  return wallet.type === WalletType.CAT
    ? chinToCATLocaleString(value)
    : chinToChinillaLocaleString(value);
}
