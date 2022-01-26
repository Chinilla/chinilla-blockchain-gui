import type Wallet from '../types/Wallet';
import WalletType from '../constants/WalletType';
import { chin_to_colouredcoin_string, chin_to_chinilla_string } from './chinilla';

export default function getWalletHumanValue(wallet: Wallet, value: number): string {
  return wallet.type === WalletType.CAT
    ? chin_to_colouredcoin_string(value)
    : chin_to_chinilla_string(value);
}
