import Big from 'big.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function chinToCATLocaleString(chin: string | number | Big) {
  return chinillaFormatter(Number(chin), Unit.CHIN)
    .to(Unit.CAT)
    .toLocaleString();
}