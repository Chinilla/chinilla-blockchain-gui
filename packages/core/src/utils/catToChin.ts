import Big from 'big.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function catToChin(cat: string | number | Big): string {
  return chinillaFormatter(cat, Unit.CAT)
    .to(Unit.CHIN)
    .toString();
}