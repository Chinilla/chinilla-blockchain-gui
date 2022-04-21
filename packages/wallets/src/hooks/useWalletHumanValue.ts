import { useMemo } from 'react';
import type { Wallet } from '@chinilla/api';
import { WalletType } from '@chinilla/api';
import BigNumber from 'bignumber.js';
import { vojoToCATLocaleString, vojoToChinillaLocaleString, useLocale } from '@chinilla/core';

export default function useWalletHumanValue(wallet: Wallet, value?: string | number | BigNumber, unit?: string): string {
  const [locale] = useLocale();
  
  return useMemo(() => {
    if (wallet && value !== undefined) {
      const localisedValue = wallet.type === WalletType.CAT
        ? vojoToCATLocaleString(value, locale)
        : vojoToChinillaLocaleString(value, locale);

      return `${localisedValue} ${unit}`;
    }

    return '';
  }, [wallet, value, unit, locale]);
}
