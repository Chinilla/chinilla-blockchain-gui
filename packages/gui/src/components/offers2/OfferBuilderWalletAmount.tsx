import { useWallet } from '@chinilla/wallets';
import { Trans } from '@lingui/macro';
import React from 'react';

import OfferBuilderValue from './OfferBuilderValue';
import OfferBuilderWalletBalance from './OfferBuilderWalletBalance';

export type OfferBuilderWalletAmountProps = {
  name: string;
  walletId: number;
  label?: ReactNode;
  onRemove?: () => void;
  showAmountInVojos?: boolean;
  hideBalance?: boolean;
  amountWithRoyalties?: string;
  royaltyPayments?: Record<string, any>[];
};

export default function OfferBuilderWalletAmount(props: OfferBuilderWalletAmountProps) {
  const {
    walletId,
    name,
    onRemove,
    showAmountInVojos,
    hideBalance = false,
    label,
    amountWithRoyalties,
    royaltyPayments,
  } = props;

  const { unit = '' } = useWallet(walletId);

  return (
    <OfferBuilderValue
      name={name}
      label={label ?? (amountWithRoyalties ? <Trans>Total Amount</Trans> : <Trans>Amount</Trans>)}
      type="amount"
      symbol={unit}
      showAmountInVojos={showAmountInVojos}
      caption={walletId !== undefined && !hideBalance && <OfferBuilderWalletBalance walletId={walletId} />}
      onRemove={onRemove}
      amountWithRoyalties={amountWithRoyalties}
      royaltyPayments={royaltyPayments}
    />
  );
}
