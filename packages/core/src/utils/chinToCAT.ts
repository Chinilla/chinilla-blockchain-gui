import Big from 'big.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function chinToCAT(chin: string | number | Big): number {
  return chinillaFormatter(chin, Unit.CHIN)
    .to(Unit.CAT)
    .toNumber();
}