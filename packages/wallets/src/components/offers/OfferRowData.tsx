import { type WalletType } from '@chinilla/api';

type OfferRowData = {
  amount: number | string;
  assetWalletId: number | undefined; // undefined if no selection made
  walletType: WalletType;
};

export default OfferRowData;
