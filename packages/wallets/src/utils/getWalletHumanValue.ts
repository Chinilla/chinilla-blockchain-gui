import type { Wallet } from '@chinilla/api';
import { WalletType } from '@chinilla/api';
import { vojoToCATLocaleString, vojoToChinillaLocaleString } from '@chinilla/core';

export default function getWalletHumanValue(wallet: Wallet, value: number): string {
  return wallet.type === WalletType.CAT
    ? vojoToCATLocaleString(value)
    : vojoToChinillaLocaleString(value);
}
